-- Zanzibar University Research Consultation System Database Schema
-- Created for Postgraduate Research Management

-- Create database
CREATE DATABASE IF NOT EXISTS research_consultant;
USE research_consultant;

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('student', 'Postgraduate Student'),
('supervisor', 'University Doctor/Research Supervisor'),
('admin', 'Director of Postgraduate Studies'),
('super_admin', 'System Owner/ICT Authority');

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    program VARCHAR(100) NOT NULL,
    degree_level ENUM('Masters', 'PhD') NOT NULL,
    enrollment_date DATE NOT NULL,
    expected_completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Supervisors table
CREATE TABLE supervisors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    staff_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    specialization TEXT,
    academic_rank VARCHAR(50),
    max_students INT DEFAULT 10,
    current_students INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Research projects table
CREATE TABLE research_projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    research_area VARCHAR(100),
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE NULL,
    status ENUM('ongoing', 'completed', 'suspended', 'withdrawn') DEFAULT 'ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Research stages table
CREATE TABLE research_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default research stages
INSERT INTO research_stages (name, description, order_index) VALUES
('Proposal', 'Research proposal submission', 1),
('Chapter One', 'Introduction chapter', 2),
('Chapter Two', 'Literature review', 3),
('Chapter Three', 'Methodology', 4),
('Chapter Four', 'Results and analysis', 5),
('Chapter Five', 'Discussion and conclusion', 6),
('Final Dissertation', 'Complete dissertation submission', 7);

-- Submissions table
CREATE TABLE submissions (
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

-- Supervisor allocations table
CREATE TABLE supervisor_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    research_project_id INT NOT NULL,
    allocation_date DATE NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE,
    FOREIGN KEY (research_project_id) REFERENCES research_projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_allocation (student_id, supervisor_id, research_project_id)
);

-- Comments table
CREATE TABLE comments (
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

-- Messages table
CREATE TABLE messages (
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

-- Guidelines table
CREATE TABLE guidelines (
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

-- Deadlines table
CREATE TABLE deadlines (
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

-- Activity logs table
CREATE TABLE activity_logs (
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

-- Reports table
CREATE TABLE reports (
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_students_registration ON students(registration_number);
CREATE INDEX idx_supervisors_staff ON supervisors(staff_id);
CREATE INDEX idx_research_projects_student ON research_projects(student_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_project ON submissions(research_project_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_supervisor_allocations_student ON supervisor_allocations(student_id);
CREATE INDEX idx_supervisor_allocations_supervisor ON supervisor_allocations(supervisor_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Create view for active supervisor-student allocations
CREATE VIEW active_supervisor_allocations AS
SELECT 
    sa.id,
    sa.student_id,
    sa.supervisor_id,
    sa.research_project_id,
    sa.allocation_date,
    s.first_name AS student_first_name,
    s.last_name AS student_last_name,
    st.registration_number,
    sup.first_name AS supervisor_first_name,
    sup.last_name AS supervisor_last_name,
    sup.staff_id,
    rp.title AS research_title,
    rp.status AS project_status
FROM supervisor_allocations sa
JOIN students st ON sa.student_id = st.id
JOIN users s ON st.user_id = s.id
JOIN supervisors sup ON sa.supervisor_id = sup.id
JOIN users sup_u ON sup.user_id = sup_u.id
JOIN research_projects rp ON sa.research_project_id = rp.id
WHERE sa.status = 'active';

-- Create view for student progress
CREATE VIEW student_progress AS
SELECT 
    st.id AS student_id,
    st.registration_number,
    u.first_name,
    u.last_name,
    rp.id AS research_project_id,
    rp.title AS research_title,
    COUNT(DISTINCT rs.id) AS total_stages,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN rs.id END) AS completed_stages,
    MAX(s.updated_at) AS last_submission_date,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN rs.id END) = COUNT(DISTINCT rs.id) 
        THEN 'completed'
        WHEN COUNT(DISTINCT CASE WHEN s.status IN ('submitted', 'under_review', 'revision_required') THEN rs.id END) > 0
        THEN 'in_progress'
        ELSE 'not_started'
    END AS overall_progress
FROM students st
JOIN users u ON st.user_id = u.id
LEFT JOIN research_projects rp ON st.id = rp.student_id
LEFT JOIN research_stages rs ON 1=1
LEFT JOIN submissions s ON rp.id = s.research_project_id AND rs.id = s.research_stage_id
GROUP BY st.id, st.registration_number, u.first_name, u.last_name, rp.id, rp.title;
