#!/bin/bash
# Backup Script for Production Deployment
set -e

echo "📦 Creating backup before deployment..."

# Configuration
BACKUP_DIR="/opt/jobportal/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to backup database
backup_database() {
    echo "🗃️ Backing up MySQL database..."
    
    # Load MySQL password from environment
    if [ -f .env.secrets ]; then
        source .env.secrets
    fi
    
    docker exec jobportal-mysql-prod mysqldump \
        -u root -p"${MYSQL_ROOT_PASSWORD}" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --add-drop-table \
        --create-options \
        jobportal > "${BACKUP_DIR}/database_backup_${DATE}.sql"
    
    # Compress the backup
    gzip "${BACKUP_DIR}/database_backup_${DATE}.sql"
    
    echo "✅ Database backup completed: database_backup_${DATE}.sql.gz"
}

# Function to backup application uploads
backup_uploads() {
    echo "📁 Backing up application uploads..."
    
    docker run --rm \
        -v jobportal_app_uploads:/data:ro \
        -v "${BACKUP_DIR}:/backup" \
        alpine:3.18 \
        tar czf "/backup/uploads_backup_${DATE}.tar.gz" /data
    
    echo "✅ Uploads backup completed: uploads_backup_${DATE}.tar.gz"
}

# Function to backup configuration files
backup_configs() {
    echo "⚙️ Backing up configuration files..."
    
    tar czf "${BACKUP_DIR}/config_backup_${DATE}.tar.gz" \
        docker-compose.prod.yml \
        nginx/nginx.prod.conf \
        .env.prod \
        .env.secrets \
        monitoring/ \
        scripts/ 2>/dev/null || true
    
    echo "✅ Configuration backup completed: config_backup_${DATE}.tar.gz"
}

# Function to backup current Docker images
backup_images() {
    echo "🐳 Backing up current Docker images..."
    
    # Get current image tags
    local current_backend=$(docker inspect jobportal-app-prod --format='{{.Config.Image}}' 2>/dev/null || echo "none")
    local current_frontend=$(docker inspect jobportal-nginx-prod --format='{{.Config.Image}}' 2>/dev/null || echo "none")
    
    # Save image information
    cat > "${BACKUP_DIR}/images_backup_${DATE}.txt" << EOF
# Docker Image Backup Information
# Created: $(date)
BACKEND_IMAGE=${current_backend}
FRONTEND_IMAGE=${current_frontend}

# To restore these images:
# docker pull ${current_backend}
# docker pull ${current_frontend}
EOF
    
    echo "✅ Image backup info saved: images_backup_${DATE}.txt"
}

# Function to upload to S3 (if configured)
upload_to_s3() {
    if [ -n "${S3_BUCKET}" ] && [ -n "${AWS_ACCESS_KEY_ID}" ]; then
        echo "☁️ Uploading backups to S3..."
        
        aws s3 cp "${BACKUP_DIR}/database_backup_${DATE}.sql.gz" \
            "s3://${S3_BUCKET}/backups/database/" 2>/dev/null || echo "⚠️ S3 upload failed for database"
        
        aws s3 cp "${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz" \
            "s3://${S3_BUCKET}/backups/uploads/" 2>/dev/null || echo "⚠️ S3 upload failed for uploads"
        
        aws s3 cp "${BACKUP_DIR}/config_backup_${DATE}.tar.gz" \
            "s3://${S3_BUCKET}/backups/config/" 2>/dev/null || echo "⚠️ S3 upload failed for config"
        
        echo "✅ Backups uploaded to S3"
    else
        echo "ℹ️ S3 backup not configured, skipping cloud upload"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    # Remove local backups older than retention period
    find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    find "${BACKUP_DIR}" -name "*.txt" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
    
    # Cleanup S3 backups if configured
    if [ -n "${S3_BUCKET}" ] && [ -n "${AWS_ACCESS_KEY_ID}" ]; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" --recursive | \
            awk '$1 <= "'$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)'" {print $4}' | \
            while read -r file; do
                aws s3 rm "s3://${S3_BUCKET}/$file" 2>/dev/null || true
            done
    fi
    
    echo "✅ Cleanup completed"
}

# Function to create backup summary
create_summary() {
    local summary_file="${BACKUP_DIR}/backup_summary_${DATE}.txt"
    
    cat > "$summary_file" << EOF
# Backup Summary
Created: $(date)
Backup ID: ${DATE}

## Files Created:
- Database: database_backup_${DATE}.sql.gz ($(du -h "${BACKUP_DIR}/database_backup_${DATE}.sql.gz" 2>/dev/null | cut -f1 || echo "N/A"))
- Uploads: uploads_backup_${DATE}.tar.gz ($(du -h "${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A"))
- Config: config_backup_${DATE}.tar.gz ($(du -h "${BACKUP_DIR}/config_backup_${DATE}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A"))
- Images: images_backup_${DATE}.txt

## Container Status:
$(docker ps --filter name=jobportal --format "table {{.Names}}\t{{.Status}}")

## Disk Usage:
$(df -h "${BACKUP_DIR}")

## To restore this backup:
1. Stop current deployment: docker-compose -f docker-compose.prod.yml down
2. Restore database: gunzip -c database_backup_${DATE}.sql.gz | docker exec -i jobportal-mysql-prod mysql -u root -p jobportal
3. Restore uploads: docker run --rm -v jobportal_app_uploads:/data -v ${BACKUP_DIR}:/backup alpine tar xzf /backup/uploads_backup_${DATE}.tar.gz -C /
4. Restore config: tar xzf config_backup_${DATE}.tar.gz
5. Start deployment: docker-compose -f docker-compose.prod.yml up -d
EOF
    
    echo "📋 Backup summary created: backup_summary_${DATE}.txt"
}

# Main execution
main() {
    echo "🚀 Starting backup process..."
    echo "Timestamp: $(date)"
    echo "Backup ID: ${DATE}"
    
    # Create all backups
    backup_database
    backup_uploads
    backup_configs
    backup_images
    
    # Upload to cloud if configured
    upload_to_s3
    
    # Create summary
    create_summary
    
    # Cleanup old backups
    cleanup_old_backups
    
    echo ""
    echo "✅ BACKUP COMPLETED SUCCESSFULLY"
    echo "Backup ID: ${DATE}"
    echo "Location: ${BACKUP_DIR}"
    echo ""
}

# Run main function
main "$@"