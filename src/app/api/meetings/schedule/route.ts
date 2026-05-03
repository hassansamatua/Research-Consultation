import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { insert } from '@/lib/db';

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

    const body = await request.json();
    const { student_id, title, description, meeting_date, meeting_time, location } = body;

    // Validate required fields
    if (!student_id || !title || !meeting_date || !meeting_time || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, title, description, meeting_date, meeting_time, location' },
        { status: 400 }
      );
    }

    // Create meeting
    const meetingData = {
      supervisor_id: user.id,
      student_id: parseInt(student_id),
      title: title.trim(),
      description: description?.trim() || '',
      meeting_date: meeting_date,
      meeting_time: meeting_time,
      location: location.trim(),
      status: 'scheduled',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const meetingId = await insert('meetings', meetingData);

    return NextResponse.json({
      success: true,
      message: 'Meeting scheduled successfully',
      meeting_id: meetingId
    });

  } catch (error) {
    console.error('Schedule meeting error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
