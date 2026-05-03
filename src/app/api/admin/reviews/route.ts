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

    // Check if user has admin role
    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get all reviews with submission and user details
    const reviews = await getMany(`
      SELECT 
        dr.*,
        u.first_name as reviewer_name,
        u.last_name,
        r.name as reviewer_role,
        ds.title as submission_title,
        ds.status as submission_status,
        ds.document_type,
        rs.name as research_stage_name,
        s.first_name as student_name,
        s.last_name as student_last_name,
        st.email as student_email
      FROM document_reviews dr
      JOIN users u ON dr.reviewer_id = u.id
      JOIN roles r ON u.role_id = r.id
      JOIN document_submissions ds ON dr.submission_id = ds.id
      JOIN research_stages rs ON ds.research_stage_id = rs.id
      JOIN students st ON ds.student_id = st.id
      JOIN users s ON st.user_id = s.id
      ORDER BY dr.created_at DESC
    `);

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('Get admin reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
