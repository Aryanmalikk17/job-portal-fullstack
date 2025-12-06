#!/bin/bash
# DigitalOcean Server Setup Script

echo "🚀 Setting up DigitalOcean server for Job Portal deployment..."

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application user
useradd -m -s /bin/bash jobportal
usermod -aG docker jobportal

# Create required directories
mkdir -p /opt/jobportal/{data/{mysql,redis,uploads},logs/{nginx,app}}
chown -R jobportal:jobportal /opt/jobportal

# Configure firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

echo "✅ Server setup complete!"
echo "📝 Next: Upload your project files and run deployment"