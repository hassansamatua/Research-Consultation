import { NextRequest, NextResponse } from 'next/server';
import { getOne, insert } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getOne(
      'SELECT id, first_name, last_name, email FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await insert('password_resets', {
      user_id: user.id,
      token: resetToken,
      expires_at: resetTokenExpiry,
      created_at: new Date()
    });

    // In a real application, you would send an email here
    // For now, we'll just return the token for testing
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl);
    console.log('Reset token:', resetToken);

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      // For development only - remove in production
      resetLink: resetUrl,
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
