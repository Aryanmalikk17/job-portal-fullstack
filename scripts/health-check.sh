#!/bin/bash
# Health Check Script for Production Deployment
set -e

echo "🔍 Running comprehensive health checks..."

# Configuration
MAX_WAIT=300  # 5 minutes
INTERVAL=10   # 10 seconds
HEALTH_URL="http://localhost:8080/actuator/health"

# Function to check application health
check_app_health() {
    local attempt=1
    local max_attempts=$((MAX_WAIT / INTERVAL))
    
    echo "Checking application health (timeout: ${MAX_WAIT}s)..."
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts..."
        
        # Check if application is responding
        if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
            local health_status=$(curl -s "$HEALTH_URL" | jq -r '.status' 2>/dev/null || echo "UNKNOWN")
            
            if [ "$health_status" = "UP" ]; then
                echo "✅ Application health check passed"
                return 0
            else
                echo "⚠️  Application responding but status: $health_status"
            fi
        else
            echo "⚠️  Application not responding yet..."
        fi
        
        sleep $INTERVAL
        ((attempt++))
    done
    
    echo "❌ Application health check failed after ${MAX_WAIT} seconds"
    return 1
}

# Function to check database health
check_database_health() {
    echo "Checking database connection..."
    
    local db_health=$(curl -s "$HEALTH_URL" | jq -r '.components.db.status' 2>/dev/null || echo "UNKNOWN")
    
    if [ "$db_health" = "UP" ]; then
        echo "✅ Database health check passed"
        return 0
    else
        echo "❌ Database health check failed: $db_health"
        return 1
    fi
}

# Function to check Redis health
check_redis_health() {
    echo "Checking Redis connection..."
    
    local redis_health=$(curl -s "$HEALTH_URL" | jq -r '.components.redis.status' 2>/dev/null || echo "UNKNOWN")
    
    if [ "$redis_health" = "UP" ]; then
        echo "✅ Redis health check passed"
        return 0
    else
        echo "❌ Redis health check failed: $redis_health"
        return 1
    fi
}

# Function to check API endpoints
check_api_endpoints() {
    echo "Checking critical API endpoints..."
    
    # Check main API health endpoint
    local api_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/health" 2>/dev/null || echo "000")
    
    if [ "$api_response" = "200" ]; then
        echo "✅ API endpoints accessible"
        return 0
    else
        echo "❌ API endpoints check failed (HTTP $api_response)"
        return 1
    fi
}

# Function to check frontend accessibility
check_frontend() {
    echo "Checking frontend accessibility..."
    
    local frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:80/" 2>/dev/null || echo "000")
    
    if [ "$frontend_response" = "200" ] || [ "$frontend_response" = "301" ] || [ "$frontend_response" = "302" ]; then
        echo "✅ Frontend accessible"
        return 0
    else
        echo "❌ Frontend check failed (HTTP $frontend_response)"
        return 1
    fi
}

# Function to check container status
check_containers() {
    echo "Checking container status..."
    
    local containers=(
        "jobportal-app-prod"
        "jobportal-mysql-prod" 
        "jobportal-redis-prod"
        "jobportal-nginx-prod"
    )
    
    local failed=false
    
    for container in "${containers[@]}"; do
        local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
        local running=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false")
        
        if [ "$running" = "true" ] && [ "$status" = "healthy" ]; then
            echo "✅ Container $container is healthy"
        elif [ "$running" = "true" ] && [ "$status" = "starting" ]; then
            echo "⚠️  Container $container is starting..."
        else
            echo "❌ Container $container is not healthy (running: $running, health: $status)"
            failed=true
        fi
    done
    
    if [ "$failed" = "true" ]; then
        return 1
    else
        echo "✅ All containers are healthy"
        return 0
    fi
}

# Function to check resource usage
check_resources() {
    echo "Checking resource usage..."
    
    # Check memory usage
    local memory_usage=$(docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | grep jobportal || true)
    if [ -n "$memory_usage" ]; then
        echo "📊 Memory usage:"
        echo "$memory_usage"
    fi
    
    # Check disk usage
    local disk_usage=$(df -h /opt/jobportal 2>/dev/null | tail -1 || echo "N/A")
    echo "📊 Disk usage: $disk_usage"
    
    return 0
}

# Main execution
main() {
    echo "🚀 Starting health checks for Job Portal deployment..."
    echo "Timestamp: $(date)"
    
    local failed=false
    
    # Run all health checks
    check_containers || failed=true
    sleep 5
    
    check_app_health || failed=true
    check_database_health || failed=true
    check_redis_health || failed=true
    check_api_endpoints || failed=true
    check_frontend || failed=true
    
    # Resource checks (informational)
    check_resources
    
    echo ""
    echo "=========================================="
    
    if [ "$failed" = "true" ]; then
        echo "❌ HEALTH CHECK FAILED"
        echo "Some services are not healthy. Check the logs above for details."
        echo "Run 'docker-compose -f docker-compose.prod.yml logs' for more information."
        exit 1
    else
        echo "✅ ALL HEALTH CHECKS PASSED"
        echo "🎉 Job Portal is running successfully!"
        echo ""
        echo "🌐 Application URL: http://localhost"
        echo "📊 Monitoring: http://localhost:9090 (Prometheus)"
        echo "📈 Dashboards: http://localhost:3000 (Grafana)"
        echo ""
        echo "Deployment completed at: $(date)"
        exit 0
    fi
}

# Run main function
main "$@"