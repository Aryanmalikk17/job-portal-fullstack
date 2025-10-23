import api from './api';

const JOBS_ENDPOINTS = {
    GET_ALL: '/jobs',
    GET_BY_ID: (id) => `/jobs/${id}`,
    CREATE_JOB: '/jobs',
    SAVE_JOB: (id) => `/jobs/${id}/save`,
    APPLY_JOB: (id) => `/jobs/${id}/apply`,
    UPDATE_JOB: (id) => `/jobs/${id}`,
    DELETE_JOB: (id) => `/jobs/${id}`,
    GET_CANDIDATES: (id) => `/jobs/${id}/candidates`,
    CHECK_STATUS: (id) => `/jobs/${id}/status`,
    GET_RECRUITER_JOBS: '/jobs/recruiter',
    UNSAVE_JOB: (id) => `/jobs/${id}/unsave`,
};

// New Application Endpoints
const APPLICATION_ENDPOINTS = {
    APPLY_FOR_JOB: (jobId) => `/applications/job/${jobId}/apply`,
    GET_MY_APPLICATIONS: '/applications/my-applications',
    WITHDRAW_APPLICATION: (applicationId) => `/applications/${applicationId}/withdraw`,
    GET_APPLICATION_STATUS: (jobId) => `/applications/job/${jobId}/status`,
    GET_APPLICATION: (applicationId) => `/applications/${applicationId}`,
    
    // Recruiter endpoints
    GET_RECRUITER_APPLICATIONS: '/applications/recruiter/applications',
    GET_JOB_APPLICATIONS: (jobId) => `/applications/job/${jobId}/applications`,
    UPDATE_APPLICATION_STATUS: (applicationId) => `/applications/${applicationId}/status`,
    GET_RECRUITER_STATISTICS: '/applications/recruiter/statistics',
    GET_RECENT_APPLICATIONS: '/applications/recruiter/recent',
    
    // Common
    GET_APPLICATION_STATUSES: '/applications/statuses',
};

export const jobService = {
    // ============ EXISTING JOB METHODS ============
    
    // Get all jobs with filters
    getAllJobs: async (filters = {}) => {
        try {
            const response = await api.get(JOBS_ENDPOINTS.GET_ALL, { params: filters });
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return response.data.data; // Extract the actual jobs array
            } else if (response.data && Array.isArray(response.data)) {
                return response.data; // Direct array response
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch jobs' };
        }
    },

    // Create a new job
    createJob: async (jobData) => {
        try {
            const response = await api.post(JOBS_ENDPOINTS.CREATE_JOB, jobData);
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    message: 'Job created successfully',
                    data: response.data.data
                };
            } else if (response.data) {
                return {
                    success: true,
                    message: 'Job created successfully',
                    data: response.data
                };
            }
            
            return {
                success: true,
                message: 'Job created successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error creating job:', error);
            
            // Handle specific error responses
            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: 'Invalid job data. Please check all required fields.',
                    error: 'VALIDATION_ERROR'
                };
            }
            
            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'You must be logged in to create a job.',
                    error: 'UNAUTHORIZED'
                };
            }
            
            if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'Only recruiters can create jobs.',
                    error: 'FORBIDDEN'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Failed to create job',
                error: 'CREATE_FAILED'
            };
        }
    },

    // Get job by ID with user status (applied/saved)
    getJobById: async (id) => {
        try {
            const response = await api.get(JOBS_ENDPOINTS.GET_BY_ID(id));
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return response.data.data; // Extract the actual job object
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch job details' };
        }
    },

    // Check user's status for a job (applied/saved)
    checkJobStatus: async (jobId) => {
        try {
            const response = await api.get(JOBS_ENDPOINTS.CHECK_STATUS(jobId));
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error checking job status:', error);
            return { alreadyApplied: false, alreadySaved: false };
        }
    },

    // Save job
    saveJob: async (jobId) => {
        try {
            const response = await api.post(JOBS_ENDPOINTS.SAVE_JOB(jobId));
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success) {
                return response.data;
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to save job' };
        }
    },

    // Unsave job
    unsaveJob: async (jobId) => {
        try {
            const response = await api.delete(JOBS_ENDPOINTS.UNSAVE_JOB(jobId));
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success) {
                return response.data;
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to unsave job' };
        }
    },

    // Get recruiter's posted jobs
    getRecruiterJobs: async () => {
        try {
            const response = await api.get(JOBS_ENDPOINTS.GET_RECRUITER_JOBS);
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return response.data.data; // Extract the actual jobs array
            } else if (response.data && Array.isArray(response.data)) {
                return response.data; // Direct array response
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching recruiter jobs:', error);
            throw error.response?.data || { message: 'Failed to fetch your posted jobs' };
        }
    },

    // Update job
    updateJob: async (jobId, jobData) => {
        try {
            const response = await api.put(JOBS_ENDPOINTS.UPDATE_JOB(jobId), jobData);
            
            // Handle ApiResponse wrapper structure from backend
            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    message: 'Job updated successfully',
                    data: response.data.data
                };
            } else if (response.data) {
                return {
                    success: true,
                    message: 'Job updated successfully',
                    data: response.data
                };
            }
            
            return {
                success: true,
                message: 'Job updated successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error updating job:', error);
            
            // Handle specific error responses
            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: 'Invalid job data. Please check all required fields.',
                    error: 'VALIDATION_ERROR'
                };
            }
            
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Job not found.',
                    error: 'JOB_NOT_FOUND'
                };
            }
            
            if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'You can only update your own jobs.',
                    error: 'FORBIDDEN'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Failed to update job',
                error: 'UPDATE_FAILED'
            };
        }
    },

    // Delete job
    deleteJob: async (jobId) => {
        try {
            const response = await api.delete(JOBS_ENDPOINTS.DELETE_JOB(jobId));
            
            return {
                success: true,
                message: 'Job deleted successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error deleting job:', error);
            
            // Handle specific error responses
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Job not found.',
                    error: 'JOB_NOT_FOUND'
                };
            }
            
            if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'You can only delete your own jobs.',
                    error: 'FORBIDDEN'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Failed to delete job',
                error: 'DELETE_FAILED'
            };
        }
    },

    // ============ APPLICATION METHODS ============
    
    // FIXED: Apply for job with proper error handling and response format
    applyForJob: async (jobId, applicationData = {}) => {
        try {
            // Use the advanced application endpoint with cover letter support
            const response = await api.post(APPLICATION_ENDPOINTS.APPLY_FOR_JOB(jobId), {
                coverLetter: applicationData.coverLetter || '',
                resumePath: applicationData.resumePath || null
            });
            
            return {
                success: true,
                message: 'Application submitted successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error applying for job:', error);
            
            // Handle specific error responses
            if (error.response?.status === 409) {
                return {
                    success: false,
                    message: 'You have already applied for this job',
                    error: 'ALREADY_APPLIED'
                };
            }
            
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Job not found',
                    error: 'JOB_NOT_FOUND'
                };
            }
            
            if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'You must be logged in as a job seeker to apply',
                    error: 'UNAUTHORIZED'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to apply for job',
                error: 'APPLICATION_FAILED'
            };
        }
    },

    // FIXED: Simple apply method for backward compatibility
    simpleApplyForJob: async (jobId) => {
        try {
            const response = await api.post(JOBS_ENDPOINTS.APPLY_JOB(jobId));
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Application submitted successfully'
                };
            }
            
            return {
                success: true,
                message: 'Application submitted successfully'
            };
        } catch (error) {
            console.error('Error applying for job (simple):', error);
            
            if (error.response?.status === 409) {
                return {
                    success: false,
                    message: 'You have already applied for this job',
                    error: 'ALREADY_APPLIED'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to apply for job',
                error: 'APPLICATION_FAILED'
            };
        }
    },

    // Get user's applications
    getMyApplications: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.GET_MY_APPLICATIONS);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching my applications:', error);
            throw error.response?.data || { message: 'Failed to fetch applications' };
        }
    },

    // Withdraw application
    withdrawApplication: async (applicationId) => {
        try {
            const response = await api.put(APPLICATION_ENDPOINTS.WITHDRAW_APPLICATION(applicationId));
            return {
                success: true,
                message: 'Application withdrawn successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error withdrawing application:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to withdraw application'
            };
        }
    },

    // Check application status for a specific job
    getApplicationStatus: async (jobId) => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.GET_APPLICATION_STATUS(jobId));
            return response.data;
        } catch (error) {
            console.error('Error checking application status:', error);
            return { hasApplied: false };
        }
    },

    // ============ RECRUITER METHODS ============
    
    // Get applications for recruiter
    getRecruiterApplications: async (status = null) => {
        try {
            const params = status ? { status } : {};
            const response = await api.get(APPLICATION_ENDPOINTS.GET_RECRUITER_APPLICATIONS, { params });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching recruiter applications:', error);
            throw error.response?.data || { message: 'Failed to fetch applications' };
        }
    },

    // Get applications for a specific job
    getJobApplications: async (jobId, status = null) => {
        try {
            const params = status ? { status } : {};
            const response = await api.get(APPLICATION_ENDPOINTS.GET_JOB_APPLICATIONS(jobId), { params });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching job applications:', error);
            throw error.response?.data || { message: 'Failed to fetch job applications' };
        }
    },

    // Update application status
    updateApplicationStatus: async (applicationId, status, recruiterNotes = '') => {
        try {
            const response = await api.put(APPLICATION_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId), {
                status,
                recruiterNotes
            });
            return {
                success: true,
                message: 'Application status updated successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error updating application status:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to update application status'
            };
        }
    },

    // Get recruiter statistics
    getRecruiterStatistics: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.GET_RECRUITER_STATISTICS);
            return response.data;
        } catch (error) {
            console.error('Error fetching recruiter statistics:', error);
            throw error.response?.data || { message: 'Failed to fetch statistics' };
        }
    },

    // Get recent applications
    getRecentApplications: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.GET_RECENT_APPLICATIONS);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            throw error.response?.data || { message: 'Failed to fetch recent applications' };
        }
    },

    // Get application statuses
    getApplicationStatuses: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.GET_APPLICATION_STATUSES);
            return response.data;
        } catch (error) {
            console.error('Error fetching application statuses:', error);
            return {};
        }
    },

    // Helper method to format application status
    formatApplicationStatus: (status) => {
        const statusMap = {
            'APPLIED': 'Applied',
            'UNDER_REVIEW': 'Under Review',
            'INTERVIEW_SCHEDULED': 'Interview Scheduled',
            'INTERVIEWED': 'Interviewed',
            'OFFERED': 'Offered',
            'HIRED': 'Hired',
            'REJECTED': 'Rejected',
            'WITHDRAWN': 'Withdrawn'
        };
        return statusMap[status] || status;
    },

    // Helper method to get status color class
    getStatusColor: (status) => {
        const colorMap = {
            'APPLIED': 'primary',
            'UNDER_REVIEW': 'info',
            'INTERVIEW_SCHEDULED': 'warning',
            'INTERVIEWED': 'warning',
            'OFFERED': 'success',
            'HIRED': 'success',
            'REJECTED': 'danger',
            'WITHDRAWN': 'secondary'
        };
        return colorMap[status] || 'secondary';
    },

    // ============ ENHANCED STATUS MANAGEMENT ============
    
    // Get comprehensive job status for a user (applied + saved status)
    getJobStatusForUser: async (jobId) => {
        try {
            // Check both application status and saved status
            const [applicationStatus, jobDetails] = await Promise.all([
                jobService.getApplicationStatus(jobId),
                jobService.checkJobStatus(jobId)
            ]);
            
            return {
                hasApplied: applicationStatus.hasApplied || false,
                isSaved: jobDetails.alreadySaved || false,
                applicationId: applicationStatus.applicationId || null,
                applicationStatus: applicationStatus.status || null
            };
        } catch (error) {
            console.error('Error getting job status:', error);
            return { hasApplied: false, isSaved: false, applicationId: null, applicationStatus: null };
        }
    },

    // Get job statuses for multiple jobs (bulk operation)
    getJobStatusesForUser: async (jobIds) => {
        try {
            const statusPromises = jobIds.map(jobId => jobService.getJobStatusForUser(jobId));
            const statuses = await Promise.all(statusPromises);
            
            // Create a map of jobId -> status
            const statusMap = {};
            jobIds.forEach((jobId, index) => {
                statusMap[jobId] = statuses[index];
            });
            
            return statusMap;
        } catch (error) {
            console.error('Error getting bulk job statuses:', error);
            return {};
        }
    },

    // Enhanced get all jobs with user status
    getAllJobsWithStatus: async (filters = {}) => {
        try {
            const jobs = await jobService.getAllJobs(filters);
            
            // Get status for all jobs
            const jobIds = jobs.map(job => job.jobPostId);
            const statusMap = await jobService.getJobStatusesForUser(jobIds);
            
            // Merge status with job data
            const jobsWithStatus = jobs.map(job => ({
                ...job,
                hasApplied: statusMap[job.jobPostId]?.hasApplied || false,
                isSaved: statusMap[job.jobPostId]?.isSaved || false,
                applicationId: statusMap[job.jobPostId]?.applicationId || null,
                applicationStatus: statusMap[job.jobPostId]?.applicationStatus || null
            }));
            
            return jobsWithStatus;
        } catch (error) {
            console.error('Error getting jobs with status:', error);
            throw error;
        }
    },
};