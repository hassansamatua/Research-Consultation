# PowerShell script to create missing database tables

Write-Host "Creating missing database tables..."

# Check if tables exist and create them
try {
    # Try to create document_types table
    $createDocTypes = mysql -u root -p research_consultant -e "CREATE TABLE IF NOT EXISTS document_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        file_types VARCHAR(255) DEFAULT 'pdf,doc,docx',
        max_size_mb INT DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "document_types table created successfully"
    } else {
        Write-Host "Error creating document_types table: $LASTEXITCODE"
    }

    # Try to create document_submissions table
    $createDocSubmissions = mysql -u root -p research_consultant -e "CREATE TABLE IF NOT EXISTS document_submissions (
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
    );" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "document_submissions table created successfully"
    } else {
        Write-Host "Error creating document_submissions table: $LASTEXITCODE"
    }

    Write-Host "Tables creation process completed. Check MySQL for any errors."
    Write-Host ""
} catch {
    Write-Host "Fatal error during table creation: $_"
    Write-Host ""
    exit 1
}
