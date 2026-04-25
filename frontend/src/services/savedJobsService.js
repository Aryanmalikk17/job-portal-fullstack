import api from './api';

const SAVED_JOBS_ENDPOINTS = {
    GET_SAVED_JOBS: '/saved-jobs',
    REMOVE_SAVED_JOB: (jobId) => `/saved-jobs/${jobId}`,
    GET_SAVED_COUNT: '/saved-jobs/count',
    // Job actions use jobs endpoints (matches backend)
    SAVE_JOB: (jobId) => `/jobs/${jobId}/save`,
    UNSAVE_JOB: (jobId) => `/jobs/${jobId}/unsave`,
    APPLY_TO_JOB: (jobId) => `/jobs/${jobId}/apply`,
};

export const savedJobsService = {
    // Get all saved jobs for the current user
    getSavedJobs: async (page = 1, limit = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined))
            });

            const response = await api.get(`${SAVED_JOBS_ENDPOINTS.GET_SAVED_JOBS}?${params}`);
            
            // Handle the response structure: response.data contains the jobs array
            const jobsData = response.data?.data || [];
            
            // Since our backend returns the jobs array directly, we need to format it for frontend expectations
            return {
                jobs: jobsData,
                totalJobs: jobsData.length,
                totalPages: Math.ceil(jobsData.length / limit),
                currentPage: page,
                hasNext: page * limit < jobsData.length,
                hasPrevious: page > 1
            };
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            // Return empty structure to prevent undefined errors
            return {
                jobs: [],
                totalJobs: 0,
                totalPages: 0,
                currentPage: 1,
                hasNext: false,
                hasPrevious: false
            };
        }
    },

    // Get saved jobs count
    getSavedJobsCount: async () => {
        try {
            const response = await api.get(SAVED_JOBS_ENDPOINTS.GET_SAVED_COUNT);
            return response.data?.data || 0;
        } catch (error) {
            console.error('Error fetching saved jobs count:', error);
            return 0;
        }
    },

    // Save a job
    saveJob: async (jobId) => {
        try {
            const response = await api.post(SAVED_JOBS_ENDPOINTS.SAVE_JOB(jobId));
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to save job' };
        }
    },

    // Unsave a job  
    unsaveJob: async (jobId) => {
        try {
            const response = await api.delete(SAVED_JOBS_ENDPOINTS.UNSAVE_JOB(jobId));
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to unsave job' };
        }
    },

    // Apply to a job from saved jobs
    applyToJob: async (jobId) => {
        try {
            const response = await api.post(SAVED_JOBS_ENDPOINTS.APPLY_TO_JOB(jobId));
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to apply to job' };
        }
    },

    // Check if a job is saved (uses job service status endpoint)
    checkSavedStatus: async (jobId) => {
        try {
            const response = await api.get(`/jobs/${jobId}/status`);
            return {
                isSaved: response.data.data?.alreadySaved || false,
                jobId: jobId
            };
        } catch (error) {
            return {
                isSaved: false,
                jobId: jobId
            };
        }
    },

    // Bulk actions (remove multiple jobs)
    bulkActions: async (jobIds, action) => {
        try {
            if (action === 'remove') {
                // Process individual unsave operations
                const results = await Promise.allSettled(
                    jobIds.map(jobId => savedJobsService.unsaveJob(jobId))
                );
                
                const successful = results.filter(r => r.status === 'fulfilled').length;
                
                return {
                    success: true,
                    message: `Removed ${successful} out of ${jobIds.length} jobs`,
                    processedIds: jobIds.slice(0, successful)
                };
            } else if (action === 'apply') {
                // Process individual apply operations
                const results = await Promise.allSettled(
                    jobIds.map(jobId => savedJobsService.applyToJob(jobId))
                );
                
                const successful = results.filter(r => r.status === 'fulfilled').length;
                
                return {
                    success: true,
                    message: `Applied to ${successful} out of ${jobIds.length} jobs`,
                    processedIds: jobIds.slice(0, successful)
                };
            }
            
            return Promise.resolve();
        } catch (error) {
            throw error.response?.data || { message: `Failed to perform bulk ${action}` };
        }
    },

    // Clear all saved jobs (process all saved jobs for removal)
    clearAllSavedJobs: async () => {
        try {
            // Get all saved jobs first
            const savedJobsResponse = await savedJobsService.getSavedJobs(1, 1000);
            const savedJobs = savedJobsResponse.jobs || [];
            
            if (savedJobs.length === 0) {
                return {
                    success: true,
                    message: 'No saved jobs to clear'
                };
            }
            
            // Remove all saved jobs
            const jobIds = savedJobs.map(job => job.jobPostId || job.id);
            return await savedJobsService.bulkActions(jobIds, 'remove');
            
        } catch (error) {
            throw error.response?.data || { message: 'Failed to clear all saved jobs' };
        }
    }
};