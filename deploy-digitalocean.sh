#!/bin/bash
# Complete DigitalOcean Deployment Script

set -e

echo "🚀 Starting DigitalOcean Job Portal Deployment..."

# Configuration
PROJECT_DIR="/opt/job-portal-fullstack"
BACKUP_DIR="/opt/backups/jobportal"
LOG_FILE="/var/log/jobportal-deployment.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if running on DigitalOcean (or similar VPS)
check_server() {
    log "Checking server environment..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Run digitalocean-setup.sh first"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Run digitalocean-setup.sh first"
    fi
    
    log "✅ Server environment ready"
}

# Load environment variables
load_env() {
    log "Loading environment variables..."
    
    if [ ! -f ".env.prod" ]; then
        error ".env.prod file not found"
    fi
    
    export $(cat .env.prod | grep -v '#' | awk '/=/ {print $1}')
    log "✅ Environment variables loaded"
}

# Create backup
backup_if_exists() {
    if docker ps | grep -q jobportal; then
        log "Creating backup of existing deployment..."
        mkdir -p $BACKUP_DIR
        docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
            -u jobportal -p$MYSQL_PASSWORD jobportal > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql || true
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Pull latest images
    log "Pulling Docker images..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services
    log "Waiting for services to be healthy..."
    sleep 60
    
    # Health check
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health &>/dev/null; then
            log "✅ Application is healthy and ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Health check failed after $max_attempts attempts"
        fi
        
        log "Health check attempt $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Check if domain is configured
    if [[ "$CORS_ALLOWED_ORIGINS" == *"zplusejobs.com"* ]]; then
        log "Configuring SSL for zplusejobs.com..."
        certbot --nginx -d zplusejobs.com -d www.zplusejobs.com --non-interactive --agree-tos --email aryanmalik17@gmail.com
        log "✅ SSL certificates configured"
    else
        log "⚠️  No domain configured - SSL setup skipped"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up old images..."
    docker image prune -f
    docker container prune -f
    log "✅ Cleanup complete"
}

# Main deployment
main() {
    log "🚀 Starting Job Portal deployment on DigitalOcean"
    
    check_server
    load_env
    backup_if_exists
    deploy
    setup_ssl
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Application URL: https://zplusejobs.com"
    log "📊 Health Check: https://zplusejobs.com/health"
    log "📧 Admin Email: aryanmalik17@gmail.com"
}

# Run deployment
main "$@"