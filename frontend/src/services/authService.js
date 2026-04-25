import api from './api';

const AUTH_ENDPOINTS = {
    LOGIN: 'auth/login',
    LOGOUT: 'auth/logout',
    REGISTER: 'auth/register', // FIXED: Changed from '/register/new' to '/auth/register'
    VERIFY: 'auth/verify',     // FIXED: Matches backend GET and POST /api/auth/verify
    USER: 'auth/user',         // FIXED: Matches backend GET /api/auth/user
};

// Register new user
export const register = async (userData) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
        
        // Handle successful registration - store token if provided
        if (response.data.token) {
            localStorage.setItem(
                process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token', 
                response.data.token
            );
            localStorage.setItem(
                process.env.REACT_APP_USER_STORAGE_KEY || 'user-info', 
                JSON.stringify({
                    userId: response.data.userId,
                    email: response.data.email,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    userType: response.data.userType,
                })
            );
        }
        
        return response.data;
    } catch (error) {
        // Handle different error formats
        if (error.response?.data) {
            throw error.response.data;
        }
        throw { message: 'Registration failed. Please try again.' };
    }
};

// Login user
export const login = async (credentials) => {
    try {
        console.log('AuthService: Attempting login for:', credentials.email);
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
        
        if (response.data.token) {
            // Store token and user info
            localStorage.setItem(
                process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token', 
                response.data.token
            );
            localStorage.setItem(
                process.env.REACT_APP_USER_STORAGE_KEY || 'user-info', 
                JSON.stringify({
                    userId: response.data.userId,
                    email: response.data.email,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    userType: response.data.userType,
                })
            );
        }
        
        console.log('AuthService: Login successful');
        return response.data;
    } catch (error) {
        console.log('AuthService: Login error caught:', error);
        console.log('AuthService: Error response:', error.response);
        
        // Enhanced error handling for login failures
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;
            
            console.log('AuthService: Error status:', status, 'data:', data);
            
            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            } else if (data && typeof data === 'string') {
                errorMessage = data;
            } else if (status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (status === 403) {
                errorMessage = 'Your account has been locked or disabled. Please contact support.';
            } else if (status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            }
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
            // Something else happened
            errorMessage = error.message || 'An unexpected error occurred.';
        }
        
        console.log('AuthService: Final error message:', errorMessage);
        throw { message: errorMessage };
    }
};

// Logout user
export const logout = async () => {
    try {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        // Always clear local storage
        localStorage.removeItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
        localStorage.removeItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
    }
};

// Verify token - FIXED: Uses correct backend endpoint
export const verifyToken = async () => {
    try {
        const response = await api.get(AUTH_ENDPOINTS.VERIFY);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Token verification failed' };
    }
};

// Get current user - FIXED: Uses correct backend endpoint
export const getCurrentUser = async () => {
    try {
        const response = await api.get(AUTH_ENDPOINTS.USER);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to get user info' };
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
    return !!token;
};

// Get stored user info
export const getStoredUser = () => {
    const userInfo = localStorage.getItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
    return userInfo ? JSON.parse(userInfo) : null;
};

export const authService = {
    register,
    login,
    logout,
    verifyToken,
    getCurrentUser,
    isAuthenticated,
    getStoredUser
};

export default authService;