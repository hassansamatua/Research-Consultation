import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany, getOne } from '@/lib/db';

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

    // Check if user is admin or super_admin
    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const studentId = searchParams.get('student_id');
    const supervisorId = searchParams.get('supervisor_id');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params: any[] = [];

    if (studentId) {
      whereClause += ' AND (m.sender_id = ? OR m.receiver_id = ?)';
      params.push(studentId, studentId);
    }

    if (supervisorId) {
      whereClause += ' AND (m.sender_id = ? OR m.receiver_id = ?)';
      params.push(supervisorId, supervisorId);
    }

    // Get all communications between students and supervisors
    const communications = await getMany(`
      SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender.email as sender_email,
        sender_role.name as sender_role,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name,
        receiver.email as receiver_email,
        receiver_role.name as receiver_role,
        CASE 
          WHEN sender_role.name IN ('student', 'supervisor') AND receiver_role.name IN ('student', 'supervisor') 
          THEN 'student_supervisor'
          ELSE 'other'
        END as communication_type
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      JOIN roles sender_role ON sender.role_id = sender_role.id
      JOIN roles receiver_role ON receiver.role_id = receiver_role.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Get total count for pagination
    const totalCount = await getOne(`
      SELECT COUNT(*) as total
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      JOIN roles sender_role ON sender.role_id = sender_role.id
      JOIN roles receiver_role ON receiver.role_id = receiver_role.id
      ${whereClause}
    `, params);

    // Filter for student-supervisor communications in the application layer
    const studentSupervisorCommunications = communications.filter(
      comm => comm.communication_type === 'student_supervisor'
    );

    return NextResponse.json({
      communications: studentSupervisorCommunications,
      pagination: {
        page,
        limit,
        total: totalCount.total,
        totalPages: Math.ceil(totalCount.total / limit)
      }
    });

  } catch (error) {
    console.error('Get communications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
