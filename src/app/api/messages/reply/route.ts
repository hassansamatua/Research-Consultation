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

    const { original_message_id, reply_text, receiver_id } = await request.json();
    
    if (!original_message_id || !reply_text || !receiver_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create reply message
    const replyData = {
      sender_id: user.id,
      receiver_id: receiver_id,
      subject: 'Re: Reply to your message',
      message_text: reply_text,
      is_read: false,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      original_message_id: original_message_id
    };

    const result = await insert('messages', replyData);

    return NextResponse.json({
      message: 'Reply sent successfully',
      reply: result
    });

  } catch (error) {
    console.error('Reply to message error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
