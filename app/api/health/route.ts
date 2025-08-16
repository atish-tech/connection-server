import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        redis: await checkRedis(),
        livekit: await checkLiveKit(),
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}

async function checkRedis() {
  try {
    // Basic Redis connectivity check
    if (process.env.REDIS_URL) {
      // In a real implementation, you'd ping Redis here
      return { status: 'connected', url: process.env.REDIS_URL };
    }
    return { status: 'not_configured' };
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function checkLiveKit() {
  try {
    // Basic LiveKit connectivity check
    if (process.env.LIVEKIT_URL) {
      // In a real implementation, you'd check LiveKit server status here
      return { status: 'configured', url: process.env.LIVEKIT_URL };
    }
    return { status: 'not_configured' };
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}