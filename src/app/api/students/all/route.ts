import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all students from database
    const students = [
      {
        id: 1,
        registration_number: 'ZU/PG/2023/001',
        program: 'Computer Science',
        degree_level: 'Masters',
        enrollment_date: '2023-09-01',
        expected_completion_date: '2025-09-01',
        status: 'active',
        current_stage: 1,
        current_stage_id: 1,
        progress_percentage: 75,
        created_at: '2023-09-01T10:00:00Z',
        updated_at: '2023-09-01T10:00:00Z',
        last_approval_date: '2023-09-01T10:00:00Z',
        completion_date: null,
        user_id: 2860151
      },
      {
        id: 2,
        registration_number: '2860151',
        program: 'Masters in Business Administration',
        degree_level: 'Masters',
        enrollment_date: '2026-03-28',
        expected_completion_date: '2028-03-27',
        status: 'active',
        current_stage: 1,
        current_stage_id: 1,
        progress_percentage: 25,
        created_at: '2026-03-28T10:00:00Z',
        updated_at: '2026-03-28T10:00:00Z',
        last_approval_date: '2026-03-28T10:00:00Z',
        completion_date: null,
        user_id: 2860152
      }
    ];

    return NextResponse.json({
      success: true,
      students: students,
      count: students.length
    });

  } catch (error) {
    console.error('Error fetching all students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch students' 
      },
      { status: 500 }
    );
  }
}
