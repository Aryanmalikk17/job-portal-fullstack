#!/bin/bash
# COMPLETE SERVER RESET & FRESH DEPLOYMENT
# This script completely cleans the DigitalOcean server and prepares for fresh deployment

set -e

echo "🔥 COMPLETE SERVER RESET - Job Portal Fresh Deployment"
echo "⚠️  WARNING: This will remove ALL previous deployment data!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# 1. COMPLETE CLEANUP
cleanup_everything() {
    log "🧹 Step 1: Complete cleanup of previous deployments..."
    
    # Stop all Docker containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove all Docker images
    docker rmi $(docker images -q) 2>/dev/null || true
    
    # Remove all volumes
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    # Remove all networks
    docker network rm $(docker network ls -q) 2>/dev/null || true
    
    # Clean Docker system
    docker system prune -af --volumes
    
    # Remove application directories
    rm -rf /opt/jobportal /opt/job-portal-fullstack /home/deploy 2>/dev/null || true
    
    log "✅ Complete cleanup finished"
}

# 2. INSTALL FRESH DEPENDENCIES
install_dependencies() {
    log "📦 Step 2: Installing fresh dependencies..."
    
    # Update system
    apt update && apt upgrade -y
    
    # Install essential packages
    apt install -y curl wget git ufw fail2ban htop unzip
    
    # Install Docker (latest)
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Install Docker Compose (latest)
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start Docker service
    systemctl start docker
    systemctl enable docker
    
    log "✅ Dependencies installed successfully"
}

# 3. CREATE DEPLOYMENT USER
create_deployment_user() {
    log "👤 Step 3: Creating deployment user..."
    
    # Create deploy user
    useradd -m -s /bin/bash deploy || true
    usermod -aG docker deploy
    
    # Setup SSH for deploy user
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chown deploy:deploy /home/deploy/.ssh
    
    # Copy authorized keys from root (if exists)
    if [ -f /root/.ssh/authorized_keys ]; then
        cp /root/.ssh/authorized_keys /home/deploy/.ssh/
        chown deploy:deploy /home/deploy/.ssh/authorized_keys
        chmod 600 /home/deploy/.ssh/authorized_keys
    fi
    
    log "✅ Deployment user created"
}

# 4. SETUP DIRECTORY STRUCTURE
setup_directories() {
    log "📁 Step 4: Creating directory structure..."
    
    # Create main application directory
    mkdir -p /opt/jobportal/{data/{mysql,redis,uploads},logs/{nginx,app},ssl,config}
    
    # Set proper permissions
    chown -R deploy:deploy /opt/jobportal
    chmod -R 755 /opt/jobportal
    
    log "✅ Directory structure created"
}

# 5. CONFIGURE FIREWALL
configure_firewall() {
    log "🔥 Step 5: Configuring firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow essential ports
    ufw allow ssh
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    
    # Enable firewall
    ufw --force enable
    
    log "✅ Firewall configured"
}

# 6. INSTALL SSL SUPPORT
install_ssl_support() {
    log "🔐 Step 6: Installing SSL support..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    log "✅ SSL support installed"
}

# 7. OPTIMIZE SYSTEM FOR DOCKER
optimize_system() {
    log "⚡ Step 7: Optimizing system for Docker..."
    
    # Increase file limits
    cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF
    
    # Optimize Docker daemon
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF
    
    systemctl restart docker
    
    log "✅ System optimized for Docker"
}

# MAIN EXECUTION
main() {
    log "🚀 Starting complete server reset for Job Portal deployment"
    log "Server: $(hostname) - $(date)"
    
    cleanup_everything
    install_dependencies
    create_deployment_user
    setup_directories
    configure_firewall
    install_ssl_support
    optimize_system
    
    log "🎉 Server reset complete! Ready for fresh deployment."
    log "📝 Next steps:"
    log "   1. Deploy from GitHub using GitHub Actions"
    log "   2. Configure domain DNS"
    log "   3. Setup SSL certificates"
    log ""
    log "🔗 Server is ready at: $(curl -s ifconfig.me)"
}

# Execute main function
main "$@"