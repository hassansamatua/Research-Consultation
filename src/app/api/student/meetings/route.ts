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

    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get student's meetings
    const meetings = await getMany(`
      SELECT 
        m.*,
        m.requested_by,
        m.approval_status,
        m.rejection_reason,
        m.request_date,
        s.first_name as supervisor_first_name,
        s.last_name as supervisor_last_name,
        s.email as supervisor_email,
        st.first_name as student_first_name,
        st.last_name as student_last_name,
        st.email as student_email
      FROM meetings m
      JOIN supervisors sup ON m.supervisor_id = sup.id
      JOIN users s ON sup.user_id = s.id
      JOIN students st ON m.student_id = st.id
      JOIN users u ON st.user_id = u.id
      WHERE m.student_id = (SELECT id FROM students WHERE user_id = ?)
      ORDER BY m.meeting_date ASC, m.meeting_time ASC
    `, [user.id]);

    return NextResponse.json({
      meetings: meetings
    });

  } catch (error) {
    console.error('Get student meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
