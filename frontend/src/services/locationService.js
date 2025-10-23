import api from './api';

const LOCATION_ENDPOINTS = {
    GET_ALL: '/locations',
    CREATE_OR_GET: '/locations',
    SEARCH: '/locations/search',
};

export const locationService = {
    // Get all locations
    getAllLocations: async () => {
        try {
            const response = await api.get(LOCATION_ENDPOINTS.GET_ALL);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch locations' };
        }
    },

    // Create or get existing location
    createOrGetLocation: async (locationData) => {
        try {
            const response = await api.post(LOCATION_ENDPOINTS.CREATE_OR_GET, {
                city: locationData.city,
                state: locationData.state,
                country: locationData.country
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create/get location' };
        }
    },

    // Search locations for autocomplete
    searchLocations: async (searchParams) => {
        try {
            const response = await api.get(LOCATION_ENDPOINTS.SEARCH, { params: searchParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to search locations' };
        }
    },

    // Helper function to format location for display
    formatLocation: (location) => {
        if (!location) return '';
        return `${location.city}, ${location.state}, ${location.country}`;
    }
};