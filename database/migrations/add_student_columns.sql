-- ========================================
-- Add Missing Student Columns
-- ========================================
-- This migration adds missing columns to the students table
-- to support complete student information

-- Add first_name column
ALTER TABLE students 
ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '' 
AFTER registration_number;

-- Add last_name column  
ALTER TABLE students 
ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT ''
AFTER first_name;

-- Add email column
ALTER TABLE students 
ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT ''
AFTER last_name;

-- Add phone column
ALTER TABLE students 
ADD COLUMN phone VARCHAR(20) NULL DEFAULT NULL
AFTER email;

-- Add middle_name column (optional)
ALTER TABLE students 
ADD COLUMN middle_name VARCHAR(100) NULL DEFAULT NULL
AFTER phone;

-- Add gender column
ALTER TABLE students 
ADD COLUMN gender ENUM('male', 'female', 'other') NULL DEFAULT NULL
AFTER middle_name;

-- Add date_of_birth column
ALTER TABLE students 
ADD COLUMN date_of_birth DATE NULL DEFAULT NULL
AFTER gender;

-- Add address column
ALTER TABLE students 
ADD COLUMN address TEXT NULL DEFAULT NULL
AFTER date_of_birth;

-- Add city column
ALTER TABLE students 
ADD COLUMN city VARCHAR(100) NULL DEFAULT NULL
AFTER address;

-- Add country column
ALTER TABLE students 
ADD COLUMN country VARCHAR(100) NULL DEFAULT NULL
AFTER city;

-- Add emergency_contact_name column
ALTER TABLE students 
ADD COLUMN emergency_contact_name VARCHAR(255) NULL DEFAULT NULL
AFTER country;

-- Add emergency_contact_phone column
ALTER TABLE students 
ADD COLUMN emergency_contact_phone VARCHAR(20) NULL DEFAULT NULL
AFTER emergency_contact_name;

-- Add emergency_contact_relationship column
ALTER TABLE students 
ADD COLUMN emergency_contact_relationship VARCHAR(50) NULL DEFAULT NULL
AFTER emergency_contact_phone;

-- Add profile_image column
ALTER TABLE students 
ADD COLUMN profile_image VARCHAR(255) NULL DEFAULT NULL
AFTER emergency_contact_relationship;

-- Add notes column
ALTER TABLE students 
ADD COLUMN notes TEXT NULL DEFAULT NULL
AFTER profile_image;

-- Add scholarship_status column
ALTER TABLE students 
ADD COLUMN scholarship_status ENUM('none', 'partial', 'full') NULL DEFAULT NULL
AFTER notes;

-- Add gpa column
ALTER TABLE students 
ADD COLUMN gpa DECIMAL(3,2) NULL DEFAULT NULL
AFTER scholarship_status;

-- Add admission_score column
ALTER TABLE students 
ADD COLUMN admission_score DECIMAL(5,2) NULL DEFAULT NULL
AFTER gpa;

-- Add previous_education column
ALTER TABLE students 
ADD COLUMN previous_education TEXT NULL DEFAULT NULL
AFTER admission_score;

-- Add work_experience column
ALTER TABLE students 
ADD COLUMN work_experience TEXT NULL DEFAULT NULL
AFTER previous_education;

-- Add skills column
ALTER TABLE students 
ADD COLUMN skills TEXT NULL DEFAULT NULL
AFTER work_experience;

-- Add interests column
ALTER TABLE students 
ADD COLUMN interests TEXT NULL DEFAULT NULL
AFTER skills;

-- Update existing records to have default values
UPDATE students SET 
    first_name = 'Student',
    last_name = 'User',
    email = CONCAT('student', id, '@zumis.ac.tz'),
    phone = NULL
WHERE first_name IS NULL OR first_name = '' OR 
      last_name IS NULL OR last_name = '' OR 
      email IS NULL OR email = '';

-- ========================================
-- Migration Complete
-- ========================================

-- The students table now includes:
-- 1. idPrimary (Primary Key)
-- 2. user_idIndex (Foreign Key)
-- 3. registration_numberIndex
-- 4. program
-- 5. degree_level
-- 6. enrollment_date
-- 7. expected_completion_date
-- 8. created_at
-- 9. updated_at
-- 10. current_stage
-- 11. current_stage_id
-- 12. last_approval_date
-- 13. progress_percentage
-- 14. status
-- 15. completion_date
-- 16. first_name (NEW)
-- 17. last_name (NEW)
-- 18. email (NEW)
-- 19. phone (NEW)
-- 20. middle_name (NEW)
-- 21. gender (NEW)
-- 22. date_of_birth (NEW)
-- 23. address (NEW)
-- 24. city (NEW)
-- 25. country (NEW)
-- 26. emergency_contact_name (NEW)
-- 27. emergency_contact_phone (NEW)
-- 28. emergency_contact_relationship (NEW)
-- 29. profile_image (NEW)
-- 30. notes (NEW)
-- 31. scholarship_status (NEW)
-- 32. gpa (NEW)
-- 33. admission_score (NEW)
-- 34. previous_education (NEW)
-- 35. work_experience (NEW)
-- 36. skills (NEW)
-- 37. interests (NEW)
