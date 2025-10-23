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

// Mock data generator for development
const generateMockSavedJobs = (page, limit, filters) => {
    const mockJobs = [
        {
            id: 1,
            title: 'Senior React Developer',
            company: 'TechCorp Inc.',
            location: 'San Francisco, CA',
            type: 'Full-time',
            remote: true,
            salary: '$120,000 - $150,000',
            description: 'We are looking for a Senior React Developer to join our dynamic team. You will be responsible for developing and maintaining high-quality React applications.',
            requirements: ['5+ years React experience', 'TypeScript proficiency', 'GraphQL knowledge'],
            skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
            postedDate: '2025-10-05',
            savedAt: '2025-10-06T10:30:00Z',
            companyLogo: null,
            isApplied: false,
            applicationDeadline: '2025-11-05'
        },
        {
            id: 2,
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            location: 'New York, NY',
            type: 'Full-time',
            remote: false,
            salary: '$90,000 - $120,000',
            description: 'Join our growing startup as a Full Stack Engineer. Work on cutting-edge projects and help shape the future of our platform.',
            requirements: ['3+ years full-stack experience', 'React and Node.js', 'Database design'],
            skills: ['React', 'Node.js', 'MongoDB', 'Express'],
            postedDate: '2025-10-04',
            savedAt: '2025-10-05T14:15:00Z',
            companyLogo: null,
            isApplied: true,
            appliedAt: '2025-10-07T09:20:00Z',
            applicationDeadline: '2025-10-30'
        },
        {
            id: 3,
            title: 'Frontend Developer',
            company: 'DesignStudio',
            location: 'Austin, TX',
            type: 'Contract',
            remote: true,
            salary: '$70 - $90 /hour',
            description: 'We need a talented Frontend Developer to work on exciting client projects. Must have strong design sensibilities.',
            requirements: ['Frontend development experience', 'UI/UX understanding', 'Modern CSS'],
            skills: ['Vue.js', 'CSS3', 'Figma', 'SASS'],
            postedDate: '2025-10-03',
            savedAt: '2025-10-04T16:45:00Z',
            companyLogo: null,
            isApplied: false,
            applicationDeadline: '2025-10-25'
        },
        {
            id: 4,
            title: 'DevOps Engineer',
            company: 'CloudTech Solutions',
            location: 'Seattle, WA',
            type: 'Full-time',
            remote: true,
            salary: '$130,000 - $160,000',
            description: 'Looking for an experienced DevOps Engineer to manage our cloud infrastructure and deployment pipelines.',
            requirements: ['AWS experience', 'Docker/Kubernetes', 'CI/CD pipelines'],
            skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
            postedDate: '2025-10-02',
            savedAt: '2025-10-03T11:20:00Z',
            companyLogo: null,
            isApplied: false,
            applicationDeadline: '2025-11-02'
        },
        {
            id: 5,
            title: 'Product Manager',
            company: 'InnovateLab',
            location: 'Boston, MA',
            type: 'Full-time',
            remote: false,
            salary: '$110,000 - $140,000',
            description: 'Drive product strategy and execution for our flagship products. Work closely with engineering and design teams.',
            requirements: ['Product management experience', 'Agile methodologies', 'Data analysis'],
            skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
            postedDate: '2025-10-01',
            savedAt: '2025-10-02T13:30:00Z',
            companyLogo: null,
            isApplied: false,
            applicationDeadline: '2025-10-28'
        }
    ];

    // Apply filters
    let filteredJobs = mockJobs;
    
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm)
        );
    }

    if (filters.type) {
        filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }

    if (filters.remote !== undefined) {
        filteredJobs = filteredJobs.filter(job => job.remote === (filters.remote === 'true'));
    }

    if (filters.applied !== undefined) {
        filteredJobs = filteredJobs.filter(job => job.isApplied === (filters.applied === 'true'));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
        jobs: paginatedJobs,
        totalJobs: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
        currentPage: page,
        hasNext: endIndex < filteredJobs.length,
        hasPrevious: page > 1
    };
};