# 🧪 Service Testing Guide

This guide explains how to test Redis, Kafka, MinIO, Database, and real-time chat functionality in your connection server.

## 🚀 Quick Test Commands

### Test All Services
```bash
npm run test:connection
```

### Test Individual Services
```bash
# Test Redis connection
npm run test:redis

# Test Kafka connection  
npm run test:kafka

# Test MinIO connection
npm run test:minio

# Test Database connection
npm run test:db

# Test JWT token generation
npm run test:jwt
```

### Comprehensive Service Test
```bash
npm run test:services
```

## 🔧 What Each Test Checks

### ✅ Redis Test
- **Connection**: Tests Redis server connectivity
- **Operations**: Tests SET, GET, DELETE operations
- **Configuration**: Uses environment variables or defaults
- **Expected**: Should show "✅ Redis: Connected and working"

### ✅ Kafka Test  
- **Connection**: Tests Kafka broker connectivity
- **Admin Operations**: Tests topic listing
- **Configuration**: Uses KAFKA_BROKER environment variable
- **Expected**: Should show "✅ Kafka: Connected successfully (X topics)"

### ✅ MinIO Test
- **Connection**: Tests MinIO server connectivity
- **Bucket Check**: Verifies bucket existence
- **Configuration**: Uses MINIO_* environment variables
- **Expected**: Should show "✅ MinIO: Connected and bucket exists"

### ✅ Database Test
- **Connection**: Tests Prisma database connectivity
- **Queries**: Tests basic user and server counts
- **Schema**: Verifies database schema is accessible
- **Expected**: Should show "✅ Database: Connected (X users, Y servers)"

### ✅ JWT Test
- **Token Generation**: Tests JWT token creation
- **Token Verification**: Tests token validation
- **Secret Key**: Uses JWT_SECRET environment variable
- **Expected**: Should show "✅ JWT: Token generation and verification working"

## 🐳 Docker Services Test

If you're using Docker, make sure services are running:

```bash
# Start development services
npm run docker:dev:up

# Or start all services
npm run docker:up

# Check service status
docker-compose ps
```

## 🔍 Manual Testing

### Test Real-time Chat
1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: Navigate to `http://localhost:3000`

3. **Login**: Use test credentials or create account

4. **Test Socket Connection**: 
   - Open browser dev tools
   - Check for WebSocket connections
   - Look for Socket.IO events

### Test API Endpoints
```bash
# Test token generation
curl "http://localhost:3000/api/auth/token?userId=test-user"

# Test socket endpoint
curl "http://localhost:3000/api/socket"

# Test user status
curl "http://localhost:3000/api/user/online-status?userId=test-user"
```

## 🚨 Troubleshooting

### Redis Issues
```bash
# Check Redis is running
redis-cli ping

# Check Redis logs
docker-compose logs redis
```

### Kafka Issues
```bash
# Check Kafka is running
docker-compose logs kafka

# List Kafka topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Database Issues
```bash
# Check database connection
npx prisma db push

# Reset database
npm run db:reset
```

### MinIO Issues
```bash
# Check MinIO is running
docker-compose logs minio

# Access MinIO console
open http://localhost:9001
```

## 📊 Expected Test Results

### ✅ All Services Working
```
🚀 Starting Connection Tests...
================================

🔍 Testing Redis Connection...
✅ Redis: Connected and working

🔍 Testing Kafka Connection...
✅ Kafka: Connected successfully (3 topics)

🔍 Testing Database Connection...
✅ Database: Connected (2 users, 1 servers)

🔍 Testing MinIO Connection...
✅ MinIO: Connected and bucket 'connection-server' exists

🔍 Testing JWT Token Generation...
✅ JWT: Token generation and verification working

📊 Test Results:
================================
✅ REDIS: Working
✅ KAFKA: Working
✅ DATABASE: Working
✅ MINIO: Working
✅ JWT: Working

📈 Results: 5/5 services working
🎉 All services are connected and working!
```

### ⚠️ Partial Issues
```
📈 Results: 4/5 services working
⚠️ 1 service(s) need attention
```

### ❌ Critical Issues
```
📈 Results: 2/5 services working
⚠️ 3 service(s) need attention
```

## 🔧 Environment Variables

Make sure these are set in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/connection_server"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_AVAILABLE=true

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=connection-server

# JWT
JWT_SECRET=44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b
```

## 🎯 Next Steps

1. **Run Tests**: `npm run test:connection`
2. **Fix Issues**: Address any failed services
3. **Start Server**: `npm run dev`
4. **Test Chat**: Open browser and test real-time functionality
5. **Monitor Logs**: Check console for any errors

## 📝 Notes

- Tests are designed to be non-destructive
- They use test data that gets cleaned up
- Tests can be run multiple times safely
- All tests include proper error handling
- Results are color-coded for easy reading

Happy testing! 🚀
