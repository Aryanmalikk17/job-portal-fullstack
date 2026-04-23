import api from './api';

const COMPANY_ENDPOINTS = {
    // Public company profile endpoints (recruiter-profile based, for company detail pages)
    DETAILS: (id) => `/companies/${id}`,
    JOBS: (id) => `/companies/${id}/jobs`,
    // Job-data company endpoints (JobCompany entity, for job posting FK resolution)
    CREATE_OR_GET: '/job-data/companies',
    SEARCH: '/job-data/companies/search',
    GET_ALL: '/job-data/companies',
};

export const companyService = {
    /**
     * Create or retrieve a JobCompany record by name.
     * Called during job posting to resolve a company name → integer ID
     * before sending the job creation request.
     *
     * Backend: POST /api/job-data/companies
     * Returns ApiResponse<JobCompany> { success, message, data: { id, name, website, logo } }
     *
     * Errors: throws the original response data (not a bare Error) so the
     * HTTP status code (401, 403, 500 …) is preserved for callers.
     */
    createOrGetCompany: async ({ name, website = null, logo = null } = {}) => {
        // Guard: name must be a non-empty string
        if (typeof name !== 'string' || !name.trim()) {
            throw { message: 'Company name is required and must be a non-empty string.' };
        }
        try {
            const response = await api.post(COMPANY_ENDPOINTS.CREATE_OR_GET, {
                name: name.trim(),
                website: website || null,
                logo: logo || null,
            });
            // Return the full ApiResponse wrapper so callers can do: result.data.id
            return response.data;
        } catch (error) {
            // Preserve original response data (with HTTP status) instead of wrapping in
            // a plain Error — callers can inspect error.status, error.message, etc.
            throw error.response?.data || { message: 'Failed to create/get company' };
        }
    },

    /**
     * Search for companies by name (autocomplete / suggestions).
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
     * Get all available job companies (for dropdowns / autocomplete seed data).
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
     * Get public company profile details (recruiter-profile based company page).
     * Backend: GET /api/companies/:id
     */
    getCompanyDetails: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.DETAILS(id));
        return response.data.data;
    },

    /**
     * Get active jobs posted by a specific company.
     * Backend: GET /api/companies/:id/jobs
     */
    getCompanyJobs: async (id) => {
        const response = await api.get(COMPANY_ENDPOINTS.JOBS(id));
        return response.data.data;
    },
};
