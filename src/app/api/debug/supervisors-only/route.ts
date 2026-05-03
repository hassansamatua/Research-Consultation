import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check supervisors table
    const supervisors = await getMany(`
      SELECT sup.*, u.email, u.first_name, u.last_name
      FROM supervisors sup
      JOIN users u ON sup.user_id = u.id
      ORDER BY sup.id
    `);

    // Check students table  
    const students = await getMany(`
      SELECT s.*, u.email, u.first_name, u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);

    // Check users table for potential supervisors
    const users = await getMany(`
      SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.is_active = 1
      ORDER BY r.name, u.first_name
    `);

    return NextResponse.json({
      supervisors: supervisors,
      students: students,
      users: users,
      message: 'Supervisor and student records check'
    });

  } catch (error) {
    console.error('Debug supervisors error:', error);
    return NextResponse.json(
      { error: 'Failed to debug supervisors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
