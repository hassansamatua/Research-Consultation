USE research_consultant;

-- Create document_reviews table
CREATE TABLE IF NOT EXISTS document_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    comments TEXT NOT NULL,
    rating INT,
    recommendation ENUM('approve', 'reject', 'resubmit') NOT NULL,
    review_type ENUM('supervisor', 'admin', 'peer') DEFAULT 'supervisor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES document_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_document_reviews_submission (submission_id),
    INDEX idx_document_reviews_reviewer (reviewer_id),
    INDEX idx_document_reviews_created (created_at)
);
