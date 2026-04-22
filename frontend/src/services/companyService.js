import api from './api';

const COMPANY_ENDPOINTS = {
    // Public company profile endpoints (recruiter profile-based)
    DETAILS: (id) => `/api/companies/${id}`,
    JOBS: (id) => `/api/companies/${id}/jobs`,
    // Job-data company endpoints (JobCompany entity for job posting)
    CREATE_OR_GET: '/api/job-data/companies',
    SEARCH: '/api/job-data/companies/search',
    GET_ALL: '/api/job-data/companies',
};

export const companyService = {
    /**
     * Create or retrieve a JobCompany record by name.
     * Called during job posting to resolve a company name → integer ID
     * before sending the job creation request.
     *
     * Backend: POST /api/job-data/companies
     * Returns ApiResponse<JobCompany> { success, message, data: { id, name, website, logo } }
     */
    createOrGetCompany: async ({ name, website = null, logo = null }) => {
        try {
            const response = await api.post(COMPANY_ENDPOINTS.CREATE_OR_GET, {
                name: name.trim(),
                website: website || null,
                logo: logo || null,
            });
            // response.data is the ApiResponse wrapper: { success, message, data: JobCompany }
            // Return the full wrapper so callers can do: result.data.id
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to create/get company';
            throw new Error(msg);
        }
    },

    /**
     * Search for companies by name (autocomplete/suggestions).
     * Backend: GET /api/job-data/companies/search?name=...
     */
    searchCompanies: async (name) => {
        try {
            const response = await api.get(COMPANY_ENDPOINTS.SEARCH, { params: { name } });
            return response.data?.data || [];
        } catch (error) {
            throw error.response?.data || { message: 'Failed to search companies' };
        }
    },

    /**
     * Get all available job companies (for dropdowns).
     * Backend: GET /api/job-data/companies
     */
    getAllCompanies: async () => {
        try {
            const response = await api.get(COMPANY_ENDPOINTS.GET_ALL);
            return response.data?.data || [];
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch companies' };
        }
    },

    /**
     * Get public company profile details (recruiter-profile based).
     * Backend: GET /api/companies/:id
     */
    getCompanyDetails: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.DETAILS(id));
        return response.data.data;
    },

    /**
     * Get active jobs posted by a company.
     * Backend: GET /api/companies/:id/jobs
     */
    getCompanyJobs: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.JOBS(id));
        return response.data.data;
    },
};
