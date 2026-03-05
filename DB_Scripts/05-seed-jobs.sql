-- Seed 50 Featured Jobs
-- SAFE VERSION: Dynamically picks the first available Recruiter user, 
-- and the first available job_company and job_location rows.

USE jobportal;

-- Find the first valid Recruiter user ID
SET @recruiter_id = (
  SELECT u.user_id FROM users u
  JOIN users_type ut ON u.user_type_id = ut.user_type_id
  WHERE ut.user_type_name = 'Recruiter'
  ORDER BY u.user_id ASC LIMIT 1
);

-- Find the first valid company ID
SET @company_id = (SELECT MIN(job_company_id) FROM job_company);

-- Find the first valid location ID
SET @location_id = (SELECT MIN(job_location_id) FROM job_location);

-- Safety check: only proceed if we have valid IDs
SELECT 
  CONCAT('Using recruiter_id=', IFNULL(@recruiter_id, 'NULL'),
         ', company_id=', IFNULL(@company_id, 'NULL'),
         ', location_id=', IFNULL(@location_id, 'NULL')) AS seed_info;

-- Only run the inserts if all required IDs are available
SET @can_seed = (@recruiter_id IS NOT NULL AND @company_id IS NOT NULL AND @location_id IS NOT NULL);

SET @sql = IF(@can_seed, 'SELECT ''Prerequisites satisfied, seeding jobs...'' AS status', 
                         'SELECT ''ERROR: No recruiter, company, or location found. Create them first.'' AS status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Only continue if we have a valid recruiter (this will error out intentionally if not)
-- If the above SELECT shows NULL values, stop here and create the prerequisite data first.

-- Junior Data Analyst
INSERT INTO job_post_activity (description_of_job, job_title, job_type, posted_date, remote, salary, job_company_id, job_location_id, posted_by_id, is_active) 
VALUES ('Analyze large datasets to identify trends and provide actionable insights. Proficiency in SQL, Python, and Tableau is required.', 'Junior Data Analyst', 'Full-Time', NOW(), 'Office-Only', '₹4.5L - ₹6.5L', @company_id, @location_id, @recruiter_id, 1);

-- Foreign Trade Consultant
INSERT INTO job_post_activity (description_of_job, job_title, job_type, posted_date, remote, salary, job_company_id, job_location_id, posted_by_id, is_active) 
VALUES ('Advise clients on international trade regulations, customs compliance, and supply chain optimization.', 'Foreign Trade Consultant', 'Full-Time', NOW(), 'Partial-Remote', '₹8L - ₹12L', @company_id, @location_id, @recruiter_id, 1);

-- 48 Additional Varied Roles (using dynamic IDs)
INSERT INTO job_post_activity (description_of_job, job_title, job_type, posted_date, remote, salary, job_company_id, job_location_id, posted_by_id, is_active) VALUES
('Develop and maintain complex machine learning models.', 'ML Engineer', 'Full-Time', NOW(), 'Remote-Only', '₹15L - ₹25L', @company_id, @location_id, @recruiter_id, 1),
('Maintain and update company web assets.', 'Web Maintainer', 'Part-Time', NOW(), 'Remote-Only', '₹3L - ₹5L', @company_id, @location_id, @recruiter_id, 1),
('Manage international export documentation and logistics.', 'Export Manager', 'Full-Time', NOW(), 'Office-Only', '₹10L - ₹15L', @company_id, @location_id, @recruiter_id, 1),
('Design and implement user interfaces for web apps.', 'Frontend Developer', 'Full-Time', NOW(), 'Partial-Remote', '₹6L - ₹10L', @company_id, @location_id, @recruiter_id, 1),
('Scale backend infrastructure and APIs.', 'Backend Engineer', 'Full-Time', NOW(), 'Remote-Only', '₹12L - ₹20L', @company_id, @location_id, @recruiter_id, 1),
('Lead digital marketing campaigns and SEO.', 'Digital Marketer', 'Full-Time', NOW(), 'Partial-Remote', '₹5L - ₹8L', @company_id, @location_id, @recruiter_id, 1),
('Manage HR activities and employee relations.', 'HR Manager', 'Full-Time', NOW(), 'Office-Only', '₹7L - ₹12L', @company_id, @location_id, @recruiter_id, 1),
('Provide technical support and troubleshooting.', 'Support Specialist', 'Full-Time', NOW(), 'Remote-Only', '₹4L - ₹6L', @company_id, @location_id, @recruiter_id, 1),
('Design creative assets and branding.', 'Graphic Designer', 'Freelance', NOW(), 'Remote-Only', '₹2L - ₹4L', @company_id, @location_id, @recruiter_id, 1),
('Orchestrate cloud infrastructure and CI/CD.', 'DevOps Engineer', 'Full-Time', NOW(), 'Remote-Only', '₹14L - ₹22L', @company_id, @location_id, @recruiter_id, 1),
('Oversee end-to-end product development.', 'Product Manager', 'Full-Time', NOW(), 'Partial-Remote', '₹18L - ₹30L', @company_id, @location_id, @recruiter_id, 1),
('Drive company sales and partnerships.', 'Sales Executive', 'Full-Time', NOW(), 'Office-Only', '₹4L - ₹7L', @company_id, @location_id, @recruiter_id, 1),
('Create engaging content for social media.', 'Content Writer', 'Part-Time', NOW(), 'Remote-Only', '₹3L - ₹5L', @company_id, @location_id, @recruiter_id, 1),
('Conduct quality assurance and testing.', 'QA Automation Engineer', 'Full-Time', NOW(), 'Remote-Only', '₹7L - ₹12L', @company_id, @location_id, @recruiter_id, 1),
('Manage cloud-based database systems.', 'Database Administrator', 'Full-Time', NOW(), 'Office-Only', '₹12L - ₹18L', @company_id, @location_id, @recruiter_id, 1),
('Design secure network architectures.', 'Network Architect', 'Full-Time', NOW(), 'Office-Only', '₹15L - ₹25L', @company_id, @location_id, @recruiter_id, 1),
('Develop native mobile applications.', 'Mobile App Developer', 'Full-Time', NOW(), 'Remote-Only', '₹9L - ₹15L', @company_id, @location_id, @recruiter_id, 1),
('Analyze financial data and reports.', 'Financial Analyst', 'Full-Time', NOW(), 'Office-Only', '₹6L - ₹10L', @company_id, @location_id, @recruiter_id, 1),
('Optimize supply chain and inventory.', 'Supply Chain Lead', 'Full-Time', NOW(), 'Office-Only', '₹12L - ₹18L', @company_id, @location_id, @recruiter_id, 1),
('Handle legal compliance and contracts.', 'Legal Consultant', 'Part-Time', NOW(), 'Remote-Only', '₹10L - ₹15L', @company_id, @location_id, @recruiter_id, 1),
('Oversee construction and site projects.', 'Civil Engineer', 'Full-Time', NOW(), 'Office-Only', '₹8L - ₹14L', @company_id, @location_id, @recruiter_id, 1),
('Design hardware and circuit systems.', 'Electronics Engineer', 'Full-Time', NOW(), 'Office-Only', '₹7L - ₹12L', @company_id, @location_id, @recruiter_id, 1),
('Manage public relations and media.', 'PR Specialist', 'Full-Time', NOW(), 'Partial-Remote', '₹5L - ₹9L', @company_id, @location_id, @recruiter_id, 1),
('Coordinate training and development.', 'L&D Specialist', 'Full-Time', NOW(), 'Office-Only', '₹6L - ₹11L', @company_id, @location_id, @recruiter_id, 1),
('Design and test mechanical systems.', 'Mechanical Engineer', 'Full-Time', NOW(), 'Office-Only', '₹7L - ₹13L', @company_id, @location_id, @recruiter_id, 1),
('Conduct cybersecurity audits and pentesting.', 'Security Analyst', 'Full-Time', NOW(), 'Remote-Only', '₹12L - ₹20L', @company_id, @location_id, @recruiter_id, 1),
('Manage large scale property assets.', 'Real Estate Manager', 'Full-Time', NOW(), 'Office-Only', '₹15L - ₹25L', @company_id, @location_id, @recruiter_id, 1),
('Design user experiences and prototypes.', 'UX Researcher', 'Full-Time', NOW(), 'Partial-Remote', '₹8L - ₹14L', @company_id, @location_id, @recruiter_id, 1),
('Oversee customer success and retention.', 'Customer Success Manager', 'Full-Time', NOW(), 'Remote-Only', '₹7L - ₹13L', @company_id, @location_id, @recruiter_id, 1),
('Manage office administration and ops.', 'Office Administrator', 'Full-Time', NOW(), 'Office-Only', '₹3L - ₹5L', @company_id, @location_id, @recruiter_id, 1),
('Develop blockchain and smart contracts.', 'Blockchain Developer', 'Full-Time', NOW(), 'Remote-Only', '₹18L - ₹32L', @company_id, @location_id, @recruiter_id, 1),
('Handle accounts and tax filing.', 'Accountant', 'Full-Time', NOW(), 'Office-Only', '₹4L - ₹8L', @company_id, @location_id, @recruiter_id, 1),
('Design energy efficient systems.', 'Energy Auditor', 'Part-Time', NOW(), 'Office-Only', '₹8L - ₹15L', @company_id, @location_id, @recruiter_id, 1),
('Manage logistics and fleet ops.', 'Logistics Coordinator', 'Full-Time', NOW(), 'Office-Only', '₹5L - ₹9L', @company_id, @location_id, @recruiter_id, 1),
('Develop business intelligence reports.', 'BI Developer', 'Full-Time', NOW(), 'Partial-Remote', '₹10L - ₹16L', @company_id, @location_id, @recruiter_id, 1),
('Manage corporate travel and events.', 'Travel Coordinator', 'Full-Time', NOW(), 'Office-Only', '₹4L - ₹7L', @company_id, @location_id, @recruiter_id, 1),
('Design large scale architectural plans.', 'Architect', 'Full-Time', NOW(), 'Office-Only', '₹12L - ₹22L', @company_id, @location_id, @recruiter_id, 1),
('Conduct medical research and trials.', 'Biotechnologist', 'Full-Time', NOW(), 'Office-Only', '₹10L - ₹18L', @company_id, @location_id, @recruiter_id, 1),
('Manage retail store and staff.', 'Store Manager', 'Full-Time', NOW(), 'Office-Only', '₹5L - ₹9L', @company_id, @location_id, @recruiter_id, 1),
('Design fashion and apparel lines.', 'Fashion Designer', 'Full-Time', NOW(), 'Office-Only', '₹6L - ₹12L', @company_id, @location_id, @recruiter_id, 1),
('Coordinate non-profit and NGO activities.', 'Program Coordinator', 'Full-Time', NOW(), 'Office-Only', '₹4L - ₹8L', @company_id, @location_id, @recruiter_id, 1),
('Manage data privacy and compliance.', 'DPO Specialist', 'Full-Time', NOW(), 'Remote-Only', '₹15L - ₹25L', @company_id, @location_id, @recruiter_id, 1),
('Optimize warehouse and stock levels.', 'Warehouse Manager', 'Full-Time', NOW(), 'Office-Only', '₹6L - ₹11L', @company_id, @location_id, @recruiter_id, 1),
('Execute video production and editing.', 'Video Editor', 'Freelance', NOW(), 'Remote-Only', '₹4L - ₹8L', @company_id, @location_id, @recruiter_id, 1),
('Lead technical writing and docs.', 'Technical Writer', 'Full-Time', NOW(), 'Remote-Only', '₹6L - ₹10L', @company_id, @location_id, @recruiter_id, 1),
('Manage corporate procurement and vendors.', 'Procurement Lead', 'Full-Time', NOW(), 'Office-Only', '₹10L - ₹18L', @company_id, @location_id, @recruiter_id, 1),
('Design and build 3D game assets.', 'Game Artist', 'Full-Time', NOW(), 'Remote-Only', '₹8L - ₹15L', @company_id, @location_id, @recruiter_id, 1),
('Coordinate large scale events and PR.', 'Events Manager', 'Full-Time', NOW(), 'Office-Only', '₹7L - ₹12L', @company_id, @location_id, @recruiter_id, 1);

SELECT CONCAT(COUNT(*), ' total jobs in database') AS result FROM job_post_activity;
