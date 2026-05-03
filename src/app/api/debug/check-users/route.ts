import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all users with their roles
    const users = await getMany(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY r.name, u.first_name
    `);

    // Get students table
    const students = await getMany(`
      SELECT s.*, u.email, u.first_name, u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY u.first_name
    `);

    // Get supervisors table
    const supervisors = await getMany(`
      SELECT sup.*, u.email, u.first_name, u.last_name
      FROM supervisors sup
      JOIN users u ON sup.user_id = u.id
      ORDER BY u.first_name
    `);

    // Get existing allocations
    const allocations = await getMany(`
      SELECT sa.*, 
             stu.email as student_email, stu.first_name as student_first_name, stu.last_name as student_last_name,
             sup.email as supervisor_email, sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name
      FROM supervisor_allocations sa
      JOIN students st ON sa.student_id = st.id
      JOIN users stu ON st.user_id = stu.id
      JOIN supervisors su ON sa.supervisor_id = su.id
      JOIN users sup ON su.user_id = sup.id
      ORDER BY sa.created_at DESC
    `);

    return NextResponse.json({
      users: users,
      students: students,
      supervisors: supervisors,
      allocations: allocations,
      message: 'User and allocation information'
    });

  } catch (error) {
    console.error('Check users error:', error);
    return NextResponse.json(
      { error: 'Failed to check users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
