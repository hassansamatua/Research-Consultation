import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'registration_number', 'program'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Create new student with auto-generated ID
    const newStudent = {
      id: Date.now(), // Simple ID generation
      ...body,
      status: body.status || 'active',
      created_at: new Date().toISOString()
    };

    // In a real application, this would save to database
    // For now, we'll just return the created student
    console.log('New student created:', newStudent);

    return NextResponse.json({
      success: true,
      student: newStudent,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create student' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all students for admin
    const students = [
      {
        id: 1,
        registration_number: 'ZU/PG/2023/001',
        first_name: 'Ali',
        last_name: 'Hassan',
        email: 'student1@zumis.ac.tz',
        phone: '+255 777 123460',
        program: 'Computer Science',
        enrollment_date: '2023-09-01',
        expected_completion_date: '2025-09-01',
        status: 'active',
        user_id: 2860151,
        created_at: '2023-09-01T10:00:00Z'
      },
      {
        id: 2,
        registration_number: '2860151',
        first_name: 'Samatua',
        last_name: 'Hassan',
        email: 'student20@gmail.com',
        phone: 'N/A',
        program: 'Masters in Business Administration',
        enrollment_date: '2026-03-28',
        expected_completion_date: '2028-03-27',
        status: 'active',
        user_id: 2860152,
        created_at: '2026-03-28T10:00:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      students: students,
      count: students.length
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch students' 
      },
      { status: 500 }
    );
  }
}
