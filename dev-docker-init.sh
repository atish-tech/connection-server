#!/bin/bash

# Make sure script is executable
# chmod +x ./dev-docker-init.sh

# Create .env file for development
cat > .env << EOL
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/connection_server?schema=public

# JWT
JWT_SECRET=44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_AVAILABLE=true
KAFKA_BROKER=localhost:29092

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=connection-server
MINIO_USE_SSL=false

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# For development only
NODE_ENV=development
EOL

echo "Created .env file"

# Stop and remove any existing containers from dev setup
docker-compose -f docker-compose.dev.yml down

# Start the services
docker-compose -f docker-compose.dev.yml up -d

# Setup MinIO
sleep 5
echo "Setting up MinIO..."
docker exec minio mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Check if bucket exists before creating
if ! docker exec minio mc ls myminio | grep -q "connection-server"; then
  echo "Creating MinIO bucket 'connection-server'..."
  docker exec minio mc mb myminio/connection-server
else
  echo "MinIO bucket 'connection-server' already exists."
fi

# Set public access policy for the bucket
echo "Setting bucket policy..."
docker exec minio mc anonymous set download myminio/connection-server

# Display running containers
docker-compose -f docker-compose.dev.yml ps
