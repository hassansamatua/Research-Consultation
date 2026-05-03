import { NextRequest, NextResponse } from 'next/server';
import { getOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/me`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const user = authData.user;

    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get the student's record
    const student = await getOne(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      );
    }

    // Get the student's supervisor allocation
    let allocation = null;
    try {
      allocation = await getOne(`
        SELECT 
          sa.*,
          s.first_name,
          s.last_name,
          s.email,
          s.phone,
          sup.department,
          sup.specialization,
          sup.academic_rank,
          sup.staff_id,
          sup.user_id as supervisor_user_id
        FROM supervisor_allocations sa
        JOIN supervisors sup ON sa.supervisor_id = sup.id
        JOIN users s ON sup.user_id = s.id
        WHERE sa.student_id = ? AND sa.status = 'active'
        ORDER BY sa.created_at DESC
        LIMIT 1
      `, [student.id]);
    } catch (error) {
      console.log('No supervisor allocation found');
    }

    return NextResponse.json({
      allocation: allocation,
      message: allocation ? 'Supervisor found' : 'No supervisor assigned'
    });

  } catch (error) {
    console.error('Get my supervisor error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisor information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
