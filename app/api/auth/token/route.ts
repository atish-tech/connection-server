import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Simple endpoint to create a test token for socket authentication
 * This is for development purposes only
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // Allow passing a user ID as a query parameter
    const userId = url.searchParams.get('userId') || 'test-user-id';
    
    // Create a simple JWT token
    const token = jwt.sign(
      { 
        id: userId,
        email: `${userId}@example.com` 
      }, 
      process.env.JWT_SECRET || '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b',
      { expiresIn: '24h' }
    );

    return NextResponse.json({ 
      token,
      userId,
      message: 'Test token generated successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Error generating test token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
