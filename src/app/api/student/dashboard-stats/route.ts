import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany, getOne } from '@/lib/db';

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

    if (user.role_name !== 'student') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get student information
    const student = await getOne(`
      SELECT st.*, u.first_name, u.last_name, u.email
      FROM students st
      JOIN users u ON st.user_id = u.id
      WHERE u.id = ?
    `, [user.id]);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get student's submissions
    const submissions = await getMany(`
      SELECT 
        s.*,
        rs.name as stage_name,
        rs.order_index as stage_order
      FROM submissions s
      LEFT JOIN research_stages rs ON s.research_stage_id = rs.id
      WHERE s.student_id = ?
      ORDER BY rs.order_index, s.submission_date DESC
    `, [student.id]);

    // Get all research stages for progress calculation
    const stages = await getMany(`
      SELECT id, name, order_index
      FROM research_stages
      ORDER BY order_index
    `);

    // Get messages for this student
    const messages = await getMany(`
      SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
      LIMIT 20
    `, [user.id]);

    // Calculate progress
    const totalStages = stages.length;
    const completedStages = submissions.filter(sub => sub.status === 'approved').length;
    const inProgressStages = submissions.filter(sub => 
      sub.status === 'submitted' || sub.status === 'under_review'
    ).length;

    // Calculate progress percentage
    const progressPoints = (completedStages * 100) + (inProgressStages * 50);
    const maxPoints = totalStages * 100;
    const progressPercentage = Math.round((progressPoints / maxPoints) * 100);

    // Get submission status counts
    const submittedCount = submissions.filter(sub => sub.status === 'submitted').length;
    const underReviewCount = submissions.filter(sub => sub.status === 'under_review').length;
    const approvedCount = submissions.filter(sub => sub.status === 'approved').length;

    // Get unread messages count
    const unreadMessages = messages.filter(m => !m.is_read).length;

    return NextResponse.json({
      success: true,
      student: {
        ...student,
        progress_percentage: Math.min(progressPercentage, 100),
        completed_stages: completedStages,
        total_stages: totalStages
      },
      statistics: {
        current_submissions: submissions.length,
        submitted_review: submittedCount,
        under_review: underReviewCount,
        approved: approvedCount,
        total_messages: messages.length,
        unread_messages: unreadMessages
      },
      submissions: submissions,
      recent_messages: messages.slice(0, 5)
    });

  } catch (error) {
    console.error('Get student dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
