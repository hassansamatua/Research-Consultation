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

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all messages between supervisors and students
    const messages = await getMany(`
      SELECT 
        m.*,
        u1.first_name as sender_first_name,
        u1.last_name as sender_last_name,
        u1.email as sender_email,
        r1.name as sender_role,
        u2.first_name as receiver_first_name,
        u2.last_name as receiver_last_name,
        u2.email as receiver_email,
        r2.name as receiver_role
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN roles r1 ON u1.role_id = r1.id
      JOIN users u2 ON m.receiver_id = u2.id
      JOIN roles r2 ON u2.role_id = r2.id
      WHERE (r1.name = 'supervisor' AND r2.name = 'student') 
         OR (r1.name = 'student' AND r2.name = 'supervisor')
      ORDER BY m.created_at DESC
    `);

    return NextResponse.json({
      messages: messages
    });

  } catch (error) {
    console.error('Get admin messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
