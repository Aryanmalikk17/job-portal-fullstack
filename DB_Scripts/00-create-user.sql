-- Drop users first if they exist
DROP USER IF EXISTS 'jobportal'@'%';
DROP USER IF EXISTS 'jobportal'@'localhost';

-- Create user that can connect from any host (Docker containers)
CREATE USER 'jobportal'@'%' IDENTIFIED BY 'jobportal123';

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON jobportal.* TO 'jobportal'@'%';

-- Create localhost user as well for local access
CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal123';
GRANT ALL PRIVILEGES ON jobportal.* TO 'jobportal'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;