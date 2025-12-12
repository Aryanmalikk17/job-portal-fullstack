#!/bin/bash

# Start Backend Container Script
echo "🚀 Starting Backend Container with Latest Fixes..."
echo "=================================================="

ssh -i ~/.ssh/jobportal_do root@64.227.189.10 << 'EOF'
echo "=== CHECKING IF BACKEND CONTAINER EXISTS ==="
if docker ps -a | grep -q jobportal-backend-prod; then
    echo "Stopping and removing existing backend container..."
    docker stop jobportal-backend-prod 2>/dev/null || true
    docker rm jobportal-backend-prod 2>/dev/null || true
fi

echo ""
echo "=== STARTING NEW BACKEND CONTAINER ==="
docker run -d \
  --name jobportal-backend-prod \
  --network jobportal_jobportal-network-prod \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL=jdbc:mysql://mysql:3306/jobportal?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC \
  -e DB_USERNAME=jobportal \
  -e DB_PASSWORD=ZpluseAppPass2025! \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=ZpluseRedis2025! \
  -e JWT_SECRET=ZpluseSecretKey2025JobPortalAuthenticationTokenGeneration \
  -e MAIL_USERNAME=aryanforworks@gmail.com \
  -e MAIL_PASSWORD=ZpluseMail2025! \
  -e MAIL_HOST=smtp.gmail.com \
  -e MAIL_PORT=587 \
  --restart unless-stopped \
  ghcr.io/aryanmalikk17/job-portal-fullstack-backend:latest

echo ""
echo "=== VERIFYING BACKEND STARTUP ==="
sleep 10
docker ps | grep backend || echo "Backend container not found in running containers"

echo ""
echo "=== BACKEND CONTAINER LOGS ==="
docker logs jobportal-backend-prod --tail 15 2>/dev/null || echo "No logs available yet"
EOF