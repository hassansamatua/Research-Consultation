import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    console.log('Authenticated user for admin allocations:', user);
    
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      console.log('User is not admin, role:', user.role_name);
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Validate limit
    const allowedLimits = [10, 25, 50, 100];
    const validLimit = allowedLimits.includes(limit) ? limit : 10;

    // Get total count for pagination
    const countResult = await getMany(`
      SELECT COUNT(*) as total
      FROM supervisor_allocations sa
      JOIN students st ON sa.student_id = st.id
      JOIN supervisors s ON sa.supervisor_id = s.id
      WHERE sa.status = 'active'
    `);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / validLimit);

    console.log('Admin allocations query results:', { total, totalPages, limit: validLimit, offset });

    // Get paginated allocations (all allocations for admin)
    const allocations = await getMany(`
      SELECT 
        sa.*,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        u.phone as student_phone,
        st.registration_number,
        st.program,
        st.enrollment_date,
        st.expected_completion_date,
        st.user_id as student_user_id,
        sup_u.first_name as supervisor_first_name,
        sup_u.last_name as supervisor_last_name,
        sup_u.email as supervisor_email
      FROM supervisor_allocations sa
      JOIN students st ON sa.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN supervisors s ON sa.supervisor_id = s.id
      JOIN users sup_u ON s.user_id = sup_u.id
      WHERE sa.status = 'active'
      ORDER BY sa.allocated_at DESC
      LIMIT ? OFFSET ?
    `, [validLimit, offset]);

    return NextResponse.json({
      allocations: allocations,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_records: total,
        records_per_page: validLimit,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin allocations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
