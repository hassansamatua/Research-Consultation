import { NextRequest, NextResponse } from 'next/server';
import { getOne, insert, update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get student and supervisor IDs
    const student = await getOne('SELECT id FROM users WHERE email = "student1@zumis.ac.tz"');
    const supervisor = await getOne('SELECT id FROM users WHERE email = "dr.mohamed@zu.ac.tz"');

    if (!student || !supervisor) {
      return NextResponse.json(
        { error: 'Student or supervisor not found' },
        { status: 404 }
      );
    }

    // Get the actual student and supervisor records
    const studentRecord = await getOne('SELECT id FROM students WHERE user_id = ?', [student.id]);
    const supervisorRecord = await getOne('SELECT id FROM supervisors WHERE user_id = ?', [supervisor.id]);

    if (!studentRecord || !supervisorRecord) {
      return NextResponse.json(
        { error: 'Student or supervisor record not found in respective tables' },
        { status: 404 }
      );
    }

    // Create a test allocation
    const allocationData = {
      student_id: studentRecord.id,
      supervisor_id: supervisorRecord.id,
      status: 'active'
    };

    const allocationId = await insert('supervisor_allocations', allocationData);

    // Update supervisor's student count
    await update(
      'supervisors',
      { current_students: 1 },
      { id: supervisorRecord.id }
    );

    return NextResponse.json({
      message: 'Test allocation created successfully',
      allocation: {
        id: allocationId,
        student_id: studentRecord.id,
        supervisor_id: supervisorRecord.id,
        student_email: student.email,
        supervisor_email: supervisor.email,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Create test allocation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test allocation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
