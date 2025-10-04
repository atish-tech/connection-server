# Database and Services Seeding Guide

This guide explains how to use the comprehensive seed file to set up your Connection Server application with all necessary data and services.

## Overview

The seed file (`prisma/seed.js`) initializes:
- **Database**: Users, servers, channels, messages, and members
- **MinIO**: Object storage bucket with sample files
- **Redis**: Cache data and session management
- **Kafka**: Message broker topics for real-time communication

## Prerequisites

Make sure you have the following services running:
- PostgreSQL database
- Redis server
- MinIO server
- Kafka with Zookeeper

## Quick Start

### Using Docker (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run the seed:**
   ```bash
   npm run docker:seed
   ```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Run the seed:**
   ```bash
   npm run seed
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run seed` | Run the seed file |
| `npm run seed:dev` | Run seed in development mode |
| `npm run seed:prod` | Run seed in production mode |
| `npm run db:seed` | Run seed using Prisma CLI |
| `npm run db:reset` | Reset database and run seed |
| `npm run docker:seed` | Run seed in Docker container |

## What Gets Created

### Database Data

#### Users (6 total)
- **Admin User**: `admin@example.com` / `admin123`
- **Test Users**: 5 additional users with realistic profiles and random profile images
  - Alice Johnson, Bob Smith, Charlie Brown, Diana Prince, Eve Wilson
  - All passwords: `test123`
  - **Random Profile Images**: Each user gets a random professional headshot from Unsplash

#### Servers (4 total)
- **Gaming Community** - Gaming-themed server image
- **Tech Discussion** - Technology-themed server image  
- **Art & Design** - Art-themed server image
- **Music Lovers** - Music-themed server image

#### Channels
- Multiple channels per server (3-6 channels each)
- Mix of TEXT, VOICE, and VIDEO channels
- Sample channels: general, random, announcements, voice-chat, video-calls, introductions

#### Messages
- Welcome messages in each text channel
- Sample conversations
- File messages (TEXT, IMAGE, PDF types)

### MinIO Setup

#### Bucket Configuration
- **Bucket Name**: `connection-server` (configurable via `MINIO_BUCKET_NAME`)
- **Policy**: Public read access for uploaded files
- **Region**: `us-east-1`

#### Sample Files
- `samples/welcome.txt` - Welcome message
- `samples/sample-image.jpg` - Sample image file
- `samples/document.pdf` - Sample PDF document

### Redis Setup

#### Cache Data
- `app:status` - Application status
- `app:version` - Application version
- `app:last_seed` - Last seed timestamp

#### Session Data
- Sample user sessions with roles and login timestamps
- Session expiration: 1 hour

### Kafka Topics

The following topics are created:
- `user-events` - User-related events
- `server-events` - Server management events
- `channel-events` - Channel operations
- `message-events` - Message broadcasting
- `notification-events` - User notifications

## Environment Variables

Ensure these environment variables are set:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/connection_server?schema=public

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=connection-server
MINIO_USE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKER=localhost:29092
```

## Troubleshooting

### Common Issues

1. **Connection refused errors**
   - Ensure all services (PostgreSQL, Redis, MinIO, Kafka) are running
   - Check environment variables match your setup

2. **MinIO bucket already exists**
   - This is normal if you've run the seed before
   - The script will skip bucket creation if it exists

3. **Kafka topic already exists**
   - This is normal if topics were created previously
   - The script handles existing topics gracefully

4. **Redis connection issues**
   - Ensure Redis is running on the specified host/port
   - Check Redis configuration

### Reset Everything

To start fresh:

```bash
# Stop all services
docker-compose down -v

# Remove all data volumes
docker-compose down -v --remove-orphans

# Start services again
docker-compose up -d

# Run seed
npm run docker:seed
```

## Development Workflow

1. **First time setup:**
   ```bash
   npm run docker:up
   npm run docker:seed
   ```

2. **Reset during development:**
   ```bash
   npm run db:reset
   ```

3. **Add new seed data:**
   - Edit `prisma/seed.js`
   - Run `npm run seed`

## Production Considerations

- Change default passwords in production
- Use secure environment variables
- Configure proper MinIO policies
- Set up Redis persistence
- Configure Kafka replication for production

## Troubleshooting

If you encounter issues:

1. Check service logs:
   ```bash
   docker-compose logs [service-name]
   ```

2. Verify connections:
   ```bash
   # Test database
   npx prisma db pull

   # Test Redis
   redis-cli ping

   # Test MinIO
   curl http://localhost:9000/minio/health/live
   ```

3. Check environment variables:
   ```bash
   printenv | grep -E "(DATABASE_URL|MINIO_|REDIS_|KAFKA_)"
   ```

## Support

For issues with the seed file or setup process, check:
- Service logs for connection errors
- Environment variable configuration
- Network connectivity between services
- Service-specific documentation (PostgreSQL, Redis, MinIO, Kafka)
