#!/bin/bash
# Rollback Script for Production Deployment
set -e

echo "🔄 Starting rollback process..."

# Configuration
BACKUP_DIR="/opt/jobportal/backups"

# Function to show available backups
show_available_backups() {
    echo "📋 Available backups:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR" | grep backup_summary | sort -r | head -10 | while read -r line; do
            local filename=$(echo "$line" | awk '{print $9}')
            local backup_id=$(echo "$filename" | sed 's/backup_summary_\(.*\)\.txt/\1/')
            local date=$(echo "$line" | awk '{print $6, $7, $8}')
            echo "  📦 Backup ID: $backup_id (Created: $date)"
        done
    else
        echo "  ❌ No backups directory found"
        return 1
    fi
}

# Function to get latest backup
get_latest_backup() {
    if [ -d "$BACKUP_DIR" ]; then
        ls -1 "$BACKUP_DIR"/backup_summary_*.txt 2>/dev/null | \
            sed 's/.*backup_summary_\(.*\)\.txt/\1/' | \
            sort -r | head -1
    fi
}

# Function to rollback to specific backup
rollback_to_backup() {
    local backup_id="$1"
    
    if [ -z "$backup_id" ]; then
        echo "❌ No backup ID provided"
        return 1
    fi
    
    echo "🔄 Rolling back to backup: $backup_id"
    
    # Check if backup exists
    if [ ! -f "$BACKUP_DIR/backup_summary_${backup_id}.txt" ]; then
        echo "❌ Backup $backup_id not found"
        return 1
    fi
    
    # Stop current services
    echo "🛑 Stopping current services..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Restore database
    echo "🗃️ Restoring database..."
    if [ -f "$BACKUP_DIR/database_backup_${backup_id}.sql.gz" ]; then
        # Start only MySQL for restoration
        docker-compose -f docker-compose.prod.yml up -d mysql
        
        # Wait for MySQL to be ready
        echo "⏳ Waiting for MySQL to start..."
        sleep 30
        
        # Restore database
        gunzip -c "$BACKUP_DIR/database_backup_${backup_id}.sql.gz" | \
            docker exec -i jobportal-mysql-prod mysql -u root -p"${MYSQL_ROOT_PASSWORD}" || {
            echo "❌ Database restore failed"
            return 1
        }
        
        echo "✅ Database restored successfully"
    else
        echo "⚠️ Database backup not found for $backup_id"
    fi
    
    # Restore uploads
    echo "📁 Restoring uploads..."
    if [ -f "$BACKUP_DIR/uploads_backup_${backup_id}.tar.gz" ]; then
        docker run --rm \
            -v jobportal_app_uploads:/data \
            -v "$BACKUP_DIR:/backup" \
            alpine:3.18 sh -c "
                rm -rf /data/*
                tar xzf /backup/uploads_backup_${backup_id}.tar.gz -C /data --strip-components=1
            " || {
            echo "❌ Uploads restore failed"
            return 1
        }
        
        echo "✅ Uploads restored successfully"
    else
        echo "⚠️ Uploads backup not found for $backup_id"
    fi
    
    # Restore configuration
    echo "⚙️ Restoring configuration..."
    if [ -f "$BACKUP_DIR/config_backup_${backup_id}.tar.gz" ]; then
        tar xzf "$BACKUP_DIR/config_backup_${backup_id}.tar.gz" || {
            echo "❌ Configuration restore failed"
            return 1
        }
        
        echo "✅ Configuration restored successfully"
    else
        echo "⚠️ Configuration backup not found for $backup_id"
    fi
    
    # Restore Docker images
    echo "🐳 Restoring Docker images..."
    if [ -f "$BACKUP_DIR/images_backup_${backup_id}.txt" ]; then
        source "$BACKUP_DIR/images_backup_${backup_id}.txt"
        
        if [ -n "$BACKEND_IMAGE" ] && [ "$BACKEND_IMAGE" != "none" ]; then
            docker pull "$BACKEND_IMAGE" || echo "⚠️ Failed to pull backend image"
        fi
        
        if [ -n "$FRONTEND_IMAGE" ] && [ "$FRONTEND_IMAGE" != "none" ]; then
            docker pull "$FRONTEND_IMAGE" || echo "⚠️ Failed to pull frontend image"
        fi
        
        # Update environment file
        echo "BACKEND_IMAGE=$BACKEND_IMAGE" > .env.rollback
        echo "FRONTEND_IMAGE=$FRONTEND_IMAGE" >> .env.rollback
        
        echo "✅ Docker images information restored"
    else
        echo "⚠️ Images backup not found for $backup_id"
    fi
}

# Function to restart services after rollback
restart_services() {
    echo "🚀 Starting services after rollback..."
    
    # Load environment variables
    set -a
    [ -f .env.prod ] && source .env.prod
    [ -f .env.secrets ] && source .env.secrets
    [ -f .env.rollback ] && source .env.rollback
    set +a
    
    # Start all services
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 60
    
    # Run health check
    if [ -f "./scripts/health-check.sh" ]; then
        echo "🔍 Running health check..."
        ./scripts/health-check.sh || {
            echo "❌ Health check failed after rollback"
            return 1
        }
    else
        echo "⚠️ Health check script not found"
    fi
}

# Function to rollback to previous deployment
quick_rollback() {
    echo "⚡ Performing quick rollback to latest backup..."
    
    local latest_backup=$(get_latest_backup)
    
    if [ -z "$latest_backup" ]; then
        echo "❌ No backups available for rollback"
        return 1
    fi
    
    echo "📦 Using backup: $latest_backup"
    
    rollback_to_backup "$latest_backup"
    restart_services
}

# Function to show rollback help
show_help() {
    cat << EOF
🔄 Job Portal Rollback Script

Usage: $0 [OPTIONS]

OPTIONS:
    -l, --list              List available backups
    -r, --rollback ID       Rollback to specific backup ID
    -q, --quick             Quick rollback to latest backup
    -h, --help              Show this help message

EXAMPLES:
    $0 --list                           # Show available backups
    $0 --quick                          # Rollback to latest backup
    $0 --rollback 20231126_143022       # Rollback to specific backup

NOTES:
    - Always ensure you have recent backups before deployment
    - Rollback will stop current services and restore from backup
    - Health checks will be performed after rollback
    - Database and uploads will be completely replaced

EOF
}

# Function to confirm rollback
confirm_rollback() {
    local backup_id="$1"
    
    echo ""
    echo "⚠️  WARNING: This will completely replace current data!"
    echo ""
    echo "📦 Backup ID: $backup_id"
    echo "🗃️ Database: Will be restored from backup"
    echo "📁 Uploads: Will be restored from backup"
    echo "⚙️ Config: Will be restored from backup"
    echo ""
    
    read -p "Are you sure you want to proceed? (yes/no): " confirmation
    
    case "$confirmation" in
        yes|YES|y|Y)
            return 0
            ;;
        *)
            echo "❌ Rollback cancelled"
            return 1
            ;;
    esac
}

# Main execution
main() {
    case "${1:-}" in
        -l|--list)
            show_available_backups
            ;;
        -r|--rollback)
            if [ -z "$2" ]; then
                echo "❌ Backup ID required"
                show_help
                exit 1
            fi
            
            if confirm_rollback "$2"; then
                rollback_to_backup "$2"
                restart_services
                echo "✅ Rollback completed successfully!"
            fi
            ;;
        -q|--quick)
            local latest_backup=$(get_latest_backup)
            if [ -n "$latest_backup" ] && confirm_rollback "$latest_backup"; then
                quick_rollback
                echo "✅ Quick rollback completed successfully!"
            fi
            ;;
        -h|--help|"")
            show_help
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Load environment variables if available
if [ -f .env.secrets ]; then
    source .env.secrets
fi

# Run main function
main "$@"