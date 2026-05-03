import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { update } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, phone } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (optional)
    if (phone && !/^[+]?[\d\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    console.log('📝 Updating profile for user:', user.id, {
      first_name,
      last_name,
      phone
    });

    // Update user profile
    const updateData = {
      first_name,
      last_name,
      phone: phone || null, // Allow null for empty phone
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const result = await update('users', updateData, { id: user.id });

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log('✅ Profile updated successfully for user:', user.id);

    // Fetch updated user data to return
    const { getOne } = await import('@/lib/db');
    const updatedUser = await getOne(
      'SELECT id, first_name, last_name, email, phone, role_id FROM users WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user data including phone from database
    const { getOne } = await import('@/lib/db');
    const fullUserData = await getOne(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user: fullUserData
    });

  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
