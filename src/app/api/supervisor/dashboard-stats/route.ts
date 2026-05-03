import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

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

    if (user.role_name !== 'supervisor') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get supervisor's assigned students
    const allocations = await getMany(`
      SELECT 
        sa.*,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        st.registration_number,
        st.program,
        st.enrollment_date,
        st.expected_completion_date,
        rp.title as research_title,
        rp.status as project_status
      FROM supervisor_allocations sa
      JOIN students st ON sa.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN research_projects rp ON st.id = rp.student_id
      WHERE sa.supervisor_id = (SELECT id FROM supervisors WHERE user_id = ?) AND sa.status = 'active'
      ORDER BY sa.created_at DESC
    `, [user.id]);

    // Calculate student progress using the existing student-progress logic
    const progressResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/student-progress`);
    let progressData: { student_progress: Array<{student_id: number, progress_percentage: number}> } = { student_progress: [] };
    
    if (progressResponse.ok) {
      const data = await progressResponse.json();
      progressData = data.success ? data : { student_progress: [] };
    }

    // Get pending reviews (submissions awaiting review)
    const pendingReviews = await getMany(`
      SELECT 
        s.id,
        s.submission_date,
        s.status,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        rs.name as stage_name,
        rp.title as research_title
      FROM submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN research_stages rs ON s.research_stage_id = rs.id
      LEFT JOIN research_projects rp ON st.id = rp.student_id
      WHERE s.status IN ('submitted', 'under_review')
      AND s.student_id IN (
        SELECT student_id FROM supervisor_allocations 
        WHERE supervisor_id = (SELECT id FROM supervisors WHERE user_id = ?) AND status = 'active'
      )
      ORDER BY s.submission_date DESC
    `, [user.id]);

    // Get messages for this supervisor
    const messages = await getMany(`
      SELECT 
        m.id,
        m.subject,
        m.message_text,
        m.is_read,
        m.created_at,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [user.id, user.id]);

    // Calculate statistics
    const totalStudents = allocations.length;
    const activeStudents = allocations.filter(a => a.project_status === 'ongoing').length;
    const completedStudents = allocations.filter(a => a.project_status === 'completed').length;
    const unreadMessages = messages.filter(m => m.receiver_id === user.id && !m.is_read).length;
    const totalMessages = messages.length;

    // Combine student data with progress
    const studentsWithProgress = allocations.map(allocation => {
      const progress = progressData.student_progress?.find(p => p.student_id === allocation.student_id);
      const progressPercentage = progress?.progress_percentage || 0;
      return {
        ...allocation,
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'Completed' : 
                progressPercentage > 0 ? 'On Track' : 'Not Started'
      };
    });

    return NextResponse.json({
      success: true,
      statistics: {
        assigned_students: totalStudents,
        active_students: activeStudents,
        completed_students: completedStudents,
        pending_reviews: pendingReviews.length,
        total_messages: totalMessages,
        unread_messages: unreadMessages
      },
      students: studentsWithProgress,
      pending_reviews: pendingReviews,
      recent_messages: messages.slice(0, 10)
    });

  } catch (error) {
    console.error('Get supervisor dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
