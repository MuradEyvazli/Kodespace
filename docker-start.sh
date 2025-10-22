#!/bin/bash

echo "🐳 Kodespace Docker Deployment"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found. Creating from template..."
    cp .env.docker .env.production
    echo "✅ Created .env.production - Please update with your values!"
    echo ""
fi

# Load environment variables
export $(cat .env.production | xargs)

echo "📦 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting application..."
docker-compose up -d

echo ""
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check health
if docker-compose ps | grep -q "Up"; then
    echo "✅ Application is running!"
    echo ""
    echo "🌐 Access your application at: http://localhost:3000"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop app: docker-compose down"
    echo ""
else
    echo "❌ Application failed to start. Check logs:"
    echo "   docker-compose logs"
fi
