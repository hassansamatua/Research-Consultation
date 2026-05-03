import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create a mock submission for testing
    const mockSubmission = {
      id: 1,
      title: 'Test Research Proposal',
      description: 'This is a test research proposal for testing the review system',
      document_type: 'Research Proposal',
      file_name: 'test_proposal.pdf',
      file_size: 1024000,
      file_url: '/uploads/documents/test_proposal.pdf',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      research_stage_name: 'Proposal Stage',
      research_stage_order: 1,
      student_first_name: 'Test',
      student_last_name: 'Student',
      student_email: 'test.student@university.edu',
      registration_number: 'REG001'
    };

    return NextResponse.json({
      submissions: [mockSubmission]
    });
  } catch (error) {
    console.error('Test submission error:', error);
    return NextResponse.json(
      { error: 'Failed to create test submission' },
      { status: 500 }
    );
  }
}
