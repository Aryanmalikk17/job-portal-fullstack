import api from './api';

const COMPANY_ENDPOINTS = {
    GET_ALL: '/companies',
    CREATE_OR_GET: '/companies',
    SEARCH: '/companies/search',
};

export const companyService = {
    // Get all companies
    getAllCompanies: async () => {
        try {
            const response = await api.get(COMPANY_ENDPOINTS.GET_ALL);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch companies' };
        }
    },

    // Create or get existing company
    createOrGetCompany: async (companyData) => {
        try {
            const response = await api.post(COMPANY_ENDPOINTS.CREATE_OR_GET, {
                name: companyData.name,
                website: companyData.website || null,
                logo: companyData.logo || null
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create/get company' };
        }
    },

    // Search companies for autocomplete
    searchCompanies: async (name) => {
        try {
            const response = await api.get(COMPANY_ENDPOINTS.SEARCH, { 
                params: { name } 
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to search companies' };
        }
    }
};