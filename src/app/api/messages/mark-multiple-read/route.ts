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

    const { messageIds } = await request.json();
    
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid message IDs' },
        { status: 400 }
      );
    }

    // Validate message IDs
    const validMessageIds = messageIds.filter(id => 
      typeof id === 'number' && id > 0
    );

    if (validMessageIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid message IDs provided' },
        { status: 400 }
      );
    }

    // Mark messages as read (only messages belonging to the user)
    for (const messageId of validMessageIds) {
      await update('messages', 
        { 
          is_read: true,
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        {
          id: messageId,
          receiver_id: user.id
        }
      );
    }

    return NextResponse.json({
      message: 'Messages marked as read',
      count: validMessageIds.length
    });

  } catch (error) {
    console.error('Mark multiple messages as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
