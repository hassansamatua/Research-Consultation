USE research_consultant;

-- Add missing columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS current_stage INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_stage_id INT NULL,
ADD COLUMN IF NOT EXISTS last_approval_date TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'completed', 'suspended') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP NULL;
