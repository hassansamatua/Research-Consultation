import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { update, getOne } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const meetingId = parseInt(id);
    if (isNaN(meetingId)) {
      return NextResponse.json(
        { error: 'Invalid meeting ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: scheduled, completed, or cancelled' },
        { status: 400 }
      );
    }

    // Update meeting status
    await update('meetings', 
      { 
        status,
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        id: meetingId,
        supervisor_id: (await getOne('SELECT id FROM supervisors WHERE user_id = ?', [user.id]))?.id
      }
    );

    return NextResponse.json({
      message: 'Meeting status updated successfully'
    });

  } catch (error) {
    console.error('Update meeting status error:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
