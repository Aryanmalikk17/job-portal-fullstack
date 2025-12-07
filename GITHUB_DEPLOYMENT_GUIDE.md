# 🚀 GitHub-Based Deployment Guide for Job Portal

This guide provides complete instructions for deploying the Job Portal application using GitHub Actions CI/CD pipeline with Docker containers.

## 📋 **Prerequisites**

- [x] VPS/Server (Ubuntu 22.04 LTS recommended)
- [x] Domain name with DNS access
- [x] GitHub repository
- [x] Basic knowledge of Docker and GitHub Actions

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions  │───▶│  Production     │
│                 │    │   CI/CD Pipeline │    │   Server        │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Source Code   │    │ • Build & Test   │    │ • Docker        │
│ • Workflows     │    │ • Build Images   │    │ • Docker Compose│
│ • Dockerfiles   │    │ • Deploy         │    │ • Monitoring    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 **Quick Start Guide**

### **Step 1: Server Preparation**

1. **Purchase VPS** (DigitalOcean, AWS, Linode, etc.)
   - Minimum: 2GB RAM, 2 CPU, 50GB storage
   - Ubuntu 22.04 LTS

2. **Run Server Setup Script**
   ```bash
   # On your server
   curl -sSL https://raw.githubusercontent.com/yourusername/job-portal2.0/main/scripts/server-setup.sh | bash
   ```

3. **Configure Domain DNS**
   - Add A records:
     - `yourdomain.com` → Your server IP
     - `api.yourdomain.com` → Your server IP

### **Step 2: SSL Certificate Setup**

```bash
# On your server after DNS propagation
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/jobportal/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/jobportal/nginx/ssl/
sudo chown ubuntu:ubuntu /opt/jobportal/nginx/ssl/*
```

### **Step 3: Configure GitHub Repository**

1. **Add GitHub Secrets** (Repository → Settings → Secrets and variables → Actions)

   ```bash
   # Server Configuration
   SERVER_HOST=your.server.ip.address
   SERVER_USER=deploy
   SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY----- (generated SSH key)

   # Database Secrets
   MYSQL_ROOT_PASSWORD=your-secure-root-password
   MYSQL_PASSWORD=your-secure-db-password
   JWT_SECRET=your-256-bit-jwt-secret

   # Email Configuration
   MAIL_USERNAME=noreply@yourdomain.com
   MAIL_PASSWORD=your-smtp-app-password

   # Redis Password
   REDIS_PASSWORD=your-redis-password

   # Domain Configuration
   DOMAIN_NAME=yourdomain.com

   # Monitoring
   GRAFANA_PASSWORD=your-grafana-password

   # Optional: Slack Notifications
   SLACK_WEBHOOK=https://hooks.slack.com/services/your/webhook/url
   ```

2. **Generate SSH Key for GitHub Actions**
   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -f github-actions-key -N ""
   
   # Add public key to server
   cat github-actions-key.pub | ssh ubuntu@your-server "sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys"
   
   # Add private key to GitHub Secrets as SSH_PRIVATE_KEY
   cat github-actions-key
   ```

### **Step 4: Environment Configuration**

1. **Configure Server Environment**
   ```bash
   # On your server
   cd /opt/jobportal
   cp .env.prod.template .env.prod
   nano .env.prod  # Edit with your values
   ```

2. **Create Secret Files**
   ```bash
   # Create secret files
   echo "your-mysql-root-password" > secrets/mysql_root_password.txt
   echo "your-mysql-password" > secrets/mysql_password.txt
   echo "your-jwt-secret" > secrets/jwt_secret.txt
   echo "your-mail-password" > secrets/mail_password.txt
   echo "your-redis-password" > secrets/redis_password.txt
   
   chmod 600 secrets/*.txt
   ```

## 🔄 **Deployment Workflows**

### **Development Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 2. Create Pull Request to develop branch
# GitHub Actions will run tests automatically

# 3. Merge to develop (triggers staging deployment)
git checkout develop
git merge feature/new-feature
git push origin develop
```

### **Production Deployment**

```bash
# 1. Merge develop to main (triggers production deployment)
git checkout main
git merge develop
git push origin main

# 2. Create release tag (optional)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 🏭 **Production Services**

After successful deployment, your application runs with:

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **Frontend** | 80/443 | React Application | https://yourdomain.com |
| **Backend API** | 8080 | Spring Boot API | https://api.yourdomain.com |
| **MySQL** | 3306 | Database | Internal |
| **Redis** | 6379 | Cache | Internal |
| **Prometheus** | 9090 | Metrics | http://yourdomain.com:9090 |
| **Grafana** | 3000 | Dashboards | http://yourdomain.com:3000 |

## 📊 **Monitoring & Maintenance**

### **Health Checks**
```bash
# Manual health check
cd /opt/jobportal
./scripts/health-check.sh
```

### **View Logs**
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs app

# All services logs
docker-compose -f docker-compose.prod.yml logs

# Nginx logs
tail -f /opt/jobportal/logs/nginx/access.log
```

### **Backup Management**
```bash
# Manual backup
./scripts/backup-before-deploy.sh

# List available backups
./scripts/rollback.sh --list

# Rollback to specific backup
./scripts/rollback.sh --rollback 20231126_143022
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Deployment Fails**
   ```bash
   # Check GitHub Actions logs
   # Verify SSH connectivity
   ssh deploy@your-server-ip "docker ps"
   
   # Check server resources
   free -h
   df -h
   ```

2. **SSL Certificate Issues**
   ```bash
   # Renew certificates
   sudo certbot renew
   
   # Copy renewed certificates
   sudo cp /etc/letsencrypt/live/yourdomain.com/* /opt/jobportal/nginx/ssl/
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

3. **Database Connection Issues**
   ```bash
   # Check MySQL container
   docker-compose -f docker-compose.prod.yml logs mysql
   
   # Reset MySQL password
   docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
   ```

4. **Memory Issues**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Clean unused Docker resources
   docker system prune -f
   ```

### **Emergency Procedures**

1. **Quick Rollback**
   ```bash
   cd /opt/jobportal
   ./scripts/rollback.sh --quick
   ```

2. **Complete System Reset**
   ```bash
   # Stop all services
   docker-compose -f docker-compose.prod.yml down
   
   # Remove containers and volumes (⚠️ DATA LOSS)
   docker-compose -f docker-compose.prod.yml down -v
   
   # Restore from backup
   ./scripts/rollback.sh --rollback BACKUP_ID
   ```

## 🔐 **Security Best Practices**

### **Server Security**
- [x] Firewall configured (UFW)
- [x] SSH key-based authentication
- [x] Regular security updates
- [x] Non-root user for deployment
- [x] SSL certificates with auto-renewal

### **Application Security**
- [x] Environment variables for secrets
- [x] JWT token authentication
- [x] Rate limiting (Nginx)
- [x] Security headers
- [x] Database connection encryption

### **Monitoring Security**
- [x] Prometheus metrics secured
- [x] Grafana password protected
- [x] Container resource limits
- [x] Log aggregation and rotation

## 📈 **Scaling Considerations**

### **Horizontal Scaling**
```yaml
# docker-compose.prod.yml
app:
  deploy:
    replicas: 3  # Scale to 3 instances
    
nginx:
  # Load balancer configuration
```

### **Vertical Scaling**
```yaml
app:
  deploy:
    resources:
      limits:
        memory: 4G      # Increase memory
        cpus: '2.0'     # Increase CPU
```

### **Database Scaling**
- Read replicas for MySQL
- Redis clustering
- Database connection pooling

## 🚀 **Advanced Features**

### **Blue-Green Deployment**
```yaml
# Modify CI/CD for zero-downtime deployments
deploy:
  strategy: blue-green
  health_check_grace_period: 60s
```

### **Multi-Environment Setup**
- Development: Auto-deploy on develop branch
- Staging: Manual approval required
- Production: Auto-deploy on main branch

### **Monitoring Alerts**
- CPU/Memory usage alerts
- Database performance monitoring
- Application error tracking
- Uptime monitoring

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**
- [ ] Weekly: Review monitoring dashboards
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security patch updates
- [ ] Quarterly: Backup restoration tests

### **Performance Optimization**
- Database query optimization
- Redis cache tuning
- Nginx performance tuning
- JVM garbage collection optimization

---

## ✅ **Deployment Checklist**

- [ ] Server provisioned and configured
- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] GitHub secrets configured
- [ ] Environment files created
- [ ] SSH keys generated and added
- [ ] Initial deployment tested
- [ ] Health checks passing
- [ ] Monitoring dashboards accessible
- [ ] Backup system tested
- [ ] Rollback procedure tested

---

**🎉 Congratulations! Your Job Portal is now deployed with enterprise-grade CI/CD pipeline!**

For support, check the monitoring dashboards or review the application logs. The deployment is designed to be self-healing and automatically recoverable.

# 🚀 GitHub Deployment Guide - Job Portal
## Deploy from GitHub to DigitalOcean (5 minutes)

### **Step 1: Push to GitHub (2 minutes)**
```bash
# From your local machine
cd "/Users/apple/Desktop/Documents/freeLancing projects/job-portal2.0/job-portal-fullstack"

# Create .gitignore to exclude large files
cat > .gitignore << 'EOF'
# Build artifacts
backend/target/
frontend/build/
frontend/node_modules/

# Logs
backend/logs/
*.log

# IDE files
.idea/
.vscode/
*.iml

# OS files
.DS_Store
Thumbs.db

# Environment files (keep .env.prod for deployment)
.env
.env.local
.env.development
EOF

# Initialize git and push
git init
git add .
git commit -m "🚀 Initial commit - Job Portal Production Ready"
git branch -M main
git remote add origin https://github.com/Aryanmalikk17/job-portal-fullstack.git
git push -u origin main
```

### **Step 2: Deploy from GitHub to DigitalOcean (3 minutes)**
```bash
# SSH into your DigitalOcean server
ssh -i ~/.ssh/jobportal_do root@64.227.189.10

# Clone your repository (much faster than SCP!)
cd /opt
rm -rf job-portal-fullstack  # Remove incomplete upload
git clone https://github.com/Aryanmalikk17/job-portal-fullstack.git
cd job-portal-fullstack

# Run server setup
chmod +x scripts/digitalocean-setup.sh
./scripts/digitalocean-setup.sh

# Deploy application
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

## 🎯 **Why GitHub Method is Better:**

### **Speed Comparison:**
- **SCP Method**: 10+ minutes (uploads build files, logs, etc.)
- **GitHub Method**: 2-3 minutes (only source code)

### **Professional Benefits:**
- ✅ Version control for your deployments
- ✅ Easy rollbacks with `git checkout`
- ✅ Automatic CI/CD pipeline potential
- ✅ Clean source-only deployment
- ✅ Team collaboration ready

### **What Gets Deployed:**
- ✅ Source code only (no build artifacts)
- ✅ Docker configs
- ✅ Database scripts
- ✅ Environment configurations
- ❌ No logs, build files, or IDE configs

## 🔥 **Ready to Execute?**

The GitHub method will have your job portal live in **5 minutes total**:
1. **2 minutes**: Push to GitHub
2. **3 minutes**: Deploy on server

**Much faster and cleaner than the SCP upload!**