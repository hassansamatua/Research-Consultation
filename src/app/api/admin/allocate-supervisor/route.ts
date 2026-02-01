import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getOne, getMany, insert, update } from '@/lib/db';

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
    const { student_id, supervisor_id, allocation_date, notes } = body;

    // Validate required fields
    if (!student_id || !supervisor_id) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, supervisor_id' },
        { status: 400 }
      );
    }

    // Check if student exists and is active
    const student = await getOne(
      'SELECT s.*, u.first_name, u.last_name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND u.is_active = 1',
      [student_id]
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or inactive' },
        { status: 404 }
      );
    }

    // Check if supervisor exists and is active
    const supervisor = await getOne(
      'SELECT s.*, u.first_name, u.last_name FROM supervisors s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND u.is_active = 1 AND s.is_active = 1',
      [supervisor_id]
    );

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found or inactive' },
        { status: 404 }
      );
    }

    // Check if student already has a supervisor
    const existingAllocation = await getOne(
      'SELECT * FROM supervisor_allocations WHERE student_id = ? AND is_active = 1',
      [student_id]
    );

    if (existingAllocation) {
      return NextResponse.json(
        { error: 'Student already has an active supervisor allocation' },
        { status: 409 }
      );
    }

    // Check supervisor capacity
    const currentAllocations = await getOne(
      'SELECT COUNT(*) as count FROM supervisor_allocations WHERE supervisor_id = ? AND is_active = 1',
      [supervisor_id]
    );

    if (currentAllocations && currentAllocations.count >= supervisor.max_students) {
      return NextResponse.json(
        { error: 'Supervisor has reached maximum student capacity' },
        { status: 400 }
      );
    }

    // Create allocation
    const allocationData = {
      student_id,
      supervisor_id,
      allocation_date: allocation_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'active',
      notes: notes || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const allocationId = await insert('supervisor_allocations', allocationData);

    // Update supervisor's current student count
    await update(
      'supervisors',
      { current_students: (currentAllocations?.count || 0) + 1 },
      { id: supervisor_id }
    );

    // Update student's research project if exists
    await update(
      'research_projects',
      { supervisor_id },
      { student_id }
    );

    return NextResponse.json({
      message: 'Supervisor allocated successfully',
      allocation: {
        id: allocationId,
        student: `${student.first_name} ${student.last_name}`,
        supervisor: `${supervisor.first_name} ${supervisor.last_name}`,
        allocation_date: allocationData.allocation_date,
        status: allocationData.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Allocate supervisor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const supervisorId = searchParams.get('supervisor_id');

    if (studentId) {
      // Get allocations for a specific student
      const allocations = await getMany(`
        SELECT 
          sa.*,
          s.first_name as student_first_name,
          s.last_name as student_last_name,
          s.registration_number,
          sup.first_name as supervisor_first_name,
          sup.last_name as supervisor_last_name,
          sup.specialization,
          sup.department
        FROM supervisor_allocations sa
        JOIN students st ON sa.student_id = st.id
        JOIN users s ON st.user_id = s.id
        JOIN supervisors su ON sa.supervisor_id = su.id
        JOIN users sup ON su.user_id = sup.id
        WHERE sa.student_id = ?
        ORDER BY sa.created_at DESC
      `, [studentId]);

      return NextResponse.json({ allocations });
    } else if (supervisorId) {
      // Get allocations for a specific supervisor
      const allocations = await getMany(`
        SELECT 
          sa.*,
          s.first_name as student_first_name,
          s.last_name as student_last_name,
          s.registration_number,
          sup.first_name as supervisor_first_name,
          sup.last_name as supervisor_last_name,
          sup.specialization,
          sup.department
        FROM supervisor_allocations sa
        JOIN students st ON sa.student_id = st.id
        JOIN users s ON st.user_id = s.id
        JOIN supervisors su ON sa.supervisor_id = su.id
        JOIN users sup ON su.user_id = sup.id
        WHERE sa.supervisor_id = ?
        ORDER BY sa.created_at DESC
      `, [supervisorId]);

      return NextResponse.json({ allocations });
    } else {
      // Get all allocations
      const allocations = await getMany(`
        SELECT 
          sa.*,
          s.first_name as student_first_name,
          s.last_name as student_last_name,
          s.registration_number,
          sup.first_name as supervisor_first_name,
          sup.last_name as supervisor_last_name,
          sup.specialization,
          sup.department
        FROM supervisor_allocations sa
        JOIN students st ON sa.student_id = st.id
        JOIN users s ON st.user_id = s.id
        JOIN supervisors su ON sa.supervisor_id = su.id
        JOIN users sup ON su.user_id = sup.id
        ORDER BY sa.created_at DESC
      `);

      return NextResponse.json({ allocations });
    }

  } catch (error) {
    console.error('Get allocations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { allocation_id, action, new_supervisor_id, notes } = body;

    if (!allocation_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: allocation_id, action' },
        { status: 400 }
      );
    }

    // Get existing allocation
    const existingAllocation = await getOne(
      'SELECT * FROM supervisor_allocations WHERE id = ?',
      [allocation_id]
    );

    if (!existingAllocation) {
      return NextResponse.json(
        { error: 'Allocation not found' },
        { status: 404 }
      );
    }

    if (action === 'deallocate') {
      // Deallocate supervisor
      await update(
        'supervisor_allocations',
        { 
          status: 'inactive',
          end_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        { id: allocation_id }
      );

      // Update supervisor's current student count
      const currentAllocations = await getOne(
        'SELECT COUNT(*) as count FROM supervisor_allocations WHERE supervisor_id = ? AND is_active = 1',
        [existingAllocation.supervisor_id]
      );

      await update(
        'supervisors',
        { current_students: (currentAllocations?.count || 0) - 1 },
        { id: existingAllocation.supervisor_id }
      );

      // Clear supervisor from student's research project
      await update(
        'research_projects',
        { supervisor_id: null },
        { student_id: existingAllocation.student_id }
      );

      return NextResponse.json({
        message: 'Supervisor deallocated successfully'
      });

    } else if (action === 'reallocate' && new_supervisor_id) {
      // Reallocate to new supervisor
      const newSupervisor = await getOne(
        'SELECT * FROM supervisors WHERE id = ? AND is_active = 1',
        [new_supervisor_id]
      );

      if (!newSupervisor) {
        return NextResponse.json(
          { error: 'New supervisor not found or inactive' },
          { status: 404 }
        );
      }

      // Check new supervisor capacity
      const currentAllocations = await getOne(
        'SELECT COUNT(*) as count FROM supervisor_allocations WHERE supervisor_id = ? AND is_active = 1',
        [new_supervisor_id]
      );

      if (currentAllocations && currentAllocations.count >= newSupervisor.max_students) {
        return NextResponse.json(
          { error: 'New supervisor has reached maximum student capacity' },
          { status: 400 }
        );
      }

      // Update allocation
      await update(
        'supervisor_allocations',
        { 
          supervisor_id: new_supervisor_id,
          notes: notes || null,
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        { id: allocation_id }
      );

      // Update old supervisor's count
      const oldAllocations = await getOne(
        'SELECT COUNT(*) as count FROM supervisor_allocations WHERE supervisor_id = ? AND is_active = 1',
        [existingAllocation.supervisor_id]
      );

      await update(
        'supervisors',
        { current_students: (oldAllocations?.count || 0) - 1 },
        { id: existingAllocation.supervisor_id }
      );

      // Update new supervisor's count
      await update(
        'supervisors',
        { current_students: (currentAllocations?.count || 0) + 1 },
        { id: new_supervisor_id }
      );

      // Update student's research project
      await update(
        'research_projects',
        { supervisor_id: new_supervisor_id },
        { student_id: existingAllocation.student_id }
      );

      return NextResponse.json({
        message: 'Supervisor reallocated successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing new_supervisor_id for reallocation' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Update allocation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
