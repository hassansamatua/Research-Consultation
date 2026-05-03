import { NextRequest, NextResponse } from 'next/server';
import { getOne, update } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        email: email
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await update(
      'users',
      { password: hashedPassword },
      { id: user.id }
    );

    // Verify the update
    const updatedUser = await getOne('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [user.id]);

    return NextResponse.json({
      message: 'Password reset successfully',
      user: updatedUser,
      newPassword: newPassword,
      passwordHash: hashedPassword
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
