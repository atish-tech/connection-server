# Docker Video Call Infrastructure Setup

This Docker setup provides a complete infrastructure for audio/video calling features using LiveKit, COTURN, Redis, and Nginx.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Next.js App   │    │    LiveKit      │
│  (Reverse Proxy)│────│  (Frontend/API) │────│  (WebRTC Server)│
│     SSL/TLS     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     COTURN      │    │      Redis      │    │   Prometheus    │
│  (STUN/TURN)    │    │  (Session Store)│    │  (Monitoring)   │
│   NAT Traversal │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. Next.js Application (`app`)
- **Port**: 3000
- **Purpose**: Main application with video call UI
- **Dependencies**: LiveKit client libraries already included

### 2. LiveKit Server (`livekit`)
- **Ports**: 7880 (WebSocket), 7881 (HTTP), 7882 (TURN/STUN)
- **Purpose**: WebRTC signaling and media routing
- **Features**: 
  - Simulcast support
  - Hardware acceleration
  - Multiple codec support (H.264, VP8, VP9, Opus)

### 3. COTURN Server (`coturn`)
- **Ports**: 3478 (STUN/TURN), 5349 (STUNS/TURNS), 49152-65535 (Media relay)
- **Purpose**: NAT traversal for WebRTC connections
- **Features**:
  - STUN/TURN server
  - UDP/TCP support
  - Authentication

### 4. Redis (`redis`)
- **Port**: 6379
- **Purpose**: Session management and real-time features
- **Features**:
  - Pub/Sub for real-time events
  - Session storage
  - Optimized for low latency

### 5. Nginx (`nginx`)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Purpose**: Reverse proxy, SSL termination, load balancing
- **Features**:
  - WebSocket proxying
  - Rate limiting
  - SSL/TLS termination

### 6. Prometheus (`prometheus`)
- **Port**: 9090
- **Purpose**: Monitoring and metrics collection
- **Features**:
  - LiveKit metrics
  - System monitoring
  - Alerting capabilities

## Quick Start

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit environment variables as needed
nano .env
```

### 2. Start Services
```bash
# Build and start all services
docker-compose up --build

# Or start in background
docker-compose up -d --build
```

### 3. Access Services
- **Application**: https://localhost (or http://localhost:3000)
- **LiveKit**: ws://localhost:7880
- **Prometheus**: http://localhost:9090
- **Health Check**: https://localhost/health

## Configuration Files

### LiveKit Configuration (`config/livekit.yaml`)
- WebRTC settings
- TURN server integration
- Redis configuration
- Room and participant limits

### COTURN Configuration (`config/turnserver.conf`)
- STUN/TURN server settings
- Authentication configuration
- Security settings
- NAT traversal optimization

### Redis Configuration (`config/redis.conf`)
- Memory optimization
- Persistence settings
- Pub/Sub configuration
- Performance tuning

### Nginx Configuration (`config/nginx.conf`)
- SSL/TLS configuration
- WebSocket proxying
- Rate limiting
- Security headers

## Environment Variables

### Required Variables
```env
LIVEKIT_URL=ws://livekit:7880
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
TURN_SERVER_URL=turn:coturn:3478
TURN_USERNAME=livekit
TURN_PASSWORD=your-turn-password
```

### Optional Variables
```env
REDIS_URL=redis://redis:6379
NODE_ENV=production
LOG_LEVEL=info
WEBRTC_MIN_PORT=50000
WEBRTC_MAX_PORT=60000
```

## Production Deployment

### 1. SSL Certificates
Replace self-signed certificates with proper SSL certificates:
```bash
# Using Let's Encrypt
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# Copy certificates to ssl directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### 2. Security Hardening
- Change default passwords and secrets
- Enable Redis authentication
- Configure firewall rules
- Update TURN server credentials
- Enable rate limiting

### 3. Scaling Considerations
- Use external Redis cluster
- Deploy multiple LiveKit instances
- Use external load balancer
- Configure TURN server pool

## Monitoring and Troubleshooting

### Health Checks
```bash
# Check service health
curl https://localhost/health

# Check individual services
docker-compose ps
docker-compose logs [service-name]
```

### Metrics
- **Prometheus**: http://localhost:9090
- **LiveKit metrics**: Available through Prometheus
- **Application logs**: `docker-compose logs app`

### Common Issues

#### 1. WebRTC Connection Issues
- Check TURN server configuration
- Verify firewall settings
- Ensure UDP ports are open (49152-65535)

#### 2. SSL Certificate Issues
- Verify certificate paths in nginx.conf
- Check certificate validity
- Ensure proper domain configuration

#### 3. Performance Issues
- Monitor Redis memory usage
- Check LiveKit CPU/memory usage
- Review Nginx access logs

## Development

### Local Development
```bash
# Start only required services for development
docker-compose up redis livekit coturn

# Run Next.js app locally
npm run dev
```

### Testing WebRTC
1. Open application in multiple browser tabs
2. Create a room
3. Join from different tabs/devices
4. Test audio/video functionality

## API Integration

### LiveKit Client Usage
```typescript
import { Room, connect } from 'livekit-client';

const room = new Room();
await room.connect(process.env.LIVEKIT_URL, token);
```

### TURN Server Configuration
```typescript
const rtcConfig = {
  iceServers: [
    {
      urls: 'stun:localhost:3478'
    },
    {
      urls: 'turn:localhost:3478',
      username: 'livekit',
      credential: 'password'
    }
  ]
};
```

## Maintenance

### Regular Tasks
- Monitor disk usage (Redis persistence, logs)
- Update Docker images
- Rotate SSL certificates
- Review security logs
- Backup configuration files

### Updates
```bash
# Update images
docker-compose pull

# Restart services
docker-compose down && docker-compose up -d
```

## Support

For issues and questions:
1. Check logs: `docker-compose logs [service]`
2. Verify configuration files
3. Test network connectivity
4. Review environment variables
5. Check firewall settings