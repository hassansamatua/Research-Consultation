import { NextRequest, NextResponse } from 'next/server';
import { getOne } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getOne(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.is_active = 1
    `, [email]);

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        email: email
      });
    }

    // Test password verification
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Test with common passwords
    const commonPasswords = ['password123', 'password', 'admin', '123456'];
    const passwordTests = [];
    
    for (const testPassword of commonPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      passwordTests.push({
        password: testPassword,
        valid: isValid
      });
    }

    return NextResponse.json({
      email: email,
      found: true,
      isActive: user.is_active,
      role: user.role_name,
      passwordHash: user.password,
      testPassword: password,
      testPasswordValid: isPasswordValid,
      commonPasswordTests: passwordTests,
      message: isPasswordValid ? 'Password is valid' : 'Password is invalid'
    });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
