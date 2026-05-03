import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if users exist
    const users = await getMany(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      ORDER BY u.id
    `);

    // Check specific admin user
    const adminUser = await getMany(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.password, u.is_active, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = 'admin@zu.ac.tz'
    `);

    return NextResponse.json({
      totalUsers: users.length,
      users: users,
      adminUser: adminUser,
      message: 'Debug information for user authentication'
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
