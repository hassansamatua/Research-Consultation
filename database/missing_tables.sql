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

-- Create indexes for new tables
CREATE INDEX idx_document_types_name ON document_types(name);
CREATE INDEX idx_document_submissions_student ON document_submissions(student_id);
CREATE INDEX idx_document_submissions_status ON document_submissions(status);
CREATE INDEX idx_document_submissions_stage ON document_submissions(research_stage_id);
