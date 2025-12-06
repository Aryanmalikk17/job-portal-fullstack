#!/bin/bash
# Server Readiness Check Script for Job Portal Deployment
set -e

# Configuration
PROJECT_DIR="/opt/jobportal"
DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"
API_DOMAIN="api.${DOMAIN_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_passed() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    ((PASSED++))
}

print_failed() {
    echo -e "${RED}❌ FAIL${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Function to check system requirements
check_system_requirements() {
    print_header "SYSTEM REQUIREMENTS CHECK"
    
    # Check OS
    if grep -q "Ubuntu" /etc/os-release; then
        UBUNTU_VERSION=$(lsb_release -rs)
        if (( $(echo "$UBUNTU_VERSION >= 20.04" | bc -l) )); then
            print_passed "Ubuntu $UBUNTU_VERSION detected"
        else
            print_warning "Ubuntu $UBUNTU_VERSION detected (recommended: 20.04+)"
        fi
    else
        print_failed "Ubuntu not detected"
    fi
    
    # Check memory
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$MEMORY_GB" -ge 2 ]; then
        print_passed "Memory: ${MEMORY_GB}GB (minimum 2GB required)"
    else
        print_failed "Memory: ${MEMORY_GB}GB (minimum 2GB required)"
    fi
    
    # Check disk space
    DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G//')
    if (( $(echo "$DISK_AVAILABLE >= 20" | bc -l) )); then
        print_passed "Disk space: ${DISK_AVAILABLE}GB available"
    else
        print_failed "Disk space: ${DISK_AVAILABLE}GB available (minimum 20GB required)"
    fi
    
    # Check CPU cores
    CPU_CORES=$(nproc)
    if [ "$CPU_CORES" -ge 2 ]; then
        print_passed "CPU cores: $CPU_CORES (minimum 2 required)"
    else
        print_warning "CPU cores: $CPU_CORES (recommended: 2+)"
    fi
}

# Function to check Docker installation
check_docker() {
    print_header "DOCKER INSTALLATION CHECK"
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_passed "Docker installed: $DOCKER_VERSION"
        
        # Check if Docker is running
        if systemctl is-active --quiet docker; then
            print_passed "Docker service is running"
        else
            print_failed "Docker service is not running"
        fi
        
        # Check Docker permissions
        if docker ps &> /dev/null; then
            print_passed "Docker permissions configured correctly"
        else
            print_failed "Docker permissions issue - user not in docker group"
        fi
        
        # Check Docker Compose
        if command -v docker-compose &> /dev/null; then
            COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
            print_passed "Docker Compose installed: $COMPOSE_VERSION"
        else
            print_failed "Docker Compose not installed"
        fi
    else
        print_failed "Docker not installed"
    fi
}

# Function to check network configuration
check_network() {
    print_header "NETWORK CONFIGURATION CHECK"
    
    # Check public IP
    PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "Unable to detect")
    print_info "Public IP: $PUBLIC_IP"
    
    # Check if ports are available
    REQUIRED_PORTS=(22 80 443 3000 9090)
    for port in "${REQUIRED_PORTS[@]}"; do
        if netstat -tuln | grep ":$port " &> /dev/null; then
            if [ "$port" -eq 22 ]; then
                print_passed "Port $port (SSH) is open"
            else
                print_warning "Port $port is already in use"
            fi
        else
            print_passed "Port $port is available"
        fi
    done
    
    # Check firewall status
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(ufw status | head -1)
        if echo "$UFW_STATUS" | grep -q "active"; then
            print_passed "UFW firewall is active"
        else
            print_warning "UFW firewall is not active"
        fi
    else
        print_warning "UFW firewall not installed"
    fi
}

# Function to check DNS configuration
check_dns() {
    print_header "DNS CONFIGURATION CHECK"
    
    if [ "$DOMAIN_NAME" != "yourdomain.com" ]; then
        # Check main domain
        MAIN_DOMAIN_IP=$(dig +short "$DOMAIN_NAME" | tail -1)
        if [ -n "$MAIN_DOMAIN_IP" ]; then
            if [ "$MAIN_DOMAIN_IP" = "$PUBLIC_IP" ]; then
                print_passed "Main domain $DOMAIN_NAME points to this server"
            else
                print_warning "Main domain $DOMAIN_NAME points to $MAIN_DOMAIN_IP (this server: $PUBLIC_IP)"
            fi
        else
            print_failed "Main domain $DOMAIN_NAME does not resolve"
        fi
        
        # Check API subdomain
        API_DOMAIN_IP=$(dig +short "$API_DOMAIN" | tail -1)
        if [ -n "$API_DOMAIN_IP" ]; then
            if [ "$API_DOMAIN_IP" = "$PUBLIC_IP" ]; then
                print_passed "API domain $API_DOMAIN points to this server"
            else
                print_warning "API domain $API_DOMAIN points to $API_DOMAIN_IP (this server: $PUBLIC_IP)"
            fi
        else
            print_failed "API domain $API_DOMAIN does not resolve"
        fi
    else
        print_info "Using placeholder domain - configure DOMAIN_NAME environment variable"
    fi
}

# Function to check SSL certificates
check_ssl() {
    print_header "SSL CERTIFICATES CHECK"
    
    if command -v certbot &> /dev/null; then
        print_passed "Certbot installed"
        
        # Check for existing certificates
        if [ -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
            CERT_EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN_NAME/cert.pem" | cut -d= -f2)
            print_passed "SSL certificate exists for $DOMAIN_NAME (expires: $CERT_EXPIRY)"
        else
            print_warning "No SSL certificate found for $DOMAIN_NAME"
        fi
    else
        print_failed "Certbot not installed"
    fi
    
    # Check project SSL directory
    if [ -d "$PROJECT_DIR/nginx/ssl" ]; then
        print_passed "Project SSL directory exists"
        
        if [ -f "$PROJECT_DIR/nginx/ssl/fullchain.pem" ] && [ -f "$PROJECT_DIR/nginx/ssl/privkey.pem" ]; then
            print_passed "SSL certificate files found in project directory"
        else
            print_warning "SSL certificate files not found in project directory"
        fi
    else
        print_warning "Project SSL directory does not exist"
    fi
}

# Function to check project setup
check_project_setup() {
    print_header "PROJECT SETUP CHECK"
    
    # Check project directory
    if [ -d "$PROJECT_DIR" ]; then
        print_passed "Project directory exists: $PROJECT_DIR"
        
        # Check if it's a git repository
        if [ -d "$PROJECT_DIR/.git" ]; then
            print_passed "Git repository initialized"
            
            # Check remote origin
            cd "$PROJECT_DIR"
            REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
            if [ -n "$REMOTE_URL" ]; then
                print_passed "Git remote configured: $REMOTE_URL"
            else
                print_warning "Git remote not configured"
            fi
        else
            print_failed "Not a git repository"
        fi
        
        # Check required files
        REQUIRED_FILES=(
            "docker-compose.prod.yml"
            ".env.prod.template"
            "scripts/health-check.sh"
            "scripts/backup-before-deploy.sh"
        )
        
        for file in "${REQUIRED_FILES[@]}"; do
            if [ -f "$PROJECT_DIR/$file" ]; then
                print_passed "Required file exists: $file"
            else
                print_failed "Required file missing: $file"
            fi
        done
        
        # Check data directories
        DATA_DIRS=(
            "data/mysql"
            "data/redis"
            "data/uploads"
            "logs"
            "backups"
        )
        
        for dir in "${DATA_DIRS[@]}"; do
            if [ -d "$PROJECT_DIR/$dir" ]; then
                print_passed "Data directory exists: $dir"
            else
                print_warning "Data directory missing: $dir"
            fi
        done
        
    else
        print_failed "Project directory does not exist: $PROJECT_DIR"
    fi
}

# Function to check environment configuration
check_environment() {
    print_header "ENVIRONMENT CONFIGURATION CHECK"
    
    if [ -f "$PROJECT_DIR/.env.prod" ]; then
        print_passed "Production environment file exists"
        
        # Check for placeholder values
        if grep -q "your-domain\|your-password\|your-secret\|localhost" "$PROJECT_DIR/.env.prod"; then
            print_warning "Environment file contains placeholder values"
        else
            print_passed "Environment file appears to be configured"
        fi
    else
        print_failed "Production environment file not found"
    fi
    
    # Check secrets directory
    if [ -d "$PROJECT_DIR/secrets" ]; then
        print_passed "Secrets directory exists"
        
        SECRET_FILES=(
            "mysql_root_password.txt"
            "mysql_password.txt"
            "jwt_secret.txt"
            "mail_password.txt"
            "redis_password.txt"
        )
        
        for secret in "${SECRET_FILES[@]}"; do
            if [ -f "$PROJECT_DIR/secrets/$secret" ]; then
                if [ -s "$PROJECT_DIR/secrets/$secret" ]; then
                    print_passed "Secret file exists and not empty: $secret"
                else
                    print_warning "Secret file exists but is empty: $secret"
                fi
            else
                print_warning "Secret file missing: $secret"
            fi
        done
    else
        print_warning "Secrets directory does not exist"
    fi
}

# Function to check deployment user
check_deployment_user() {
    print_header "DEPLOYMENT USER CHECK"
    
    if id "deploy" &>/dev/null; then
        print_passed "Deploy user exists"
        
        # Check if user is in docker group
        if groups deploy | grep -q docker; then
            print_passed "Deploy user is in docker group"
        else
            print_failed "Deploy user is not in docker group"
        fi
        
        # Check SSH directory
        if [ -d "/home/deploy/.ssh" ]; then
            print_passed "Deploy user SSH directory exists"
            
            if [ -f "/home/deploy/.ssh/authorized_keys" ]; then
                KEY_COUNT=$(wc -l < "/home/deploy/.ssh/authorized_keys")
                print_passed "SSH authorized_keys file exists ($KEY_COUNT keys)"
            else
                print_warning "SSH authorized_keys file not found"
            fi
        else
            print_warning "Deploy user SSH directory not found"
        fi
    else
        print_failed "Deploy user does not exist"
    fi
}

# Function to check GitHub Actions prerequisites
check_github_actions() {
    print_header "GITHUB ACTIONS PREREQUISITES CHECK"
    
    # Check if we can connect to GitHub
    if curl -s --connect-timeout 5 https://api.github.com > /dev/null; then
        print_passed "GitHub connectivity verified"
    else
        print_warning "Cannot connect to GitHub"
    fi
    
    # Check required commands
    REQUIRED_COMMANDS=(git docker docker-compose curl jq)
    for cmd in "${REQUIRED_COMMANDS[@]}"; do
        if command -v "$cmd" &> /dev/null; then
            print_passed "Required command available: $cmd"
        else
            print_failed "Required command missing: $cmd"
        fi
    done
}

# Function to run health checks
check_health_scripts() {
    print_header "HEALTH CHECK SCRIPTS TEST"
    
    if [ -f "$PROJECT_DIR/scripts/health-check.sh" ]; then
        if [ -x "$PROJECT_DIR/scripts/health-check.sh" ]; then
            print_passed "Health check script is executable"
        else
            print_warning "Health check script is not executable"
        fi
    else
        print_failed "Health check script not found"
    fi
    
    if [ -f "$PROJECT_DIR/scripts/backup-before-deploy.sh" ]; then
        if [ -x "$PROJECT_DIR/scripts/backup-before-deploy.sh" ]; then
            print_passed "Backup script is executable"
        else
            print_warning "Backup script is not executable"
        fi
    else
        print_failed "Backup script not found"
    fi
}

# Function to display final report
show_final_report() {
    print_header "DEPLOYMENT READINESS REPORT"
    
    TOTAL_CHECKS=$((PASSED + FAILED + WARNINGS))
    SUCCESS_RATE=$((PASSED * 100 / TOTAL_CHECKS))
    
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo -e "${BLUE}📊 Success Rate: $SUCCESS_RATE%${NC}"
    
    echo ""
    if [ "$FAILED" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}🎉 SERVER IS FULLY READY FOR DEPLOYMENT!${NC}"
        echo -e "${GREEN}You can proceed with pushing to GitHub to trigger the deployment.${NC}"
    elif [ "$FAILED" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  SERVER IS MOSTLY READY WITH SOME WARNINGS${NC}"
        echo -e "${YELLOW}Review the warnings above before deploying.${NC}"
    else
        echo -e "${RED}❌ SERVER IS NOT READY FOR DEPLOYMENT${NC}"
        echo -e "${RED}Please fix the failed checks before proceeding.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    if [ "$FAILED" -gt 0 ]; then
        echo "1. Fix all failed checks above"
        echo "2. Re-run this script to verify fixes"
        echo "3. Configure GitHub Secrets"
        echo "4. Push to GitHub to trigger deployment"
    else
        echo "1. Configure GitHub Secrets with your server details"
        echo "2. Push to main branch to trigger deployment"
        echo "3. Monitor GitHub Actions workflow"
        echo "4. Check deployment health at https://$DOMAIN_NAME"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "🚀 Job Portal Server Readiness Check"
    echo "====================================="
    echo -e "${NC}"
    
    check_system_requirements
    check_docker
    check_network
    check_dns
    check_ssl
    check_project_setup
    check_environment
    check_deployment_user
    check_github_actions
    check_health_scripts
    show_final_report
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi