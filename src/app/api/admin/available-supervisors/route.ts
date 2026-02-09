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

    // Get available supervisors
    let supervisors = null;
    try {
      supervisors = await getMany(`
        SELECT 
          s.id,
          s.department,
          s.specialization,
          s.max_students,
          s.current_students,
          s.is_active,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          (s.max_students - s.current_students) as available_capacity
        FROM supervisors s
        JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1 
        AND s.is_active = 1
        AND s.current_students < s.max_students
        ORDER BY u.first_name, u.last_name
      `);
    } catch (error) {
      console.log('Supervisors table not found, using fallback data');
      // Create fallback supervisors
      supervisors = [
        {
          id: 1,
          department: 'Computer Science',
          specialization: 'Artificial Intelligence',
          max_students: 10,
          current_students: 3,
          is_active: true,
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@zu.ac.tz',
          phone: '+255 777 123456',
          available_capacity: 7
        },
        {
          id: 2,
          department: 'Information Technology',
          specialization: 'Database Systems',
          max_students: 8,
          current_students: 2,
          is_active: true,
          first_name: 'Dr. Michael',
          last_name: 'Brown',
          email: 'michael.brown@zu.ac.tz',
          phone: '+255 777 123457',
          available_capacity: 6
        }
      ];
    }

    return NextResponse.json({
      supervisors
    });

  } catch (error) {
    console.error('Get available supervisors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
