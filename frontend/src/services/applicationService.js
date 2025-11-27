import api from './api';

const APPLICATION_ENDPOINTS = {
    APPLY: '/applications/job',
    MY_APPLICATIONS: '/applications/my-applications',
    RECRUITER_APPLICATIONS: '/applications/recruiter/applications',
    JOB_APPLICATIONS: '/applications/job',
    UPDATE_STATUS: '/applications',
    APPLICATION_STATUSES: '/applications/statuses',
    RECRUITER_STATS: '/applications/recruiter/statistics',
    RECENT_APPLICATIONS: '/applications/recruiter/recent'
};

export const applicationService = {
    // Job Seeker Methods
    applyForJob: async (jobId, applicationData) => {
        try {
            const response = await api.post(`${APPLICATION_ENDPOINTS.APPLY}/${jobId}/apply`, applicationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to apply for job' };
        }
    },

    getMyApplications: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.MY_APPLICATIONS);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get applications' };
        }
    },

    withdrawApplication: async (applicationId) => {
        try {
            const response = await api.put(`${APPLICATION_ENDPOINTS.UPDATE_STATUS}/${applicationId}/withdraw`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to withdraw application' };
        }
    },

    checkApplicationStatus: async (jobId) => {
        try {
            const response = await api.get(`${APPLICATION_ENDPOINTS.APPLY}/${jobId}/status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to check application status' };
        }
    },

    // Recruiter Methods
    getRecruiterApplications: async (status = null) => {
        try {
            const params = status ? { status } : {};
            const response = await api.get(APPLICATION_ENDPOINTS.RECRUITER_APPLICATIONS, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get recruiter applications' };
        }
    },

    getJobApplications: async (jobId, status = null) => {
        try {
            const params = status ? { status } : {};
            const response = await api.get(`${APPLICATION_ENDPOINTS.JOB_APPLICATIONS}/${jobId}/applications`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get job applications' };
        }
    },

    updateApplicationStatus: async (applicationId, statusData) => {
        try {
            console.log('Updating application status:', { applicationId, statusData });
            const response = await api.put(`${APPLICATION_ENDPOINTS.UPDATE_STATUS}/${applicationId}/status`, statusData);
            console.log('Status update successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Status update failed:', error.response?.data || error);
            throw error.response?.data || { error: 'Failed to update application status' };
        }
    },

    getRecruiterStatistics: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.RECRUITER_STATS);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get statistics' };
        }
    },

    getRecentApplications: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.RECENT_APPLICATIONS);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get recent applications' };
        }
    },

    // Common Methods
    getApplication: async (applicationId) => {
        try {
            const response = await api.get(`${APPLICATION_ENDPOINTS.UPDATE_STATUS}/${applicationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get application' };
        }
    },

    getApplicationStatuses: async () => {
        try {
            const response = await api.get(APPLICATION_ENDPOINTS.APPLICATION_STATUSES);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to get application statuses' };
        }
    },

    // Real-time update simulation (polling)
    startStatusPolling: (callback, interval = 30000) => {
        return setInterval(async () => {
            try {
                const applications = await applicationService.getMyApplications();
                callback(applications);
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, interval);
    },

    stopStatusPolling: (pollId) => {
        clearInterval(pollId);
    },

    // Utility methods for status management
    getStatusColor: (status) => {
        const statusColors = {
            'APPLIED': '#007bff',           // Blue
            'UNDER_REVIEW': '#ffc107',      // Yellow
            'INTERVIEW_SCHEDULED': '#17a2b8', // Teal
            'INTERVIEWED': '#6f42c1',       // Purple
            'OFFERED': '#28a745',           // Green
            'HIRED': '#28a745',             // Green
            'REJECTED': '#dc3545',          // Red
            'WITHDRAWN': '#6c757d'          // Gray
        };
        return statusColors[status] || '#6c757d';
    },

    getStatusIcon: (status) => {
        const statusIcons = {
            'APPLIED': 'fa-paper-plane',
            'UNDER_REVIEW': 'fa-eye',
            'INTERVIEW_SCHEDULED': 'fa-calendar',
            'INTERVIEWED': 'fa-comments',
            'OFFERED': 'fa-handshake',
            'HIRED': 'fa-check-circle',
            'REJECTED': 'fa-times-circle',
            'WITHDRAWN': 'fa-minus-circle'
        };
        return statusIcons[status] || 'fa-question-circle';
    },

    isStatusEditable: (status) => {
        // Statuses that can be changed by recruiters
        return !['WITHDRAWN'].includes(status);
    },

    getNextPossibleStatuses: (currentStatus) => {
        const transitions = {
            'APPLIED': ['UNDER_REVIEW', 'REJECTED'],
            'UNDER_REVIEW': ['INTERVIEW_SCHEDULED', 'REJECTED'],
            'INTERVIEW_SCHEDULED': ['INTERVIEWED', 'REJECTED'],
            'INTERVIEWED': ['OFFERED', 'REJECTED'],
            'OFFERED': ['HIRED', 'REJECTED'],
            'HIRED': [], // Terminal state
            'REJECTED': [], // Terminal state
            'WITHDRAWN': [] // Terminal state
        };
        return transitions[currentStatus] || [];
    }
};

export default applicationService;