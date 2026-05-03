import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { insert, getOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only students can request meetings
    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Only students can request meetings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      title,
      description,
      meeting_date,
      meeting_time,
      location,
      supervisor_id
    } = body;

    // Validate required fields
    if (!title || !meeting_date || !meeting_time || !supervisor_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, meeting_date, meeting_time, supervisor_id' },
        { status: 400 }
      );
    }

    // Verify supervisor exists and is assigned to this student
    const supervisor = await getOne(`
      SELECT s.id, s.user_id, u.first_name, u.last_name
      FROM supervisors s
      JOIN users u ON s.user_id = u.id
      JOIN supervisor_allocations sa ON s.id = sa.supervisor_id
      JOIN students st ON sa.student_id = st.id
      WHERE s.id = ? AND st.user_id = ? AND sa.status = 'active'
    `, [supervisor_id, user.id]);

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Invalid supervisor or supervisor not assigned to you' },
        { status: 400 }
      );
    }

    console.log('📝 Student requesting meeting:', {
      student_id: user.id,
      supervisor_id,
      title,
      meeting_date,
      meeting_time
    });

    // Create meeting request
    const meetingData = {
      supervisor_id,
      student_id: user.id, // Will need to get student_id from users table
      title,
      description: description || '',
      meeting_date,
      meeting_time,
      location: location || 'TBD',
      status: 'scheduled',
      requested_by: 'student',
      approval_status: 'pending',
      request_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Get student_id from users table
    const student = await getOne('SELECT id FROM students WHERE user_id = ?', [user.id]);
    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 400 }
      );
    }

    meetingData.student_id = student.id;

    const { insert: insertMeeting } = await import('@/lib/db');
    const meetingId = await insertMeeting('meetings', meetingData);

    console.log('✅ Meeting request created:', meetingId);

    return NextResponse.json({
      success: true,
      message: 'Meeting request submitted successfully. Waiting for supervisor approval.',
      meeting: {
        id: meetingId,
        ...meetingData,
        supervisor_name: `${supervisor.first_name} ${supervisor.last_name}`
      }
    });

  } catch (error) {
    console.error('❌ Meeting request error:', error);
    return NextResponse.json(
      { error: 'Failed to request meeting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
