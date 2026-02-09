import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getOne, getMany, insert, update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/documents/review called');
    // Authenticate user
    const user = await authenticateRequest(request);
    console.log('User:', user);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { 
      submission_id, 
      comments, 
      rating, 
      recommendation, 
      review_type 
    } = body;

    console.log('Extracted fields:', { submission_id, comments, rating, recommendation, review_type });

    // Validate required fields
    if (!submission_id || !comments || !recommendation) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: submission_id, comments, recommendation' },
        { status: 400 }
      );
    }

    // Get submission details
    console.log('Getting submission details for ID:', submission_id);
    const submission = await getOne(`
      SELECT ds.*, st.user_id as student_user_id, su.user_id as supervisor_user_id
      FROM document_submissions ds
      JOIN students st ON ds.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN supervisors su ON ds.supervisor_id = su.id
      WHERE ds.id = ?
    `, [submission_id]);
    
    console.log('Found submission:', submission);

    if (!submission) {
      console.log('Submission not found - returning 404');
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to review
    let isAuthorized = false;
    console.log('Checking authorization - User role:', user.role_name, 'User ID:', user.id, 'Supervisor user ID:', submission?.supervisor_user_id);
    
    if (user.role_name === 'supervisor' && user.id === submission.supervisor_user_id) {
      isAuthorized = true;
    } else if (user.role_name === 'admin' || user.role_name === 'super_admin') {
      isAuthorized = true;
    }
    
    console.log('Is authorized:', isAuthorized);

    if (!isAuthorized) {
      console.log('Not authorized - returning 403');
      return NextResponse.json(
        { error: 'Not authorized to review this submission' },
        { status: 403 }
      );
    }

    // Check if submission is in a reviewable state
    console.log('Submission status:', submission.status);
    if (submission.status !== 'pending' && submission.status !== 'reviewed') {
      console.log('Submission not in reviewable state - returning 400');
      return NextResponse.json(
        { error: 'Submission is not in a reviewable state' },
        { status: 400 }
      );
    }

    // Create review
    const reviewData = {
      submission_id,
      reviewer_id: user.id,
      comments,
      rating: rating || null,
      recommendation,
      review_type: review_type || (user.role_name === 'supervisor' ? 'supervisor' : 'admin'),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const reviewId = await insert('document_reviews', reviewData);

    // Update submission status based on recommendation
    let newStatus = 'reviewed';
    let approvedAt = null;

    if (recommendation === 'approve') {
      newStatus = 'approved';
      approvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Update student progress to next stage
      const student = await getOne('SELECT * FROM students WHERE id = ?', [submission.student_id]);
      if (student) {
        const currentStage = await getOne('SELECT * FROM research_stages WHERE id = ?', [submission.research_stage_id]);
        if (currentStage) {
          const nextStage = await getOne(
            'SELECT * FROM research_stages WHERE order_index = ?',
            [currentStage.order_index + 1]
          );
          
          if (nextStage) {
            await update(
              'students',
              { 
                current_stage: nextStage.order_index,
                current_stage_id: nextStage.id,
                last_approval_date: approvedAt
              },
              { id: student.id }
            );
          } else {
            // Student has completed all stages
            await update(
              'students',
              { 
                current_stage: currentStage.order_index + 1,
                current_stage_id: null,
                status: 'completed',
                completion_date: approvedAt
              },
              { id: student.id }
            );
          }
        }
      }
    } else if (recommendation === 'reject') {
      newStatus = 'rejected';
    } else if (recommendation === 'resubmit') {
      newStatus = 'needs_revision';
    }

    await update(
      'document_submissions',
      { 
        status: newStatus,
        approved_at: approvedAt,
        last_review_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      { id: submission_id }
    );

    // Update overall research progress
    await updateResearchProgress(submission.student_id);

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: {
        id: reviewId,
        submission_id,
        recommendation,
        new_status: newStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Review submission error:', error);
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
    const submissionId = searchParams.get('submission_id');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submission_id is required' },
        { status: 400 }
      );
    }

    // Get reviews for the submission
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

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { review_id, comments, rating, recommendation } = body;

    // Validate required fields
    if (!review_id) {
      return NextResponse.json(
        { error: 'Missing required field: review_id' },
        { status: 400 }
      );
    }

    // Get existing review
    const existingReview = await getOne(`
      SELECT dr.*, ds.student_id
      FROM document_reviews dr
      JOIN document_submissions ds ON dr.submission_id = ds.id
      WHERE dr.id = ? AND dr.reviewer_id = ?
    `, [review_id, user.id]);

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or not authorized to edit' },
        { status: 404 }
      );
    }

    // Update review
    const updateData: any = {
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    if (comments !== undefined) updateData.comments = comments;
    if (rating !== undefined) updateData.rating = rating;
    if (recommendation !== undefined) updateData.recommendation = recommendation;

    await update('document_reviews', updateData, { id: review_id });

    // If recommendation changed, update submission status
    if (recommendation && recommendation !== existingReview.recommendation) {
      let newStatus = 'reviewed';
      let approvedAt = null;

      if (recommendation === 'approve') {
        newStatus = 'approved';
        approvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      } else if (recommendation === 'reject') {
        newStatus = 'rejected';
      } else if (recommendation === 'resubmit') {
        newStatus = 'needs_revision';
      }

      await update(
        'document_submissions',
        { 
          status: newStatus,
          approved_at: approvedAt,
          last_review_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        { id: existingReview.submission_id }
      );

      // Update research progress if approved
      if (recommendation === 'approve') {
        await updateResearchProgress(existingReview.student_id);
      }
    }

    return NextResponse.json({
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update research progress
async function updateResearchProgress(studentId: number) {
  try {
    // Calculate overall progress based on approved submissions
    const approvedSubmissions = await getOne(`
      SELECT COUNT(*) as count, MAX(rs.order_index) as max_stage
      FROM document_submissions ds
      JOIN research_stages rs ON ds.research_stage_id = rs.id
      WHERE ds.student_id = ? AND ds.status = 'approved'
    `, [studentId]);

    const totalStages = await getOne('SELECT COUNT(*) as count FROM research_stages');

    if (approvedSubmissions && totalStages) {
      const progressPercentage = (approvedSubmissions.count / totalStages.count) * 100;
      
      await update(
        'students',
        { 
          progress_percentage: Math.round(progressPercentage),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        },
        { id: studentId }
      );
    }
  } catch (error) {
    console.error('Update research progress error:', error);
  }
}
