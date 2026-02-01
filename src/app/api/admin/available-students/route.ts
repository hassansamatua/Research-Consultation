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

    // Get students without active supervisor allocations
    const students = await getMany(`
      SELECT 
        s.id,
        s.registration_number,
        s.program,
        s.status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.enrollment_date,
        s.expected_completion
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = 1 
      AND s.status = 'active'
      AND s.id NOT IN (
        SELECT student_id 
        FROM supervisor_allocations 
        WHERE is_active = 1
      )
      ORDER BY u.first_name, u.last_name
    `);

    return NextResponse.json({
      students
    });

  } catch (error) {
    console.error('Get available students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
