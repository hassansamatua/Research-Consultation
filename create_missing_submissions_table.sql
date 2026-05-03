-- Create submissions table to match the schema expectations
USE research_consultant;

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    research_project_id INT NOT NULL,
    research_stage_id INT NOT NULL,
    student_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('submitted', 'under_review', 'revision_required', 'approved', 'rejected') DEFAULT 'submitted',
    supervisor_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (research_project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (research_stage_id) REFERENCES research_stages(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    student_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_type ENUM('general', 'inline', 'recommendation') DEFAULT 'general',
    page_number INT NULL,
    line_number INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reply_to_id INT NULL,
    attachment_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Create guidelines table
CREATE TABLE IF NOT EXISTS guidelines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(500) NULL,
    target_role VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    research_stage_id INT NULL,
    target_role VARCHAR(50) NULL,
    deadline_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (research_stage_id) REFERENCES research_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    parameters TEXT NULL,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500) NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project ON submissions(research_project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_comments_submission ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Insert sample data for testing
INSERT IGNORE INTO submissions (research_project_id, research_stage_id, student_id, file_path, original_filename, file_size, status) VALUES
(1, 1, 1, '/uploads/documents/proposal.pdf', 'research_proposal.pdf', 1024000, 'submitted'),
(1, 2, 1, '/uploads/documents/chapter1.pdf', 'chapter_one.pdf', 2048000, 'under_review');

INSERT IGNORE INTO comments (submission_id, supervisor_id, student_id, comment_text, comment_type) VALUES
(1, 1, 1, 'Good start but needs more literature review', 'general'),
(1, 1, 1, 'Check formatting on page 5', 'inline');

INSERT IGNORE INTO messages (sender_id, receiver_id, subject, message_text) VALUES
(1, 2, 'Meeting Request', 'Can we schedule a meeting to discuss the proposal?'),
(2, 1, 'Re: Meeting Request', 'Sure, how about tomorrow at 10 AM?');

INSERT IGNORE INTO guidelines (title, content, target_role, created_by) VALUES
('Research Proposal Guidelines', 'Your proposal should include: background, objectives, methodology, and timeline', 'student', 3),
('Supervision Guidelines', 'Meet with students monthly and provide constructive feedback', 'supervisor', 3);

INSERT IGNORE INTO deadlines (title, description, research_stage_id, target_role, deadline_date, created_by) VALUES
('Proposal Submission', 'Submit research proposal by this date', 1, 'student', '2024-12-31', 3),
('Final Dissertation', 'Submit final dissertation by this date', 7, 'student', '2025-06-30', 3);

SELECT 'Missing tables created successfully' as message;
