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

    if (!['admin', 'super_admin', 'supervisor'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let submissionFilter = '';
    let params: any[] = [];

    // Filter based on user role
    if (user.role_name === 'supervisor') {
      // Supervisors can only see submissions from their assigned students
      submissionFilter = `
        AND ds.student_id IN (
          SELECT student_id FROM supervisor_allocations 
          WHERE supervisor_id = (SELECT id FROM supervisors WHERE user_id = ?) AND status = 'active'
        )
      `;
      params = [user.id];
    }

    // Get all submissions with their details
    const submissions = await getMany(`
      SELECT 
        ds.id,
        ds.title,
        ds.description,
        ds.document_type,
        ds.file_url,
        ds.file_name,
        ds.file_size,
        ds.status,
        ds.submitted_at,
        ds.approved_at,
        ds.last_review_date,
        st.registration_number,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        rs.name as research_stage_name,
        rs.order_index as research_stage_order,
        sup_user.first_name as supervisor_first_name,
        sup_user.last_name as supervisor_last_name,
        sup_user.email as supervisor_email
      FROM document_submissions ds
      JOIN students st ON ds.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN research_stages rs ON ds.research_stage_id = rs.id
      LEFT JOIN supervisors sup ON ds.supervisor_id = sup.id
      LEFT JOIN users sup_user ON sup.user_id = sup_user.id
      WHERE 1=1 ${submissionFilter}
      ORDER BY ds.submitted_at DESC
    `, params);

    // Get all document reviews with reviewer details
    const reviews = await getMany(`
      SELECT 
        dr.*,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        u.role_name as reviewer_role
      FROM document_reviews dr
      JOIN users u ON dr.reviewer_id = u.id
      ORDER BY dr.created_at DESC
    `);

    // Calculate statistics
    const totalComments = reviews.length;
    const pendingReviews = submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length;
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const needsRevisionSubmissions = submissions.filter(s => s.status === 'needs_revision' || s.status === 'reviewed').length;

    // Combine submissions with their reviews
    const submissionsWithReviews = submissions.map(submission => {
      const submissionReviews = reviews.filter(review => review.submission_id === submission.id);
      return {
        ...submission,
        reviews: submissionReviews,
        has_reviews: submissionReviews.length > 0,
        latest_review: submissionReviews[0] || null
      };
    });

    return NextResponse.json({
      success: true,
      statistics: {
        total_comments: totalComments,
        pending_reviews: pendingReviews,
        approved_submissions: approvedSubmissions,
        needs_revision: needsRevisionSubmissions
      },
      submissions: submissionsWithReviews,
      reviews: reviews
    });

  } catch (error) {
    console.error('Get comments dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
