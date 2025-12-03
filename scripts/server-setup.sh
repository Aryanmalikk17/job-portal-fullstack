#!/bin/bash
# Server Setup Script for GitHub-based Deployment
set -e

echo "🚀 Setting up production server for Job Portal deployment..."

# Configuration
PROJECT_DIR="/opt/jobportal"
GITHUB_REPO="https://github.com/Aryanmalikk17/job-portal-fullstack.git"
SERVER_USER="ubuntu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as sudo
check_sudo() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as regular user with sudo privileges."
        exit 1
    fi
    
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo privileges. Please ensure you can run sudo commands."
        exit 1
    fi
}

# Function to update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git jq unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_warning "Docker is already installed"
        docker --version
    else
        # Remove old versions
        sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Set up stable repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
        print_status "Docker installed successfully"
    fi
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is already installed"
        docker-compose --version
    else
        # Get latest version
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
        
        # Download and install
        sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        print_status "Docker Compose $DOCKER_COMPOSE_VERSION installed successfully"
    fi
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow OpenSSH
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow monitoring (restrict to specific IPs in production)
    sudo ufw allow 9090/tcp comment 'Prometheus'
    sudo ufw allow 3000/tcp comment 'Grafana'
    
    # Enable firewall
    sudo ufw --force enable
    
    print_status "Firewall configured successfully"
}

# Function to create project directory structure
create_directories() {
    print_status "Creating project directory structure..."
    
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown $USER:$USER "$PROJECT_DIR"
    
    # Create data directories
    mkdir -p "$PROJECT_DIR/data/mysql"
    mkdir -p "$PROJECT_DIR/data/redis"
    mkdir -p "$PROJECT_DIR/data/uploads"
    mkdir -p "$PROJECT_DIR/data/prometheus"
    mkdir -p "$PROJECT_DIR/data/grafana"
    mkdir -p "$PROJECT_DIR/logs"
    mkdir -p "$PROJECT_DIR/logs/nginx"
    mkdir -p "$PROJECT_DIR/backups"
    
    # Set proper permissions
    chmod 755 "$PROJECT_DIR/data"/*
    chmod 755 "$PROJECT_DIR/logs"
    chmod 755 "$PROJECT_DIR/backups"
    
    print_status "Directory structure created"
}

# Function to install SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificate management..."
    
    # Install certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Create SSL directory
    mkdir -p "$PROJECT_DIR/nginx/ssl"
    
    print_warning "SSL certificates need to be obtained manually after domain DNS is configured"
    print_warning "Run: sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com"
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    cd "$PROJECT_DIR"
    
    if [ -d ".git" ]; then
        print_warning "Repository already exists, updating..."
        git pull origin main
    else
        print_status "Cloning repository from $GITHUB_REPO"
        git clone "$GITHUB_REPO" .
        
        # Setup git for future updates
        git config --global --add safe.directory "$PROJECT_DIR"
    fi
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    cd "$PROJECT_DIR"
    
    # Copy environment template
    if [ ! -f ".env.prod" ]; then
        cp .env.prod.template .env.prod
        print_warning "Please edit .env.prod with your actual values"
    fi
    
    # Create secrets file template
    if [ ! -f ".env.secrets" ]; then
        cat > .env.secrets << EOF
# Secret Environment Variables
# These are loaded separately for security

MYSQL_ROOT_PASSWORD=\$(cat secrets/mysql_root_password.txt)
MYSQL_PASSWORD=\$(cat secrets/mysql_password.txt)
JWT_SECRET=\$(cat secrets/jwt_secret.txt)
MAIL_PASSWORD=\$(cat secrets/mail_password.txt)
REDIS_PASSWORD=\$(cat secrets/redis_password.txt)
EOF
        print_warning "Please create secret files in the secrets/ directory"
    fi
}

# Function to setup GitHub Actions deployment user
setup_deployment_user() {
    print_status "Setting up deployment user..."
    
    # Create deployment user if it doesn't exist
    if ! id "deploy" &>/dev/null; then
        sudo useradd -m -s /bin/bash deploy
        sudo usermod -aG docker deploy
        sudo usermod -aG sudo deploy
    fi
    
    # Setup SSH for deployment
    sudo -u deploy mkdir -p /home/deploy/.ssh
    sudo -u deploy chmod 700 /home/deploy/.ssh
    
    print_warning "Add your GitHub Actions SSH public key to /home/deploy/.ssh/authorized_keys"
    print_warning "You can generate SSH keys for GitHub Actions and add the public key here"
}

# Function to setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/jobportal << EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $USER $USER
}

$PROJECT_DIR/logs/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $USER $USER
}
EOF

    print_status "Log rotation configured"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring directories..."
    
    mkdir -p "$PROJECT_DIR/monitoring/grafana/dashboards"
    mkdir -p "$PROJECT_DIR/monitoring/grafana/datasources"
    mkdir -p "$PROJECT_DIR/monitoring/alerts"
    
    # Set proper permissions for Grafana
    sudo chown -R 472:472 "$PROJECT_DIR/data/grafana"
    
    print_status "Monitoring setup completed"
}

# Function to setup backup cron job
setup_backup_cron() {
    print_status "Setting up automated backups..."
    
    # Add backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && ./scripts/backup-before-deploy.sh > /dev/null 2>&1") | crontab -
    
    print_status "Backup cron job added (daily at 2 AM)"
}

# Function to test deployment
test_deployment() {
    print_status "Testing basic deployment setup..."
    
    cd "$PROJECT_DIR"
    
    # Test Docker
    if docker run --rm hello-world &>/dev/null; then
        print_status "Docker test passed"
    else
        print_error "Docker test failed"
    fi
    
    # Test Docker Compose
    if docker-compose --version &>/dev/null; then
        print_status "Docker Compose test passed"
    else
        print_error "Docker Compose test failed"
    fi
    
    # Test script permissions
    if [ -x "./scripts/health-check.sh" ]; then
        print_status "Script permissions test passed"
    else
        print_error "Script permissions test failed"
    fi
}

# Function to display next steps
show_next_steps() {
    print_status "Server setup completed! Next steps:"
    echo ""
    echo "1. 🔐 Configure secrets:"
    echo "   - Edit $PROJECT_DIR/.env.prod with your values"
    echo "   - Create secret files in $PROJECT_DIR/secrets/"
    echo ""
    echo "2. 🌐 Setup domain and SSL:"
    echo "   - Point your domain to this server's IP"
    echo "   - Run: sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com"
    echo "   - Copy certificates to $PROJECT_DIR/nginx/ssl/"
    echo ""
    echo "3. 🔑 Setup GitHub Actions SSH access:"
    echo "   - Generate SSH keys for GitHub Actions"
    echo "   - Add public key to /home/deploy/.ssh/authorized_keys"
    echo "   - Add private key to GitHub Secrets as SSH_PRIVATE_KEY"
    echo ""
    echo "4. 🚀 Configure GitHub Secrets:"
    echo "   - SERVER_HOST: $(curl -s ifconfig.me || hostname -I | awk '{print $1}')"
    echo "   - SERVER_USER: deploy"
    echo "   - Add all environment variables from .env.prod"
    echo ""
    echo "5. 🧪 Test deployment:"
    echo "   - Push to main branch to trigger deployment"
    echo "   - Monitor GitHub Actions workflow"
    echo ""
    echo "🎉 Server is ready for GitHub-based deployment!"
}

# Main execution
main() {
    check_sudo
    update_system
    install_docker
    install_docker_compose
    setup_firewall
    create_directories
    setup_ssl
    clone_repository
    setup_environment
    setup_deployment_user
    setup_log_rotation
    setup_monitoring
    setup_backup_cron
    test_deployment
    show_next_steps
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi