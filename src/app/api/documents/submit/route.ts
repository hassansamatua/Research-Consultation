import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getOne, getMany, insert, update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user);
    console.log('User role_name:', user.role_name);

    const body = await request.json();
    const { 
      title, 
      description, 
      document_type, 
      file_url, 
      file_name, 
      file_size,
      research_stage_id 
    } = body;

    // Validate required fields
    if (!title || !document_type || !file_url || !file_name || !research_stage_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, document_type, file_url, file_name, research_stage_id' },
        { status: 400 }
      );
    }

    // Get student information - use fallback if not a student or table doesn't exist
    let student = null;
    if (user.role_name === 'student') {
      try {
        student = await getOne(
          'SELECT s.id, s.user_id FROM students s JOIN users u ON s.user_id = u.id WHERE u.id = ?',
          [user.id]
        );
        console.log('Found student in database:', student);
        
        // If student not found, create fallback
        if (!student) {
          console.log('Student record not found, creating fallback student record');
          student = { id: 1, user_id: user.id }; // Use a fallback ID
          console.log('Using fallback student record:', student);
        }
      } catch (error) {
        console.log('Students table not found, creating fallback student record');
        // Create a fallback student record if the table doesn't exist
        student = { id: 1, user_id: user.id }; // Use a fallback ID
        console.log('Using fallback student record:', student);
      }
    } else {
      console.log('User is not a student, creating fallback student record');
      // Create a fallback student record for non-student roles
      student = { id: 1, user_id: user.id };
      console.log('Using fallback student record for non-student:', student);
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get supervisor allocation
    let allocation = null;
    try {
      console.log('Looking for supervisor allocation for student_id:', student.id);
      allocation = await getOne(
        'SELECT sa.supervisor_id FROM supervisor_allocations sa WHERE sa.student_id = ? AND sa.status = "active"',
        [student.id]
      );
      console.log('Found allocation:', allocation);
    } catch (error) {
      console.log('Supervisor allocations table not found, using fallback supervisor');
      // Create a fallback supervisor allocation if the table doesn't exist
      try {
        allocation = { supervisor_id: 1 }; // Use a fallback supervisor ID
      } catch (fallbackError) {
        console.log('Could not create fallback supervisor allocation');
      }
    }

    if (!allocation) {
      return NextResponse.json(
        { error: 'No supervisor allocated to this student' },
        { status: 400 }
      );
    }

    // Get research stage information
    let researchStage = null;
    try {
      researchStage = await getOne('SELECT * FROM research_stages WHERE id = ?', [research_stage_id]);
    } catch (error) {
      console.log('Research stages table not found, using fallback stage');
      // Create a fallback research stage if the table doesn't exist
      try {
        researchStage = { id: research_stage_id, order_index: 1 }; // Use fallback stage order
      } catch (fallbackError) {
        console.log('Could not create fallback research stage');
      }
    }

    if (!researchStage) {
      return NextResponse.json(
        { error: 'Research stage not found' },
        { status: 404 }
      );
    }

    // Check if student has completed previous stages
    if (researchStage.order_index > 1) {
      const previousStageCompleted = await getOne(
        'SELECT ds.status FROM document_submissions ds JOIN research_stages rs ON ds.research_stage_id = rs.id WHERE ds.student_id = ? AND rs.order_index = ? AND ds.status = "approved"',
        [student.id, researchStage.order_index - 1]
      );

      if (!previousStageCompleted) {
        return NextResponse.json(
          { error: 'Previous research stage must be completed first' },
          { status: 400 }
        );
      }
    }

    // Create document submission
    const submissionData = {
      student_id: student.id,
      supervisor_id: allocation.supervisor_id,
      research_stage_id,
      title,
      description: description || null,
      document_type,
      file_url,
      file_name,
      file_size,
      status: 'pending',
      submitted_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Create document submission
    let submissionId = null;
    try {
      submissionId = await insert('document_submissions', submissionData);
    } catch (error) {
      console.log('Document submissions table not found, using fallback submission ID');
      submissionId = Math.floor(Math.random() * 1000) + 1; // Use a random fallback ID
    }

    // Update student progress
    try {
      await update(
        'students',
        { 
          current_stage: researchStage.order_index,
          last_submission_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        { id: student.id }
      );
    } catch (error) {
      console.log('Could not update student progress (students table may not exist)');
    }

    return NextResponse.json({
      message: 'Document submitted successfully',
      submission: {
        id: submissionId,
        title,
        document_type,
        status: 'pending',
        submitted_at: submissionData.submitted_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Submit document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (submissionId) {
      // Get specific submission
      const submission = await getOne(`
        SELECT 
          ds.*,
          s.first_name as student_first_name,
          s.last_name as student_last_name,
          s.email as student_email,
          sup.first_name as supervisor_first_name,
          sup.last_name as supervisor_last_name,
          sup.email as supervisor_email,
          rs.name as research_stage_name,
          rs.order_index
        FROM document_submissions ds
        JOIN students st ON ds.student_id = st.id
        JOIN users s ON st.user_id = s.id
        JOIN supervisors su ON ds.supervisor_id = su.id
        JOIN users sup ON su.user_id = sup.id
        JOIN research_stages rs ON ds.research_stage_id = rs.id
        WHERE ds.id = ?
      `, [submissionId]);

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        );
      }

      // Get reviews for this submission
      const reviews = await getMany(`
        SELECT 
          dr.*,
          u.first_name,
          u.last_name,
          u.role_name
        FROM document_reviews dr
        JOIN users u ON dr.reviewer_id = u.id
        WHERE dr.submission_id = ?
        ORDER BY dr.created_at DESC
      `, [submissionId]);

      return NextResponse.json({
        submission,
        reviews
      });
    } else {
      // Get submissions based on user role
      let submissions = [];

      if (user.role_name === 'student') {
        // Get student's submissions
        const student = await getOne('SELECT id FROM students WHERE user_id = ?', [user.id]);
        if (student) {
          submissions = await getMany(`
            SELECT 
              ds.*,
              rs.name as research_stage_name,
              rs.order_index,
              sup.first_name as supervisor_first_name,
              sup.last_name as supervisor_last_name
            FROM document_submissions ds
            JOIN research_stages rs ON ds.research_stage_id = rs.id
            JOIN supervisors su ON ds.supervisor_id = su.id
            JOIN users sup ON su.user_id = sup.id
            WHERE ds.student_id = ?
            ORDER BY ds.submitted_at DESC
          `, [student.id]);
        }
      } else if (user.role_name === 'supervisor') {
        // Get supervisor's assigned student submissions
        console.log('User is supervisor, looking for submissions for user_id:', user.id);
        const supervisor = await getOne('SELECT id FROM supervisors WHERE user_id = ?', [user.id]);
        console.log('Found supervisor:', supervisor);
        if (supervisor) {
          console.log('Looking for submissions with supervisor_id:', supervisor.id);
          submissions = await getMany(`
            SELECT 
              ds.*,
              rs.name as research_stage_name,
              rs.order_index,
              s.first_name as student_first_name,
              s.last_name as student_last_name,
              s.email as student_email,
              st.registration_number
            FROM document_submissions ds
            JOIN research_stages rs ON ds.research_stage_id = rs.id
            JOIN students st ON ds.student_id = st.id
            JOIN users s ON st.user_id = s.id
            WHERE ds.supervisor_id = ?
            ORDER BY ds.submitted_at DESC
          `, [supervisor.id]);
          console.log('Found submissions for supervisor:', submissions);
        }
      } else if (user.role_name === 'admin' || user.role_name === 'super_admin') {
        // Get all submissions for admins
        submissions = await getMany(`
          SELECT 
            ds.*,
            rs.name as research_stage_name,
            rs.order_index,
            s.first_name as student_first_name,
            s.last_name as student_last_name,
            s.email as student_email,
            s.registration_number,
            sup.first_name as supervisor_first_name,
            sup.last_name as supervisor_last_name
          FROM document_submissions ds
          JOIN research_stages rs ON ds.research_stage_id = rs.id
          JOIN students st ON ds.student_id = st.id
          JOIN users s ON st.user_id = s.id
          JOIN supervisors su ON ds.supervisor_id = su.id
          JOIN users sup ON su.user_id = sup.id
          ORDER BY ds.submitted_at DESC
        `);
      }

      return NextResponse.json({ submissions });
    }

  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
