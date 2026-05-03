import { NextRequest, NextResponse } from 'next/server';
import { getOne, update, executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if reset token exists and is valid
    const resetRecord = await getOne(`
      SELECT pr.user_id, pr.expires_at, u.email 
      FROM password_resets pr 
      JOIN users u ON pr.user_id = u.id 
      WHERE pr.token = ? AND pr.used = FALSE
    `, [token]);

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await update(
      'users',
      { password: hashedPassword },
      { id: resetRecord.user_id }
    );

    // Mark the reset token as used
    await update(
      'password_resets',
      { used: true, used_at: new Date() },
      { token: token }
    );

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if reset token exists and is valid
    const resetRecord = await getOne(`
      SELECT pr.expires_at, u.email 
      FROM password_resets pr 
      JOIN users u ON pr.user_id = u.id 
      WHERE pr.token = ? AND pr.used = FALSE
    `, [token]);

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetRecord.email
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'An error occurred while validating the reset token' },
      { status: 500 }
    );
  }
}
