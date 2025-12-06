#!/bin/bash
# Manual Deployment Verification Script

echo "🔍 JOB PORTAL DEPLOYMENT VERIFICATION"
echo "====================================="
echo ""

# Check server connectivity
echo "1. Testing server connectivity..."
if ping -c 1 64.227.189.10 &> /dev/null; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable"
    exit 1
fi

# Check if application is responding
echo ""
echo "2. Testing application endpoints..."

# Test health endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://64.227.189.10/health)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Frontend health endpoint working (HTTP $HTTP_STATUS)"
else
    echo "❌ Frontend health endpoint failed (HTTP $HTTP_STATUS)"
fi

# Test backend health endpoint
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://64.227.189.10:8080/actuator/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend health endpoint working (HTTP $BACKEND_STATUS)"
else
    echo "❌ Backend health endpoint failed (HTTP $BACKEND_STATUS)"
fi

# Check Docker containers via SSH
echo ""
echo "3. Checking Docker containers..."
ssh -i ~/.ssh/jobportal_do root@64.227.189.10 << 'EOF'
echo "=== CONTAINER STATUS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== CONTAINER HEALTH ==="
for container in jobportal-mysql-prod jobportal-redis-prod jobportal-app-prod jobportal-nginx-prod; do
    if docker ps | grep -q $container; then
        echo "✅ $container is running"
    else
        echo "❌ $container is not running"
    fi
done

echo ""
echo "=== RECENT APPLICATION LOGS ==="
docker logs jobportal-app-prod --tail 5 2>/dev/null || echo "No backend logs available"
EOF

# Test domain if configured
echo ""
echo "4. Testing domain configuration..."
# Note: Replace 'your-domain.com' with actual domain from GitHub secrets
DOMAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com 2>/dev/null)
if [ "$DOMAIN_RESPONSE" = "200" ]; then
    echo "✅ Domain is working with SSL"
elif [ "$DOMAIN_RESPONSE" = "000" ]; then
    echo "⚠️  Domain not configured or DNS not propagated"
else
    echo "⚠️  Domain responding but with status: $DOMAIN_RESPONSE"
fi

echo ""
echo "5. Deployment Summary:"
echo "======================"
echo "📱 Application IP: http://64.227.189.10"
echo "🔍 Backend API: http://64.227.189.10:8080/actuator/health" 
echo "🌐 Domain: https://your-domain.com (if configured)"
echo "📊 GitHub Actions: https://github.com/Aryanmalikk17/job-portal-fullstack/actions"
echo ""
echo "🎉 Verification complete!"