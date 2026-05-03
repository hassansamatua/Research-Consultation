-- Missing tables for Research Consultation System
-- These tables are expected by the API but not in the main schema

-- Document Types table
CREATE TABLE document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    file_types VARCHAR(255) DEFAULT 'pdf,doc,docx',
    max_size_mb INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default document types
INSERT INTO document_types (name, description, file_types, max_size_mb) VALUES
('Proposal', 'Research proposal document', 'pdf,doc,docx', 15),
('Literature Review', 'Literature review chapter', 'pdf,doc,docx', 20),
('Chapter', 'Research chapter submission', 'pdf,doc,docx', 25),
('Dissertation', 'Final dissertation submission', 'pdf,doc,docx', 50),
('Appendix', 'Supporting documents and appendices', 'pdf,doc,docx,xlsx', 30);

-- Document Submissions table (alias for submissions table)
CREATE TABLE document_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    research_stage_id INT NOT NULL,
    student_id INT NOT NULL,
    supervisor_id INT NULL,
    status ENUM('pending', 'under_review', 'revision_required', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (research_stage_id) REFERENCES research_stages(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL
);

-- Document Reviews table
CREATE TABLE document_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_text TEXT,
    rating INT DEFAULT 0,
    status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES document_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Meetings table
CREATE TABLE meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supervisor_id INT NOT NULL,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    location VARCHAR(255),
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    meeting_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for new tables
CREATE INDEX idx_document_types_name ON document_types(name);
CREATE INDEX idx_document_submissions_student ON document_submissions(student_id);
CREATE INDEX idx_document_submissions_status ON document_submissions(status);
CREATE INDEX idx_document_submissions_stage ON document_submissions(research_stage_id);
CREATE INDEX idx_document_reviews_submission ON document_reviews(submission_id);
CREATE INDEX idx_document_reviews_reviewer ON document_reviews(reviewer_id);
CREATE INDEX idx_meetings_supervisor ON meetings(supervisor_id);
CREATE INDEX idx_meetings_student ON meetings(student_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);
