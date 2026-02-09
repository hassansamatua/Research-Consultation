import { NextRequest, NextResponse } from 'next/server';
import { getOne, insert } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { authenticateRequest, requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      role_id, 
      password, 
      registration_number,
      program,
      department,
      specialization,
      max_students
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !role_id || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, last_name, email, role_id, password' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists. Please use a different email address.' },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = await getOne('SELECT id, name FROM roles WHERE id = ?', [role_id]);
    if (!validRoles) {
      return NextResponse.json(
        { error: 'Invalid role_id' },
        { status: 400 }
      );
    }

    // Additional validation for students
    if (validRoles.name === 'student' && !registration_number) {
      return NextResponse.json(
        { error: 'Registration number is required for students' },
        { status: 400 }
      );
    }

    // Additional validation for supervisors
    if (validRoles.name === 'supervisor' && (!specialization || !department)) {
      return NextResponse.json(
        { error: 'Specialization and department are required for supervisors' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user data object (only include fields that exist in users table)
    const userData: any = {
      first_name,
      last_name,
      email,
      phone: phone || null,
      role_id,
      password: hashedPassword,
      is_active: true,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Insert user into database
    const userId = await insert('users', userData);

    // If student, also create student record
    if (validRoles.name === 'student') {
      await insert('students', {
        user_id: userId,
        registration_number: registration_number,
        program: program || '',
        enrollment_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        expected_completion: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        status: 'active',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    }

    // If supervisor, also create supervisor record
    if (validRoles.name === 'supervisor') {
      try {
        await insert('supervisors', {
          user_id: userId,
          department: department,
          specialization: specialization,
          max_students: max_students || 10,
          current_students: 0,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
      } catch (error) {
        console.log('Supervisors table not found, skipping supervisor record creation');
      }
    }

    // Return success response without password
    const { password: _, ...userWithoutPassword } = userData;
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        first_name,
        last_name,
        email,
        role: validRoles.name,
        is_active: true,
        created_at: userData.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
