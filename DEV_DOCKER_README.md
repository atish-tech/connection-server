# Development Docker Setup

This setup provides development infrastructure services (PostgreSQL, Redis, MinIO, Zookeeper, Kafka) without including the Next.js application. This allows you to run the backend services while developing the Next.js app locally.

## Services

- **PostgreSQL**: Database running on port 5432
  - Username: postgres
  - Password: postgres
  - Database: connection_server

- **Redis**: In-memory data store running on port 6379

- **MinIO**: S3-compatible object storage
  - API: http://localhost:9000
  - Console: http://localhost:9001
  - Username: minioadmin
  - Password: minioadmin
  - Bucket: connection-server

- **Zookeeper**: Service for coordinating Kafka running on port 2181

- **Kafka**: Message broker running on ports 9092 and 29092

## Usage

### Starting the services

You can use the provided script, which will:
1. Create a `.env` file with the appropriate development settings
2. Start all the Docker containers
3. Set up the MinIO bucket

```bash
./dev-docker-init.sh
```

Or manually:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stopping the services

```bash
docker-compose -f docker-compose.dev.yml down
```

### Viewing logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Specific service (e.g., kafka)
docker-compose -f docker-compose.dev.yml logs kafka
```

## Environment Variables

The `dev-docker-init.sh` script automatically creates a `.env` file with the following variables:

```
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
```

These environment variables are configured for local development, connecting your Next.js app to the Docker services.

## Data Persistence

All data is persisted in Docker volumes:
- postgres_data
- redis_data
- minio_data
- zookeeper_data
- kafka_data

To completely reset the data, you can remove the volumes:

```bash
docker-compose -f docker-compose.dev.yml down -v
```
