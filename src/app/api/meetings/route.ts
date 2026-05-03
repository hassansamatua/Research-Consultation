import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany, insert, update, getOne } from '@/lib/db';

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

    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('supervisor_id');

    let meetings = null;
    try {
      if (user.role_name === 'supervisor') {
        // Get supervisor's meetings
        meetings = await getMany(`
          SELECT 
            m.*,
            m.requested_by,
            m.approval_status,
            m.rejection_reason,
            m.request_date,
            s.first_name as student_name,
            s.email as student_email
          FROM meetings m
          JOIN students st ON m.student_id = st.id
          JOIN users s ON st.user_id = s.id
          WHERE m.supervisor_id = (SELECT id FROM supervisors WHERE user_id = ?)
          ORDER BY m.meeting_date ASC, m.meeting_time ASC
        `, [user.id]);
      } else {
        // Get all meetings for admin
        meetings = await getMany(`
          SELECT 
            m.*,
            m.requested_by,
            m.approval_status,
            m.rejection_reason,
            m.request_date,
            s.first_name as student_name,
            s.email as student_email,
            sup.first_name as supervisor_name,
            sup.email as supervisor_email
          FROM meetings m
          JOIN students st ON m.student_id = st.id
          JOIN users s ON st.user_id = s.id
          JOIN supervisors sp ON m.supervisor_id = sp.id
          JOIN users sup ON sp.user_id = sup.id
          ORDER BY m.meeting_date ASC, m.meeting_time ASC
        `);
      }
    } catch (error) {
      console.log('No meetings found');
      meetings = [];
    }

    return NextResponse.json({
      meetings: meetings || []
    });

  } catch (error) {
    console.error('Get meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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

    if (!['supervisor', 'admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { student_id, supervisor_id, title, description, meeting_date, meeting_time, location, status } = body;

    // Validate required fields
    if (!student_id || !title || !meeting_date || !meeting_time) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, title, meeting_date, meeting_time' },
        { status: 400 }
      );
    }

    let supervisorRecord;
    
    if (user.role_name === 'supervisor') {
      // Get supervisor ID from current user
      supervisorRecord = await getOne(
        'SELECT id FROM supervisors WHERE user_id = ?',
        [user.id]
      );
    } else {
      // Admin can specify supervisor_id
      if (!supervisor_id) {
        return NextResponse.json(
          { error: 'Missing required field: supervisor_id (required for admin scheduling)' },
          { status: 400 }
        );
      }
      supervisorRecord = await getOne(
        'SELECT id FROM supervisors WHERE id = ?',
        [supervisor_id]
      );
    }

    if (!supervisorRecord) {
      return NextResponse.json(
        { error: 'Supervisor record not found' },
        { status: 404 }
      );
    }

    // Create meeting
    const meetingData = {
      supervisor_id: supervisorRecord.id,
      student_id,
      title,
      description,
      meeting_date,
      meeting_time,
      location: location || 'TBD',
      status: status || 'scheduled',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const meetingId = await insert('meetings', meetingData);

    return NextResponse.json({
      message: 'Meeting scheduled successfully',
      meeting_id: meetingId
    }, { status: 201 });

  } catch (error) {
    console.error('Create meeting error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
