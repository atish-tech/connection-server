# Docker Setup for Connection-Server

This document explains how to run the Connection-Server application using Docker.

> **Note:** The application is configured to run in development mode for easier debugging.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### 1. Setup

First, run the setup script to initialize the environment:

```bash
# Create the scripts directory if it doesn't exist
mkdir -p scripts

# Run the setup script
node scripts/setup-docker.js
```

This will generate a random JWT secret and update the docker-compose.yml file.

### 2. Start the Application

```bash
# Build and start all services
docker-compose up -d

# To rebuild the containers after code changes
docker-compose up -d --build
```

### 3. Access the Application

- Web application: http://localhost:3000
- MinIO console: http://localhost:9001 (Login with minioadmin/minioadmin)

### 4. Services

The docker-compose.yml file includes the following services:

- **app**: The main Next.js application
- **postgres**: PostgreSQL database
- **redis**: Redis for real-time features and caching
- **minio**: MinIO for object storage
- **zookeeper**: Required for Kafka
- **kafka**: Message broker for real-time communication

### 5. Database Seeding

The database is automatically seeded with sample data when the containers start up. The seed data includes:

- Admin user: admin@example.com / admin123
- Test users: test1@example.com, test2@example.com, test3@example.com (all with password: test123)
- A sample server with general, random, and introductions channels

### 6. Logs

To view logs for a specific service:

```bash
docker-compose logs -f app     # For application logs
docker-compose logs -f postgres # For database logs
```

### 7. Stopping the Application

```bash
docker-compose down
```

To completely remove all data volumes (this will delete all data):

```bash
docker-compose down -v
```

## Troubleshooting

### Permission Issues

If you see "permission denied" errors for the docker-init.sh script:

```bash
# Make the script executable
chmod +x docker-init.sh

# Restart containers
docker-compose down && docker-compose up -d
```

### Database Connection Issues

If the application can't connect to the database:

```bash
# Restart the postgres service
docker-compose restart postgres

# Then restart the app
docker-compose restart app
```

### Kafka Connection Issues

If Kafka connectivity issues occur:

```bash
# Check Kafka logs
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka zookeeper
```

### MinIO Issues

To verify MinIO is working correctly:

1. Access the MinIO console at http://localhost:9001
2. Login with minioadmin/minioadmin
3. Verify the 'connection-server' bucket exists

If the bucket doesn't exist, you can create it manually through the MinIO console or run:

```bash
# Install MinIO client
brew install minio/stable/mc  # On macOS
# or for other systems check https://min.io/docs/minio/linux/reference/minio-mc.html

# Configure MinIO client
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Create bucket
mc mb myminio/connection-server
```

## Development with Docker

For local development while using containerized services:

```bash
# Run only the services, not the app
docker-compose up -d postgres redis minio kafka zookeeper

# Run the app locally
npm run dev
```
