-- Migration Script: Enhanced Job Application System
-- Run this to update existing database schema

USE jobportal;

-- Step 1: Add new columns to job_seeker_apply table
ALTER TABLE job_seeker_apply 
ADD COLUMN status ENUM('APPLIED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN') 
DEFAULT 'APPLIED' AFTER cover_letter;

ALTER TABLE job_seeker_apply 
ADD COLUMN resume_path VARCHAR(500) AFTER status;

ALTER TABLE job_seeker_apply 
ADD COLUMN last_updated DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER resume_path;

ALTER TABLE job_seeker_apply 
ADD COLUMN recruiter_notes TEXT AFTER last_updated;

-- Step 2: Modify cover_letter to support longer text
ALTER TABLE job_seeker_apply 
MODIFY COLUMN cover_letter TEXT;

-- Step 3: Update existing records to have proper timestamps
UPDATE job_seeker_apply 
SET last_updated = apply_date 
WHERE last_updated IS NULL;

-- Step 4: Add indexes for better query performance
CREATE INDEX idx_job_seeker_apply_status ON job_seeker_apply(status);
CREATE INDEX idx_job_seeker_apply_last_updated ON job_seeker_apply(last_updated);

-- Step 5: Add index for recruiter queries (job applications by recruiter)
-- This will help with the query: "get all applications for recruiter's jobs"
CREATE INDEX idx_job_post_activity_posted_by ON job_post_activity(posted_by_id);

-- Verification: Check the updated table structure
DESCRIBE job_seeker_apply;