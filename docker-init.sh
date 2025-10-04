#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready"

echo "Waiting for Redis to be ready..."
until nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready"

echo "Waiting for MinIO to be ready..."
until nc -z minio 9000; do
  sleep 1
done
echo "MinIO is ready"

echo "Checking for Kafka..."
# Try to connect to Kafka with a timeout, but don't fail if it's not available
KAFKA_RETRY=0
MAX_RETRIES=5

while [ $KAFKA_RETRY -lt $MAX_RETRIES ]; do
  if nc -z -w 2 kafka 9092 2>/dev/null; then
    echo "Kafka is ready"
    break
  else
    KAFKA_RETRY=$((KAFKA_RETRY+1))
    if [ $KAFKA_RETRY -eq $MAX_RETRIES ]; then
      echo "Kafka is not available after $MAX_RETRIES attempts, continuing anyway..."
      export KAFKA_AVAILABLE=false
      break
    fi
    echo "Waiting for Kafka... attempt $KAFKA_RETRY of $MAX_RETRIES"
    sleep 3
  fi
done

echo "Running database migrations..."
npx prisma migrate deploy

echo "Skipping MinIO initialization in Docker for now..."
# We'll manually initialize MinIO once the app is running

echo "Starting the server..."
exec "$@"
