import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize user (admin or super_admin only)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get active supervisors with capacity information
    const supervisors = await getMany(`
      SELECT 
        s.id,
        s.department,
        s.specialization,
        s.max_students,
        s.current_students,
        s.is_active,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        (s.max_students - s.current_students) as available_capacity
      FROM supervisors s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = 1 
      AND s.is_active = 1
      AND s.current_students < s.max_students
      ORDER BY u.first_name, u.last_name
    `);

    return NextResponse.json({
      supervisors
    });

  } catch (error) {
    console.error('Get available supervisors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
