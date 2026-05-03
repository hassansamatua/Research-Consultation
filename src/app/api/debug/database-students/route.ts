import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check users table first
    const users = await getMany(`
      SELECT id, email, first_name, last_name, role_id, is_active
      FROM users 
      WHERE is_active = 1
      ORDER BY id
    `);

    // Check students table
    const students = await getMany(`
      SELECT s.*, u.email, u.first_name, u.last_name, u.role_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);

    // Check roles
    const roles = await getMany('SELECT * FROM roles ORDER BY id');

    return NextResponse.json({
      users: users,
      students: students,
      roles: roles,
      message: 'Database student information'
    });

  } catch (error) {
    console.error('Debug database students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
