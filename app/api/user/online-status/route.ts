import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/utils/redis-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const serverId = searchParams.get('serverId');
    const channelId = searchParams.get('channelId') 
      ? parseInt(searchParams.get('channelId')!, 10) 
      : undefined;
    
    // Simplified version that just returns basic status
    let response: any = { 
      online: true,
      count: 1,
      timestamp: new Date().toISOString()
    };
    
    // If userId is provided, check if the user exists in Redis
    if (userId) {
      try {
        // Simple check if any key for this user exists
        const key = `user:presence:${userId}`;
        const exists = await redisClient.exists(key);
        response.isOnline = exists > 0;
      } catch (err) {
        console.error('Redis error checking user status:', err);
        response.isOnline = false;
      }
    }
    
    // Add context info to response
    if (channelId) {
      response.context = 'channel';
      response.channelId = channelId;
    } else if (serverId) {
      response.context = 'server';
      response.serverId = serverId;
    } else {
      response.context = 'global';
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Error fetching online status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online status', online: false },
      { status: 500 }
    );
  }
}