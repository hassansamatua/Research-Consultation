import { NextRequest, NextResponse } from 'next/server';
import { getOne, insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating simple supervisor allocation...');
    
    // Find student1
    const studentUser = await getOne('SELECT id FROM users WHERE email = "student1@zumis.ac.tz"');
    if (!studentUser) {
      return NextResponse.json({ error: 'Student user not found' }, { status: 404 });
    }
    
    // Find student record
    const student = await getOne('SELECT id FROM students WHERE user_id = ?', [studentUser.id]);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }
    
    // Find any supervisor
    const supervisorUser = await getOne('SELECT id FROM users WHERE email LIKE "%mohamed%" LIMIT 1');
    if (!supervisorUser) {
      return NextResponse.json({ error: 'Supervisor user not found' }, { status: 404 });
    }
    
    // Find supervisor record
    const supervisor = await getOne('SELECT id FROM supervisors WHERE user_id = ?', [supervisorUser.id]);
    if (!supervisor) {
      return NextResponse.json({ error: 'Supervisor record not found' }, { status: 404 });
    }
    
    console.log('Found student:', student.id, 'and supervisor:', supervisor.id);
    
    // Create allocation
    const allocationData = {
      student_id: student.id,
      supervisor_id: supervisor.id,
      status: 'active'
    };
    
    const allocationId = await insert('supervisor_allocations', allocationData);
    
    console.log('Created allocation with ID:', allocationId);
    
    return NextResponse.json({
      success: true,
      message: 'Supervisor allocation created successfully',
      allocationId: allocationId,
      studentId: student.id,
      supervisorId: supervisor.id,
      studentEmail: studentUser.email,
      supervisorEmail: supervisorUser.email
    });

  } catch (error) {
    console.error('Create allocation error:', error);
    return NextResponse.json(
      { error: 'Failed to create allocation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
