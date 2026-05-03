import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { update } from '@/lib/db';

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

    // Mark all messages for this user as read
    await update('messages', 
      { 
        is_read: true,
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        receiver_id: user.id,
        is_read: false
      }
    );

    return NextResponse.json({
      message: 'All messages marked as read'
    });

  } catch (error) {
    console.error('Mark all messages as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all messages as read', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
