#!/bin/bash

# Video Call Docker Stack Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running ✓"
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
    print_status "docker-compose is available ✓"
}

# Create environment file if it doesn't exist
setup_environment() {
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            print_warning "No .env file found. Copying from .env.example"
            cp .env.example .env
            print_status "Created .env file. Please review and update the configuration."
        else
            print_error "No .env.example file found. Please create environment configuration."
            exit 1
        fi
    else
        print_status "Environment file exists ✓"
    fi
}

# Check if SSL certificates exist
check_ssl_certificates() {
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        print_warning "SSL certificates not found. Creating self-signed certificates for development..."
        mkdir -p ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
            > /dev/null 2>&1
        print_status "Self-signed SSL certificates created ✓"
    else
        print_status "SSL certificates exist ✓"
    fi
}

# Start the services
start_services() {
    print_status "Starting video call infrastructure..."
    
    # Pull latest images
    print_status "Pulling latest Docker images..."
    docker-compose pull
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up -d --build
    
    # Wait a moment for services to start
    sleep 5
    
    # Check service health
    print_status "Checking service health..."
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are starting up..."
        
        # Wait for health check
        print_status "Waiting for health check..."
        sleep 10
        
        # Test health endpoint
        if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
            print_status "Health check passed ✓"
        else
            print_warning "Health check failed. Services may still be starting up."
        fi
        
        print_status "Video call infrastructure is ready!"
        echo
        echo "Access points:"
        echo "  - Application: https://localhost (or http://localhost:3000)"
        echo "  - LiveKit WebSocket: ws://localhost:7880"
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Health Check: http://localhost:3000/api/health"
        echo
        echo "To view logs: docker-compose logs -f"
        echo "To stop services: docker-compose down"
        
    else
        print_error "Failed to start some services. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Main execution
main() {
    print_status "Starting Video Call Docker Stack Setup..."
    
    check_docker
    check_docker_compose
    setup_environment
    check_ssl_certificates
    start_services
    
    print_status "Setup completed successfully! 🎉"
}

# Run main function
main "$@"