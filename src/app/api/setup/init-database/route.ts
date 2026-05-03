import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getOne, getMany } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check if users already exist
    const existingUsers = await getOne('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers && existingUsers.count > 0) {
      return NextResponse.json({
        message: 'Database already initialized',
        userCount: existingUsers.count
      });
    }

    // Hash the default password
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Insert roles
    await executeQuery(`
      INSERT INTO roles (name, description) VALUES
      ('student', 'Postgraduate Student'),
      ('supervisor', 'University Doctor/Research Supervisor'),
      ('admin', 'Director of Postgraduate Studies'),
      ('super_admin', 'System Owner/ICT Authority')
    `);

    // Insert users
    await executeQuery(`
      INSERT INTO users (email, password, first_name, last_name, phone, role_id, is_active) VALUES
      ('admin@zu.ac.tz', ?, 'Admin', 'User', '+255 777 123456', 3, 1),
      ('superadmin@zu.ac.tz', ?, 'Super', 'Admin', '+255 777 123457', 4, 1),
      ('dr.mohamed@zu.ac.tz', ?, 'Mohamed', 'Ali', '+255 777 123458', 2, 1),
      ('dr.fatma@zu.ac.tz', ?, 'Fatma', 'Hassan', '+255 777 123459', 2, 1),
      ('student1@zumis.ac.tz', ?, 'Ali', 'Hassan', '+255 777 123460', 1, 1)
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);

    // Verify users were created
    const users = await getMany(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      ORDER BY u.id
    `);

    return NextResponse.json({
      message: 'Database initialized successfully',
      userCount: users.length,
      users: users,
      defaultPassword: defaultPassword
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
