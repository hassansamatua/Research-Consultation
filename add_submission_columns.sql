USE research_consultant;

-- Add missing columns to document_submissions table
ALTER TABLE document_submissions 
ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMP NULL;
