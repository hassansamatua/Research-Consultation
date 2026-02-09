USE research_consultant;

-- Create document_types table
CREATE TABLE IF NOT EXISTS document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    file_types VARCHAR(255) DEFAULT 'pdf,doc,docx',
    max_size_mb INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert document types
INSERT IGNORE INTO document_types (name, description, file_types, max_size_mb) VALUES
('Proposal', 'Research proposal document', 'pdf,doc,docx', 15),
('Literature Review', 'Literature review chapter', 'pdf,doc,docx', 20),
('Chapter', 'Research chapter submission', 'pdf,doc,docx', 25),
('Dissertation', 'Final dissertation submission', 'pdf,doc,docx', 50),
('Appendix', 'Supporting documents and appendices', 'pdf,doc,docx,xlsx', 30);

-- Create document_submissions table
CREATE TABLE IF NOT EXISTS document_submissions (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
