USE research_consultation;

-- Insert a test submission
INSERT INTO document_submissions (
  title, description, document_type, file_url, file_name, file_size, status, student_id, supervisor_id, research_stage_id, submitted_at
) VALUES (
  'Test Research Proposal',
  'This is a test research proposal for testing the review system',
  'Research Proposal',
  '/uploads/documents/test_proposal.pdf',
  'test_proposal.pdf',
  1024000,
  'pending',
  1,
  3,
  1,
  NOW()
);
