#!/bin/bash

# Comprehensive Docker Container and Service Verification Script
# Run this on your DigitalOcean server to check all services

echo "🔍 ====== COMPREHENSIVE DOCKER VERIFICATION ======"
echo "📅 Verification Time: $(date)"
echo "🖥️ Server: $(hostname)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo "🐳 ====== DOCKER SYSTEM STATUS ======"
echo "Docker Version:"
docker --version
echo ""
echo "Docker Compose Version:"
docker-compose --version
echo ""

echo "🔍 ====== ALL DOCKER CONTAINERS ======"
echo "Container Status:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
echo ""

echo "📊 ====== RUNNING CONTAINERS DETAILS ======"
RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}")
if [ -z "$RUNNING_CONTAINERS" ]; then
    echo -e "${RED}❌ No containers are currently running!${NC}"
else
    echo -e "${GREEN}✅ Running Containers Found:${NC}"
    for container in $RUNNING_CONTAINERS; do
        echo "🔹 $container"
    done
fi
echo ""

echo "🎯 ====== JOB PORTAL SPECIFIC CONTAINERS ======"
EXPECTED_CONTAINERS=("jobportal-mysql-prod" "jobportal-redis-prod" "jobportal-backend-prod" "jobportal-frontend-prod" "jobportal-nginx-prod")

for container in "${EXPECTED_CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        echo -e "${GREEN}✅ $container - RUNNING${NC}"
    else
        echo -e "${RED}❌ $container - NOT RUNNING${NC}"
    fi
done
echo ""

echo "🏥 ====== CONTAINER HEALTH CHECKS ======"
for container in "${EXPECTED_CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        if [ "$HEALTH" = "healthy" ]; then
            echo -e "${GREEN}✅ $container - HEALTHY${NC}"
        elif [ "$HEALTH" = "no-health-check" ]; then
            echo -e "${YELLOW}⚠️ $container - NO HEALTH CHECK CONFIGURED${NC}"
        else
            echo -e "${RED}❌ $container - UNHEALTHY ($HEALTH)${NC}"
        fi
    fi
done
echo ""

echo "📋 ====== DOCKER IMAGES ======"
echo "All Docker Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo ""

echo "🌐 ====== NETWORK CONNECTIVITY ======"
echo "Docker Networks:"
docker network ls
echo ""

echo "💾 ====== DOCKER VOLUMES ======"
echo "Docker Volumes:"
docker volume ls
echo ""

echo "📱 ====== APPLICATION HEALTH TESTS ======"

# Test Frontend (Nginx)
echo "Testing Frontend (Nginx)..."
if curl -s -I http://localhost/ | grep -q "200 OK\|nginx"; then
    echo -e "${GREEN}✅ Frontend (Nginx) - RESPONDING${NC}"
else
    echo -e "${RED}❌ Frontend (Nginx) - NOT RESPONDING${NC}"
fi

# Test Backend API
echo "Testing Backend API..."
if curl -s -I http://localhost:8080/actuator/health | grep -q "200\|401"; then
    echo -e "${GREEN}✅ Backend API - RESPONDING${NC}"
else
    echo -e "${RED}❌ Backend API - NOT RESPONDING${NC}"
fi

# Test MySQL
echo "Testing MySQL Database..."
if docker exec jobportal-mysql-prod mysqladmin ping -u root -pZpluseRootPass2025! >/dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL Database - RESPONDING${NC}"
else
    echo -e "${RED}❌ MySQL Database - NOT RESPONDING${NC}"
fi

# Test Redis
echo "Testing Redis Cache..."
if docker exec jobportal-redis-prod redis-cli -a ZpluseRedisPass2025! ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis Cache - RESPONDING${NC}"
else
    echo -e "${RED}❌ Redis Cache - NOT RESPONDING${NC}"
fi

echo ""
echo "📊 ====== SYSTEM RESOURCES ======"
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "Docker System Usage:"
docker system df
echo ""

echo "📝 ====== RECENT CONTAINER LOGS (Last 10 lines) ======"
for container in "${EXPECTED_CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        echo "--- $container logs ---"
        docker logs "$container" --tail 10 2>&1 || echo "Could not retrieve logs"
        echo ""
    fi
done

echo "🔚 ====== VERIFICATION COMPLETE ======"
echo "📅 Completed at: $(date)"
echo ""
echo "💡 If any containers are not running, try:"
echo "   cd /opt/jobportal"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔍 To check specific container logs:"
echo "   docker logs [container-name]"
echo ""
echo "🌐 To test external access:"
echo "   curl -I https://zplusejobs.com"