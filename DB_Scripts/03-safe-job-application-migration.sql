-- Migration Script: Enhanced Job Application System (Safe Version)
-- This script checks for existing columns before adding them
-- Run this to update existing database schema safely

USE jobportal;

-- Step 1: Add status column only if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'jobportal' 
AND TABLE_NAME = 'job_seeker_apply' 
AND COLUMN_NAME = 'status';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE job_seeker_apply ADD COLUMN status ENUM(''APPLIED'', ''UNDER_REVIEW'', ''INTERVIEW_SCHEDULED'', ''INTERVIEWED'', ''OFFERED'', ''HIRED'', ''REJECTED'', ''WITHDRAWN'') DEFAULT ''APPLIED'' AFTER cover_letter',
    'SELECT ''Column status already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Add resume_path column only if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'jobportal' 
AND TABLE_NAME = 'job_seeker_apply' 
AND COLUMN_NAME = 'resume_path';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE job_seeker_apply ADD COLUMN resume_path VARCHAR(500) AFTER status',
    'SELECT ''Column resume_path already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add last_updated column only if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'jobportal' 
AND TABLE_NAME = 'job_seeker_apply' 
AND COLUMN_NAME = 'last_updated';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE job_seeker_apply ADD COLUMN last_updated DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER resume_path',
    'SELECT ''Column last_updated already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add recruiter_notes column only if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'jobportal' 
AND TABLE_NAME = 'job_seeker_apply' 
AND COLUMN_NAME = 'recruiter_notes';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE job_seeker_apply ADD COLUMN recruiter_notes TEXT AFTER last_updated',
    'SELECT ''Column recruiter_notes already exists'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Modify cover_letter to TEXT if it's still VARCHAR
ALTER TABLE job_seeker_apply MODIFY COLUMN cover_letter TEXT;

-- Step 6: Update existing records to have proper timestamps (only if last_updated exists and is NULL)
UPDATE job_seeker_apply 
SET last_updated = COALESCE(last_updated, apply_date, NOW()) 
WHERE last_updated IS NULL;

-- Step 7: Add indexes for better performance (ignore errors if they already exist)
CREATE INDEX IF NOT EXISTS idx_job_seeker_apply_status ON job_seeker_apply(status);
CREATE INDEX IF NOT EXISTS idx_job_seeker_apply_last_updated ON job_seeker_apply(last_updated);
CREATE INDEX IF NOT EXISTS idx_job_post_activity_posted_by ON job_post_activity(posted_by_id);

-- Step 8: Show final table structure
SELECT 'Final table structure:' AS message;
DESCRIBE job_seeker_apply;