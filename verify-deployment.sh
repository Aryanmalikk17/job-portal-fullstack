#!/bin/bash

# Quick Deployment Verification Script
# Run this directly on your DigitalOcean server

echo "🚀 QUICK DEPLOYMENT VERIFICATION"
echo "================================="
echo "📅 $(date)"
echo ""

# Navigate to deployment directory
cd /opt/jobportal 2>/dev/null || { echo "❌ /opt/jobportal directory not found!"; exit 1; }

echo "✅ In deployment directory: $(pwd)"
echo ""

# Check Docker Compose status
echo "🐳 Docker Compose Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Quick container health check
echo "🏥 Container Health Check:"
CONTAINERS=("jobportal-mysql-prod" "jobportal-redis-prod" "jobportal-backend-prod" "jobportal-frontend-prod" "jobportal-nginx-prod")

for container in "${CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "✅ $container - RUNNING"
    else
        echo "❌ $container - NOT RUNNING"
    fi
done
echo ""

# Application health tests
echo "🌐 Application Health Tests:"
echo -n "Frontend (localhost): "
if curl -s -I http://localhost/ | grep -q "200\|nginx"; then
    echo "✅ RESPONDING"
else
    echo "❌ NOT RESPONDING"
fi

echo -n "Backend API (localhost:8080): "
if curl -s -I http://localhost:8080/actuator/health | grep -q "200\|401"; then
    echo "✅ RESPONDING" 
else
    echo "❌ NOT RESPONDING"
fi

echo -n "External Domain (zplusejobs.com): "
if curl -s -I https://zplusejobs.com/ | grep -q "200\|301\|302"; then
    echo "✅ ACCESSIBLE"
else
    echo "❌ NOT ACCESSIBLE"
fi
echo ""

# System resources
echo "📊 System Resources:"
echo "Memory: $(free -h | awk 'NR==2{printf "Used: %s / %s (%.2f%%)", $3, $2, $3*100/$2}')"
echo "Disk: $(df -h / | awk 'NR==2{printf "Used: %s / %s (%s)", $3, $2, $5}')"
echo ""

echo "✅ Verification Complete!"
echo "For detailed logs: docker logs [container-name]"