import api from './api';

const COMPANY_ENDPOINTS = {
    DETAILS: (id) => `/api/companies/${id}`,
    JOBS: (id) => `/api/companies/${id}/jobs`,
};

export const companyService = {
    /**
     * Get public company details
     */
    getCompanyDetails: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.DETAILS(id));
        return response.data.data;
    },

    /**
     * Get jobs for a specific company
     */
    getCompanyJobs: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.JOBS(id));
        return response.data.data;
    }
};