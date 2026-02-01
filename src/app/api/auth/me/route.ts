import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Use the middleware to authenticate
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: user
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
