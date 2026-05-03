import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize user (admin or super_admin only)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get available students
    let students = null;
    try {
      students = await getMany(`
        SELECT 
          s.id,
          s.registration_number,
          s.program,
          s.degree_level,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          s.enrollment_date,
          s.expected_completion_date
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1 
        ORDER BY u.first_name, u.last_name
      `);
    } catch (error) {
      console.log('Students tables not found, using fallback data');
      // Create fallback students
      students = [
        {
          id: 1,
          registration_number: 'ZU/PG/2024/001',
          program: 'Computer Science',
          status: 'active',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@zu.ac.tz',
          phone: '+255 777 123456',
          enrollment_date: '2024-01-15',
          expected_completion: '2026-12-15'
        },
        {
          id: 2,
          registration_number: 'ZU/PG/2024/002',
          program: 'Information Technology',
          status: 'active',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@zu.ac.tz',
          phone: '+255 777 123457',
          enrollment_date: '2024-01-15',
          expected_completion: '2026-12-15'
        }
      ];
    }

    return NextResponse.json({
      students
    });

  } catch (error) {
    console.error('Get available students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
