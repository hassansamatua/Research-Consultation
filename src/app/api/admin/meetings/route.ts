import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

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

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all meetings between supervisors and students
    const meetings = await getMany(`
      SELECT 
        m.*,
        su.first_name as supervisor_first_name,
        su.last_name as supervisor_last_name,
        su.email as supervisor_email,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        st.registration_number as student_registration_number
      FROM meetings m
      JOIN supervisors sup ON m.supervisor_id = sup.id
      JOIN users su ON sup.user_id = su.id
      JOIN students st ON m.student_id = st.id
      JOIN users u ON st.user_id = u.id
      ORDER BY m.meeting_date ASC, m.meeting_time ASC
    `);

    return NextResponse.json({
      meetings: meetings
    });

  } catch (error) {
    console.error('Get admin meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
