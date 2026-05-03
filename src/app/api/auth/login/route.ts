import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { testConnection } from '@/lib/db';
import { createDatabaseErrorResponse } from '@/lib/dbErrorHandler';

export async function POST(request: NextRequest) {
  try {
    // Test database connection with better error handling
    const dbConnected = await testConnection();
    if (!dbConnected) {
      return NextResponse.json(
        { 
          error: 'Database is temporarily unavailable. Please try again in a few moments.',
          retryable: true 
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user with remember me preference
    const result = await authenticateUser(email, password, rememberMe);

    // Set HTTP-only cookie with token
    const response = NextResponse.json({
      message: 'Login successful',
      user: result.user,
      expiresIn: result.expiresIn
    });

    // Calculate cookie max age based on remember me
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: maxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle database connection errors specifically
    const dbError = createDatabaseErrorResponse(error);
    if (dbError.isConnectionError) {
      return NextResponse.json(dbError, { status: 503 });
    }
    
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
