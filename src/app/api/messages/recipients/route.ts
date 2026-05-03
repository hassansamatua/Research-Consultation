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

    // Only supervisors can access their eligible recipients
    if (user.role_name !== 'supervisor') {
      return NextResponse.json(
        { error: 'Access denied. Only supervisors can access eligible recipients.' },
        { status: 403 }
      );
    }

    console.log('👨‍🏫 Supervisor fetching eligible recipients:', user.id);

    // Get admins
    const admins = await getMany(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('admin', 'super_admin')
      AND u.is_active = true
      ORDER BY u.first_name, u.last_name
    `);

    // Get assigned students
    const students = await getMany(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        r.name as role_name,
        st.registration_number,
        st.program
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN students st ON u.id = st.user_id
      JOIN supervisor_allocations sa ON st.id = sa.student_id
      JOIN supervisors s ON sa.supervisor_id = s.id
      WHERE s.user_id = ? 
      AND sa.status = 'active'
      AND u.is_active = true
      ORDER BY u.first_name, u.last_name
    `, [user.id]);

    console.log(`📋 Found ${admins.length} admins and ${students.length} assigned students`);

    return NextResponse.json({
      success: true,
      recipients: {
        admins: admins,
        students: students
      },
      totalRecipients: admins.length + students.length
    });

  } catch (error) {
    console.error('❌ Fetch recipients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipients', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
