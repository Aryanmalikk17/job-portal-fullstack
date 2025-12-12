#!/bin/bash

# Check Docker Container Status on DigitalOcean Server
echo "🔍 Checking Docker Container Status After Backend Fix..."
echo "========================================================="

# Check all running containers
ssh -i ~/.ssh/jobportal_do root@64.227.189.10 "
echo '=== ALL RUNNING CONTAINERS ==='
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}'
echo ''

echo '=== JOB PORTAL CONTAINER STATUS ==='
docker ps | grep jobportal || echo 'No jobportal containers found'
echo ''

echo '=== BACKEND CONTAINER SPECIFIC CHECK ==='
if docker ps | grep -q jobportal-backend-prod; then
    echo '✅ Backend container is running'
    docker ps | grep jobportal-backend-prod
    echo ''
    echo 'Backend container logs (last 5 lines):'
    docker logs jobportal-backend-prod --tail 115
else
    echo '❌ Backend container is not running'
    echo ''
    echo 'Checking if backend container exists but stopped:'
    docker ps -a | grep jobportal-backend-prod || echo 'No backend container found at all'
fi

echo ''
echo '=== API HEALTH TESTS ==='
echo 'Testing backend health endpoint...'
curl -s -I http://localhost:8080/actuator/health | head -1 || echo 'Backend API not responding'

echo ''
echo 'Testing registration API (should return 401/400, not CORS error):'
curl -s -I http://localhost:8080/api/auth/register | head -1 || echo 'Registration API not responding'

echo ''
echo '=== FRONTEND TEST ==='
echo 'Testing frontend...'
curl -s -I http://localhost/ | head -1 || echo 'Frontend not responding'
"