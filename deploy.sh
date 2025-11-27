#!/bin/bash
# Production deployment script for Zpluse Job Portal

set -e

echo "🚀 Starting Zpluse Job Portal Production Deployment"

# Configuration
PROJECT_NAME="zpluse-job-portal"
BACKUP_DIR="/opt/backups/jobportal"
LOG_FILE="/var/log/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is required but not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is required but not installed"
    
    # Check if secrets directory exists
    if [ ! -d "./secrets" ]; then
        warn "Secrets directory not found. Creating..."
        mkdir -p secrets
        echo "Please populate secrets files before continuing"
    fi
    
    # Check required secret files
    local required_secrets=("mysql_password.txt" "mysql_root_password.txt" "jwt_secret.txt")
    for secret in "${required_secrets[@]}"; do
        if [ ! -f "./secrets/$secret" ]; then
            error "Missing required secret file: ./secrets/$secret"
        fi
    done
    
    log "Prerequisites check completed ✅"
}

# Create database backup
backup_database() {
    log "Creating database backup..."
    
    mkdir -p $BACKUP_DIR
    local backup_file="$BACKUP_DIR/jobportal_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T mysql mysqldump \
        -u jobportal -p$(cat ./secrets/mysql_password.txt) \
        jobportal > $backup_file || warn "Database backup failed"
    
    log "Database backup created: $backup_file"
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    docker-compose pull
    log "Images pulled successfully ✅"
}

# Deploy application
deploy() {
    log "Deploying application..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Health check
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "Application is healthy ✅"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Application health check failed after $max_attempts attempts"
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
}

# Cleanup old containers and images
cleanup() {
    log "Cleaning up old containers and images..."
    
    # Remove old containers
    docker container prune -f
    
    # Remove old images
    docker image prune -f
    
    log "Cleanup completed ✅"
}

# Main deployment process
main() {
    log "🚀 Starting deployment process"
    
    check_prerequisites
    backup_database
    pull_images
    deploy
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "Application is available at: https://jobportal.com"
    log "Monitoring dashboard: http://localhost:3000 (Grafana)"
    log "Health check: https://jobportal.com/health"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT

# Run main function
main "$@"