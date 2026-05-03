import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

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

    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get student's messages
    const messages = await getMany(`
      SELECT 
        m.*,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.email as sender_email,
        u2.first_name as receiver_first_name,
        u2.last_name as receiver_last_name,
        u2.email as receiver_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.receiver_id = ? AND (m.sender_id IN (
        SELECT supervisor_id FROM supervisors WHERE user_id = ? OR
        m.receiver_id IN (SELECT supervisor_id FROM supervisors WHERE user_id = ?)
      ))
      ORDER BY m.created_at DESC
    `, [user.id, user.id]);

    return NextResponse.json({
      messages: messages
    });

  } catch (error) {
    console.error('Get student messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
