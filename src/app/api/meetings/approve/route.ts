import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { update, getOne } from '@/lib/db';

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

    // Only supervisors can approve/reject meetings
    if (user.role_name !== 'supervisor') {
      return NextResponse.json(
        { error: 'Only supervisors can approve or reject meetings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      meeting_id,
      action, // 'approve' or 'reject'
      rejection_reason
    } = body;

    // Validate required fields
    if (!meeting_id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing required fields: meeting_id, action (approve/reject)' },
        { status: 400 }
      );
    }

    // Verify meeting belongs to this supervisor
    const meeting = await getOne(`
      SELECT m.*, s.user_id as supervisor_user_id
      FROM meetings m
      JOIN supervisors s ON m.supervisor_id = s.id
      WHERE m.id = ? AND s.user_id = ? AND m.requested_by = 'student' AND m.approval_status = 'pending'
    `, [meeting_id, user.id]);

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found or not pending approval' },
        { status: 404 }
      );
    }

    console.log('📋 Supervisor processing meeting request:', {
      supervisor_id: user.id,
      meeting_id,
      action,
      rejection_reason
    });

    // Update meeting approval status
    const updateData: any = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason || 'Meeting request rejected';
      updateData.status = 'cancelled';
    }

    const result = await update('meetings', updateData, { id: meeting_id });

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Failed to update meeting' },
        { status: 500 }
      );
    }

    console.log(`✅ Meeting ${action}d successfully:`, meeting_id);

    return NextResponse.json({
      success: true,
      message: `Meeting ${action}d successfully`,
      meeting: {
        id: meeting_id,
        action,
        rejection_reason: action === 'reject' ? rejection_reason : null
      }
    });

  } catch (error) {
    console.error('❌ Meeting approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process meeting approval', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
