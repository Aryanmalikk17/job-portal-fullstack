#!/bin/bash

# Quick Server Status Check - Run this directly on your DigitalOcean server
echo "🔍 QUICK DEPLOYMENT VERIFICATION"
echo "=================================="

# Check if we're in the right directory
cd /opt/jobportal || { echo "❌ /opt/jobportal directory not found!"; exit 1; }

echo "📍 Current directory: $(pwd)"
echo ""

# Check Docker Compose status
echo "🐳 Docker Compose Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Quick container count
RUNNING=$(docker ps | wc -l)
echo "📊 Running containers: $((RUNNING-1))"
echo ""

# Check specific Job Portal containers
echo "🎯 Job Portal Container Status:"
docker ps --format "{{.Names}} - {{.Status}}" | grep jobportal || echo "No jobportal containers found"
echo ""

# Quick health tests
echo "🏥 Quick Health Tests:"
echo -n "Frontend: "
curl -s -I http://localhost/ | head -1 || echo "FAILED"

echo -n "Backend: "
curl -s -I http://localhost:8080/actuator/health | head -1 || echo "FAILED"

echo -n "External: "
curl -s -I https://zplusejobs.com | head -1 || echo "FAILED"
echo ""

echo "🔍 For detailed verification, run: ./verify-docker-status.sh"