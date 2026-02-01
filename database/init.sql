-- Database initialization script for Zanzibar University Research Consultation System
-- Run this script to create the database and initial data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS research_consultant;
USE research_consultant;

-- Drop existing tables if they exist (for fresh installation)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS deadlines;
DROP TABLE IF EXISTS guidelines;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS supervisor_allocations;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS research_stages;
DROP TABLE IF EXISTS research_projects;
DROP TABLE IF EXISTS supervisors;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP VIEW IF EXISTS active_supervisor_allocations;
DROP VIEW IF EXISTS student_progress;
SET FOREIGN_KEY_CHECKS = 1;

-- Source the main schema
SOURCE schema.sql;

-- Insert sample data for testing

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO users (email, password, first_name, last_name, phone, role_id) VALUES
('admin@zu.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'User', '+255 777 123456', 3),
('superadmin@zu.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Super', 'Admin', '+255 777 123457', 4),
('dr.mohamed@zu.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Mohamed', 'Ali', '+255 777 123458', 2),
('dr.fatma@zu.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Fatma', 'Hassan', '+255 777 123459', 2),
('student1@zumis.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Ali', 'Hassan', '+255 777 123460', 1),
('student2@zumis.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Fatma', 'Omar', '+255 777 123461', 1),
('student3@zumis.ac.tz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Omar', 'Said', '+255 777 123462', 1);

-- Insert sample students
INSERT INTO students (user_id, registration_number, program, degree_level, enrollment_date, expected_completion_date) VALUES
(5, 'ZU/PG/2023/001', 'Computer Science', 'Masters', '2023-09-01', '2025-09-01'),
(6, 'ZU/PG/2023/002', 'Business Administration', 'Masters', '2023-09-01', '2025-09-01'),
(7, 'ZU/PG/2023/003', 'Education', 'PhD', '2023-09-01', '2027-09-01');

-- Insert sample supervisors
INSERT INTO supervisors (user_id, staff_id, department, specialization, academic_rank, max_students, current_students) VALUES
(3, 'STF001', 'Computer Science', 'Machine Learning', 'Senior Lecturer', 10, 2),
(4, 'STF002', 'Business Administration', 'Strategic Management', 'Lecturer', 8, 1);

-- Insert sample research projects
INSERT INTO research_projects (student_id, title, description, research_area, start_date, expected_completion_date, status) VALUES
(1, 'Machine Learning Applications in Healthcare', 'Applying ML algorithms for disease prediction and diagnosis', 'Machine Learning', '2023-09-01', '2025-06-01', 'ongoing'),
(2, 'Digital Transformation Strategies in SMEs', 'Analyzing digital adoption patterns in small and medium enterprises', 'Strategic Management', '2023-09-01', '2025-06-01', 'ongoing'),
(3, 'Impact of Technology on Modern Education', 'Studying the effects of digital tools on learning outcomes', 'Educational Technology', '2023-09-01', '2027-06-01', 'ongoing');

-- Insert sample supervisor allocations
INSERT INTO supervisor_allocations (student_id, supervisor_id, research_project_id, allocation_date, is_primary, status) VALUES
(1, 1, 1, '2023-09-15', TRUE, 'active'),
(2, 2, 2, '2023-09-15', TRUE, 'active'),
(3, 1, 3, '2023-09-15', TRUE, 'active');

-- Insert sample guidelines
INSERT INTO guidelines (title, content, target_role, is_active, created_by) VALUES
('Research Proposal Guidelines', 'Detailed guidelines for preparing and submitting research proposals including format, structure, and evaluation criteria.', 'all', TRUE, 1),
('Thesis Formatting Requirements', 'Official formatting guidelines for Masters and PhD thesis submissions including margins, fonts, and citation styles.', 'student', TRUE, 1),
('Supervisor Responsibilities', 'Guidelines outlining the roles and responsibilities of research supervisors in the postgraduate program.', 'supervisor', TRUE, 1);

-- Insert sample deadlines
INSERT INTO deadlines (title, description, research_stage_id, target_role, deadline_date, is_active, created_by) VALUES
('Proposal Submission Deadline', 'Final deadline for research proposal submissions for the current academic year.', 1, 'student', '2024-03-31', TRUE, 1),
('Chapter 1 Submission', 'Deadline for submitting Chapter 1 (Introduction) of your research.', 2, 'student', '2024-05-31', TRUE, 1),
('Final Thesis Submission', 'Final deadline for complete thesis submission for graduation consideration.', 7, 'student', '2025-07-31', TRUE, 1);

-- Update supervisor current students count
UPDATE supervisors SET current_students = (
    SELECT COUNT(*) 
    FROM supervisor_allocations 
    WHERE supervisors.id = supervisor_allocations.supervisor_id 
    AND supervisor_allocations.status = 'active'
);

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES
(1, 'LOGIN', 'user', 1, 'Admin user logged in'),
(5, 'LOGIN', 'user', 5, 'Student Ali Hassan logged in'),
(3, 'LOGIN', 'user', 3, 'Dr. Mohamed Ali logged in'),
(5, 'SUBMIT_DOCUMENT', 'submission', 1, 'Submitted research proposal'),
(3, 'REVIEW_SUBMISSION', 'submission', 1, 'Reviewed student proposal');

-- Display success message
SELECT 'Database initialized successfully!' as message;
SELECT 'Sample users created:' as info;
SELECT email, CONCAT(first_name, ' ', last_name) as full_name, role_name FROM users u JOIN roles r ON u.role_id = r.id;
