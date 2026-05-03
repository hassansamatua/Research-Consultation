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

    // Check if user is admin or super_admin
    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.is_active = 1';
    let params: any[] = [];

    if (role) {
      whereClause += ' AND r.name = ?';
      params.push(role);
    }

    // Get users with their roles
    const users = await getMany(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at,
        r.name as role_name,
        CASE 
          WHEN r.name = 'student' THEN s.registration_number
          WHEN r.name = 'supervisor' THEN sup.staff_id
          ELSE NULL
        END as identifier
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN supervisors sup ON u.id = sup.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Get total count for pagination
    const totalCount = await getMany(`
      SELECT COUNT(*) as total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
    `, params);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount[0].total,
        totalPages: Math.ceil(totalCount[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
