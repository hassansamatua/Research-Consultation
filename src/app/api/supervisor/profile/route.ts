import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Supervisor profile API called');
    
    // Authenticate user
    const user = await authenticateRequest(request);
    console.log('👤 Authenticated user:', user);
    
    if (!user) {
      console.log('❌ User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role_name !== 'supervisor') {
      console.log('❌ User is not a supervisor, role:', user.role_name);
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    console.log('✅ User is supervisor, fetching profile for user_id:', user.id);

    // Get supervisor record
    const supervisor = await getOne(
      'SELECT s.*, u.first_name, u.last_name, u.email, u.phone FROM supervisors s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?',
      [user.id]
    );

    console.log('👨‍🏫 Supervisor query result:', supervisor);

    if (!supervisor) {
      console.log('❌ Supervisor profile not found for user_id:', user.id);
      return NextResponse.json(
        { error: 'Supervisor profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Supervisor profile found, returning data');
    return NextResponse.json({
      supervisor: supervisor
    });

  } catch (error) {
    console.error('❌ Get supervisor profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisor profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
