#!/bin/bash

# IMMEDIATE VERIFICATION COMMANDS
# Copy and paste these on your DigitalOcean server

echo "🔍 IMMEDIATE DEPLOYMENT CHECK"
echo "============================="
echo "📅 $(date)"
echo "🖥️ $(hostname)"
echo ""

# Navigate to deployment directory
cd /opt/jobportal

# Quick status check
echo "📁 Current directory: $(pwd)"
echo ""

# Check all running containers
echo "🐳 ALL DOCKER CONTAINERS:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Check Job Portal specific containers
echo "🎯 JOB PORTAL CONTAINERS STATUS:"
docker ps | grep jobportal && echo "Found Job Portal containers" || echo "❌ No Job Portal containers running!"
echo ""

# Quick health test
echo "🏥 QUICK HEALTH TESTS:"
echo -n "Frontend: "
curl -s -I http://localhost/ | head -1 || echo "FAILED"

echo -n "Backend: "  
curl -s -I http://localhost:8080/actuator/health | head -1 || echo "FAILED"

echo -n "External: "
curl -s -I https://zplusejobs.com/ | head -1 || echo "FAILED"
echo ""

# Check if docker-compose is properly set up
echo "📋 DOCKER COMPOSE STATUS:"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "✅ QUICK CHECK COMPLETE!"
echo "If containers aren't running, restart with:"
echo "docker-compose -f docker-compose.prod.yml up -d"