# 🐳 Docker Deployment Guide - Kodespace

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

### 2. Build Docker Image Manually

```bash
# Build the image
docker build -t kodespace:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e MONGODB_URI=your-mongodb-uri \
  --name kodespace-app \
  kodespace:latest
```

## Environment Variables

Create a `.env.production` file with:

```env
NODE_ENV=production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kodespace
```

## Production Deployment

### 1. Update Environment Variables

```bash
# Copy and edit production env file
cp .env.docker .env.production
nano .env.production
```

### 2. Build for Production

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

### 3. Monitor Application

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# View resource usage
docker stats kodespace-app
```

## Docker Commands

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh
```

### Image Management

```bash
# Build image
docker-compose build --no-cache

# Remove old images
docker image prune -a

# List images
docker images
```

### Debugging

```bash
# Access container shell
docker exec -it kodespace-app sh

# View container logs
docker logs kodespace-app

# Inspect container
docker inspect kodespace-app

# Check health
docker inspect --format='{{.State.Health.Status}}' kodespace-app
```

## Performance Optimization

### Multi-Stage Build Benefits

- **Small Image Size**: Only production dependencies
- **Fast Startup**: Optimized build process
- **Security**: Non-root user execution
- **Caching**: Layer caching for faster rebuilds

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

## Security Best Practices

✅ **Implemented:**

- Multi-stage builds
- Non-root user execution
- Minimal base image (Alpine)
- Health checks
- No secrets in Dockerfile
- .dockerignore for sensitive files

## Troubleshooting

### Issue: Container won't start

```bash
# Check logs
docker logs kodespace-app

# Check health
docker inspect kodespace-app | grep Health -A 10
```

### Issue: Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 kodespace:latest
```

### Issue: Build fails

```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test .
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t kodespace:latest .
      
      - name: Push to registry
        run: |
          docker tag kodespace:latest registry.example.com/kodespace:latest
          docker push registry.example.com/kodespace:latest
```

## Production Checklist

- [ ] Update NEXTAUTH_SECRET with strong random value
- [ ] Configure production MongoDB URI
- [ ] Set correct NEXTAUTH_URL (your domain)
- [ ] Enable HTTPS/SSL
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set resource limits
- [ ] Enable auto-restart policies
- [ ] Configure environment-specific settings

## Support

For issues or questions, check the main README.md or create an issue.
