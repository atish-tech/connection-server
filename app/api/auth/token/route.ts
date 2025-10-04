import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Simple endpoint to create a test token for socket authentication
 * This is for development purposes only
 */
export async function GET(request: Request) {
  try {
    // Use NextRequest for better compatibility
    const url = new URL(request.url);
    // Allow passing a user ID as a query parameter
    const userId = url.searchParams.get('userId') || 'test-user-id';
    
    const secret = process.env.JWT_SECRET || '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b';
    
    // Create a properly formatted JWT token
    const token = jwt.sign(
      { 
        id: userId,
        email: `${userId}@example.com` 
      }, 
      secret,
      { 
        expiresIn: '24h'
      }
    );

    console.log(`Token generated successfully for user: ${userId}`);

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
