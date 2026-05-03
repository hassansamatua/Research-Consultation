import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { update } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Mark message as read
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

    return NextResponse.json({
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
