import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { insert, getOne, getMany } from '@/lib/db';

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
    const { receiver_id, subject, message_text, reply_to_id } = body;

    // Validate required fields
    if (!receiver_id || !subject || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields: receiver_id, subject, message_text' },
        { status: 400 }
      );
    }

    // Validate that receiver exists
    const receiver = await getOne(
      'SELECT id, is_active FROM users WHERE id = ?',
      [receiver_id]
    );

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    if (!receiver.is_active) {
      return NextResponse.json(
        { error: 'Receiver is not active' },
        { status: 400 }
      );
    }

    // Create message
    const messageData = {
      sender_id: user.id,
      receiver_id,
      subject,
      message_text,
      reply_to_id: reply_to_id || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const messageId = await insert('messages', messageData);

    return NextResponse.json({
      message: 'Message sent successfully',
      message_id: messageId
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get messages for the current user (both sent and received)
    const messages = await getMany(`
      SELECT 
        m.*,
        s.first_name as sender_first_name,
        s.last_name as sender_last_name,
        s.email as sender_email,
        r.first_name as receiver_first_name,
        r.last_name as receiver_last_name,
        r.email as receiver_email
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? OR m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, user.id, limit, offset]);

    // Get total count for pagination
    const totalCount = await getOne(`
      SELECT COUNT(*) as total
      FROM messages 
      WHERE (sender_id = ? OR receiver_id = ?)
    `, [user.id, user.id]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount.total,
        totalPages: Math.ceil(totalCount.total / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
