USE research_consultant;

-- Check if supervisor_allocations table exists
SHOW TABLES LIKE 'supervisor_allocations';

-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS supervisor_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE
);
