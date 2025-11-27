-- Migration to add missing profile fields to job_seeker_profile table
-- Run this script to add fields that the frontend form expects

USE jobportal;

-- Add missing fields to job_seeker_profile table
ALTER TABLE job_seeker_profile 
ADD COLUMN phone VARCHAR(20) NULL AFTER last_name,
ADD COLUMN date_of_birth DATE NULL AFTER phone,
ADD COLUMN gender VARCHAR(20) NULL AFTER date_of_birth,
ADD COLUMN willing_to_relocate BOOLEAN DEFAULT FALSE AFTER country,
ADD COLUMN current_job_title VARCHAR(255) NULL AFTER willing_to_relocate,
ADD COLUMN experience VARCHAR(50) NULL AFTER current_job_title,
ADD COLUMN education TEXT NULL AFTER experience,
ADD COLUMN expected_salary VARCHAR(100) NULL AFTER education,
ADD COLUMN availability_date DATE NULL AFTER expected_salary,
ADD COLUMN linkedin_profile VARCHAR(500) NULL AFTER availability_date,
ADD COLUMN github_profile VARCHAR(500) NULL AFTER linkedin_profile,
ADD COLUMN portfolio_website VARCHAR(500) NULL AFTER github_profile,
ADD COLUMN cover_letter TEXT NULL AFTER portfolio_website;

-- Update cover_letter column in job_seeker_apply to be TEXT instead of VARCHAR(255)
ALTER TABLE job_seeker_apply MODIFY COLUMN cover_letter TEXT;

-- Add indexes for better performance
CREATE INDEX idx_job_seeker_profile_city ON job_seeker_profile(city);
CREATE INDEX idx_job_seeker_profile_country ON job_seeker_profile(country);
CREATE INDEX idx_job_seeker_profile_work_auth ON job_seeker_profile(work_authorization);
CREATE INDEX idx_job_seeker_profile_employment_type ON job_seeker_profile(employment_type);

-- Add similar fields to users table if needed for basic info
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(255) NULL AFTER email,
ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name;

-- Show the updated structure
DESCRIBE job_seeker_profile;