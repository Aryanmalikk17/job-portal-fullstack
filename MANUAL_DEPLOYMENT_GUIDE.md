# Manual Frontend Fix Deployment Guide

## STEP 1: Upload Files to DigitalOcean

You'll need to manually upload these files to your server at `/opt/jobportal/`:

### Required Files:
- `.env.prod` (environment variables)
- `docker-compose.prod.yml` (complete docker configuration)
- `frontend/Dockerfile.prod` (production dockerfile)
- `frontend/build/` (entire build directory)
- `nginx/nginx.prod.conf` (nginx configuration)

### Upload Methods:
1. **Using SCP with Password:**
   ```bash
   scp .env.prod root@64.227.189.10:/opt/jobportal/
   scp docker-compose.prod.yml root@64.227.189.10:/opt/jobportal/
   scp -r frontend/ root@64.227.189.10:/opt/jobportal/
   scp -r nginx/ root@64.227.189.10:/opt/jobportal/
   ```

2. **Using SFTP Client (FileZilla, WinSCP, etc.):**
   - Connect to: 64.227.189.10
   - User: root
   - Upload to: /opt/jobportal/

## STEP 2: Connect to Server & Deploy

```bash
ssh root@64.227.189.10
cd /opt/jobportal
```

## STEP 3: Deploy the Frontend Fix

```bash
# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Clean up
docker system prune -f

# Build and start with new configuration
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
sleep 30

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## STEP 4: Verify Deployment

```bash
# Check container logs
docker logs jobportal-frontend-prod
docker logs jobportal-nginx-prod

# Test endpoints
curl -I http://localhost/
curl -I https://zplusejobs.com/
```

## Expected Result:
✅ Frontend accessible at: https://zplusejobs.com
✅ Backend API at: https://zplusejobs.com/api