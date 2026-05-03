USE research_consultation;
INSERT INTO document_submissions (title, description, document_type, file_url, file_name, file_size, status, student_id, supervisor_id, research_stage_id, submitted_at) VALUES ('Test Research Proposal', 'Test description', 'Research Proposal', '/uploads/documents/test.pdf', 'test.pdf', 1024000, 'pending', 1, 3, 1, NOW());
