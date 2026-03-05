-- Migration to add missing profile fields to job_seeker_profile table
-- SAFE VERSION: Uses IF NOT EXISTS checks to allow idempotent re-runs

USE jobportal;

-- ---------------------------------------------------------------
-- Add new columns to job_seeker_profile (only if they don't exist)
-- ---------------------------------------------------------------

-- phone
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'phone';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN phone VARCHAR(20) NULL AFTER last_name',
  'SELECT ''phone already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- date_of_birth
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'date_of_birth';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN date_of_birth DATE NULL AFTER phone',
  'SELECT ''date_of_birth already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- gender
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'gender';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN gender VARCHAR(20) NULL AFTER date_of_birth',
  'SELECT ''gender already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- willing_to_relocate
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'willing_to_relocate';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN willing_to_relocate BOOLEAN DEFAULT FALSE AFTER country',
  'SELECT ''willing_to_relocate already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- current_job_title
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'current_job_title';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN current_job_title VARCHAR(255) NULL AFTER willing_to_relocate',
  'SELECT ''current_job_title already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- experience
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'experience';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN experience VARCHAR(50) NULL AFTER current_job_title',
  'SELECT ''experience already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- education
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'education';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN education TEXT NULL AFTER experience',
  'SELECT ''education already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- expected_salary
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'expected_salary';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN expected_salary VARCHAR(100) NULL AFTER education',
  'SELECT ''expected_salary already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- availability_date
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'availability_date';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN availability_date DATE NULL AFTER expected_salary',
  'SELECT ''availability_date already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- linkedin_profile
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'linkedin_profile';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN linkedin_profile VARCHAR(500) NULL AFTER availability_date',
  'SELECT ''linkedin_profile already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- github_profile
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'github_profile';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN github_profile VARCHAR(500) NULL AFTER linkedin_profile',
  'SELECT ''github_profile already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- portfolio_website
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'portfolio_website';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN portfolio_website VARCHAR(500) NULL AFTER github_profile',
  'SELECT ''portfolio_website already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- cover_letter (on job_seeker_profile, not job_seeker_apply)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND COLUMN_NAME = 'cover_letter';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE job_seeker_profile ADD COLUMN cover_letter TEXT NULL AFTER portfolio_website',
  'SELECT ''cover_letter already exists in job_seeker_profile'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
-- Expand job_seeker_apply.cover_letter to TEXT
-- ---------------------------------------------------------------
ALTER TABLE job_seeker_apply MODIFY COLUMN cover_letter TEXT;

-- ---------------------------------------------------------------
-- Add first_name / last_name to users table (if not present)
-- ---------------------------------------------------------------
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN first_name VARCHAR(255) NULL AFTER email',
  'SELECT ''first_name already exists in users'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_name';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name',
  'SELECT ''last_name already exists in users'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
-- Add performance indexes (ignore if they already exist)
-- ---------------------------------------------------------------
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND INDEX_NAME = 'idx_job_seeker_profile_city';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_job_seeker_profile_city ON job_seeker_profile(city)',
  'SELECT ''idx_job_seeker_profile_city already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND INDEX_NAME = 'idx_job_seeker_profile_country';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_job_seeker_profile_country ON job_seeker_profile(country)',
  'SELECT ''idx_job_seeker_profile_country already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND INDEX_NAME = 'idx_job_seeker_profile_work_auth';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_job_seeker_profile_work_auth ON job_seeker_profile(work_authorization)',
  'SELECT ''idx_job_seeker_profile_work_auth already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'jobportal' AND TABLE_NAME = 'job_seeker_profile' AND INDEX_NAME = 'idx_job_seeker_profile_employment_type';
SET @sql = IF(@idx_exists = 0,
  'CREATE INDEX idx_job_seeker_profile_employment_type ON job_seeker_profile(employment_type)',
  'SELECT ''idx_job_seeker_profile_employment_type already exists'' AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Show the updated structure  
DESCRIBE job_seeker_profile;