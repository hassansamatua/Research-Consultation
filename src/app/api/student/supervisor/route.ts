import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getOne } from '@/lib/db';

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

    // Only students can access their supervisor info
    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Only students can access supervisor information.' },
        { status: 403 }
      );
    }

    console.log('👨‍🎓 Student fetching supervisor info:', user.id);

    // Get student's supervisor allocation
    const allocation = await getOne(`
      SELECT 
        s.id as supervisor_id,
        s.user_id as supervisor_user_id,
        s.department,
        s.specialization,
        s.staff_id,
        u.first_name,
        u.last_name,
        u.email
      FROM supervisor_allocations sa
      JOIN supervisors s ON sa.supervisor_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN students st ON sa.student_id = st.id
      WHERE st.user_id = ? AND sa.status = 'active'
    `, [user.id]);

    if (!allocation) {
      return NextResponse.json(
        { error: 'No supervisor assigned' },
        { status: 404 }
      );
    }

    console.log('👨‍🏫 Found supervisor for student:', allocation.first_name, allocation.last_name);

    return NextResponse.json({
      success: true,
      supervisor: allocation
    });

  } catch (error) {
    console.error('❌ Student supervisor API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisor information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
