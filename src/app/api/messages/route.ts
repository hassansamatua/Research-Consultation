import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany, insert } from '@/lib/db';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Get messages for the current user
    let whereClause = 'WHERE (m.receiver_id = ? OR m.sender_id = ?)';
    let queryParams = [user.id, user.id];

    if (unreadOnly) {
      whereClause += ' AND m.is_read = 0 AND m.receiver_id = ?';
      queryParams.push(user.id);
    }

    const messages = await getMany(`
      SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender_role.name as sender_role,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name,
        receiver_role.name as receiver_role
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN roles sender_role ON sender.role_id = sender_role.id
      JOIN users receiver ON m.receiver_id = receiver.id
      JOIN roles receiver_role ON receiver.role_id = receiver_role.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get total count for pagination
    const totalCountResult = await getMany(`
      SELECT COUNT(*) as total
      FROM messages m
      WHERE m.receiver_id = ? OR m.sender_id = ?
    `, [user.id, user.id]);

    // Get unread count
    const unreadCountResult = await getMany(`
      SELECT COUNT(*) as unread_count
      FROM messages m
      WHERE m.receiver_id = ? AND m.is_read = 0
    `, [user.id]);

    const totalCount = totalCountResult[0].total;
    const unreadCount = unreadCountResult[0].unread_count;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      messages: messages,
      unreadCount: unreadCount,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_records: totalCount,
        records_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
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
    const { receiver_email, subject, message_text } = body;

    // Validate required fields
    if (!receiver_email || !subject || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields: receiver_email, subject, message_text' },
        { status: 400 }
      );
    }

    // Get receiver user ID
    const receiver = await getMany(`
      SELECT u.id, u.first_name, u.last_name, u.role_name
      FROM users u
      WHERE u.email = ?
    `, [receiver_email]);

    if (receiver.length === 0) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    const receiverUser = receiver[0];

    // Create message
    const messageData = {
      sender_id: user.id,
      receiver_id: receiverUser.id,
      subject: subject.trim(),
      message_text: message_text.trim(),
      is_read: false,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const messageId = await insert('messages', messageData);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      message_id: messageId
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { message_id, is_read } = body;

    // Validate required fields
    if (!message_id) {
      return NextResponse.json(
        { error: 'Missing required field: message_id' },
        { status: 400 }
      );
    }

    // Check if user owns this message (either as sender or receiver)
    const message = await getMany(`
      SELECT m.* FROM messages m
      WHERE m.id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
    `, [message_id, user.id, user.id]);

    if (message.length === 0) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      );
    }

    // Update message read status
    await getMany(`
      UPDATE messages 
      SET is_read = ?, updated_at = ?
      WHERE id = ?
    `, [is_read !== undefined ? is_read : false, new Date().toISOString().slice(0, 19).replace('T', ' '), message_id]);

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json(
      { error: 'Failed to update message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
