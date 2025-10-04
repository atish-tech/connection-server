# MinIO Test Integration

This document describes how to use and test the MinIO integration in the connection-server project.

## Overview

MinIO is an open-source object storage server compatible with Amazon S3 API. This integration demonstrates how to:

1. Connect to a MinIO server
2. Upload files
3. List files
4. Generate presigned URLs for viewing files
5. Delete files

## Setup

### Environment Variables

The MinIO integration requires the following environment variables:

```
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=test-bucket
MINIO_REGION=us-east-1
```

For local development, you can add these to your `.env.local` file.

### Running MinIO with Docker

We've included MinIO in the `docker-compose.yml` file, so you can start it along with the application:

```bash
docker-compose up
```

Alternatively, you can run just the MinIO service:

```bash
docker-compose up minio
```

### MinIO Console Access

Once running, you can access the MinIO console at:
- URL: `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

## Usage

### Accessing the Test Page

Navigate to `/minio-test` in your browser to access the MinIO test page.

### Features

The test page allows you to:

1. Upload files to MinIO
2. View a list of all uploaded files
3. Generate and use presigned URLs to view files
4. Delete files from storage

### API Endpoints

The following API endpoints are available for MinIO operations:

- `GET /api/minio/list` - List all files in the bucket
- `POST /api/minio/upload` - Upload a file to MinIO
- `DELETE /api/minio/delete?fileName=example.jpg` - Delete a file from MinIO
- `GET /api/minio/init` - Initialize MinIO (create bucket if it doesn't exist)

## Integration Notes

### MinIO Client Configuration

The MinIO client is configured in `/utils/minio.ts` and provides utility functions for common operations. If you need to extend the functionality, you can add additional methods to this file.

### File Operations

The current implementation supports basic file operations. To extend this for your specific use case, you may want to:

1. Add folder/directory support
2. Implement file type restrictions
3. Add metadata support for uploaded files
4. Implement file versioning

## Troubleshooting

### Connection Issues

If you can't connect to MinIO:
1. Ensure the MinIO container is running (`docker ps`)
2. Check that the environment variables match your MinIO configuration
3. Verify network connectivity to the MinIO endpoint

### Permission Issues

If you encounter permission issues:
1. Check that your MinIO access and secret keys are correct
2. Verify that the bucket exists and is accessible
3. Check MinIO logs for permission errors (`docker-compose logs minio`)
