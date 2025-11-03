#!/bin/bash

# DevSecOps Project - Local Setup Script
# This script sets up the complete local development environment

set -e

echo "🚀 DevSecOps Project - Local Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is not installed. Please install Node.js 18+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is not installed. Please install npm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is not installed. Please install Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is not installed. Please install Docker Compose"; exit 1; }

echo "✅ All prerequisites installed"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t vulnerable-app:latest .
echo "✅ Docker image built"
echo ""

# Start services
echo "🚀 Starting services with Docker Compose..."
docker-compose up -d
echo "✅ Services started"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Application is healthy"
else
    echo "⚠️  Application health check failed"
fi

if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus is healthy"
else
    echo "⚠️  Prometheus health check failed"
fi

if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Grafana is healthy"
else
    echo "⚠️  Grafana health check failed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Access your services:"
echo "   Application:  http://localhost:3000"
echo "   Prometheus:   http://localhost:9090"
echo "   Grafana:      http://localhost:3001 (admin/admin123)"
echo "   cAdvisor:     http://localhost:8080"
echo "   Alertmanager: http://localhost:9093"
echo ""
echo "📚 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
