import api from './api';

const PROFILE_ENDPOINTS = {
    // Unified Profile endpoint - matches backend
    GET_PROFILE: '/profile',
    
    // Job Seeker Profile
    UPDATE_JOB_SEEKER_PROFILE: '/profile/job-seeker',
    
    // Recruiter Profile  
    UPDATE_RECRUITER_PROFILE: '/profile/recruiter',
    
    // File handling
    GET_FILE_URL: (fileType, fileName) => `/profile/download/${fileType}/${fileName}`,
};

export const profileService = {
    // Get current user profile (unified endpoint)
    getCurrentProfile: async () => {
        try {
            const response = await api.get(PROFILE_ENDPOINTS.GET_PROFILE);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch profile' };
        }
    },

    // Job Seeker Profile Methods
    getJobSeekerProfile: async () => {
        // Use unified profile endpoint
        return await profileService.getCurrentProfile();
    },

    updateJobSeekerProfile: async (profileData) => {
        try {
            // Handle form data for file uploads
            const formData = new FormData();
            
            // Personal Information - Add ALL fields
            if (profileData.firstName) formData.append('firstName', profileData.firstName);
            if (profileData.lastName) formData.append('lastName', profileData.lastName);
            if (profileData.phone) formData.append('phone', profileData.phone);
            if (profileData.dateOfBirth) formData.append('dateOfBirth', profileData.dateOfBirth);
            if (profileData.gender) formData.append('gender', profileData.gender);
            if (profileData.city) formData.append('city', profileData.city);
            if (profileData.state) formData.append('state', profileData.state);
            if (profileData.country) formData.append('country', profileData.country);
            if (profileData.willingToRelocate !== undefined) formData.append('willingToRelocate', profileData.willingToRelocate);
            
            // Professional Information - Add ALL fields
            if (profileData.currentJobTitle) formData.append('currentJobTitle', profileData.currentJobTitle);
            if (profileData.experience) formData.append('experience', profileData.experience);
            if (profileData.education) formData.append('education', profileData.education);
            if (profileData.workAuthorization) formData.append('workAuthorization', profileData.workAuthorization);
            if (profileData.employmentType) formData.append('employmentType', profileData.employmentType);
            if (profileData.expectedSalary) formData.append('expectedSalary', profileData.expectedSalary);
            if (profileData.availabilityDate) formData.append('availabilityDate', profileData.availabilityDate);
            if (profileData.linkedinProfile) formData.append('linkedinProfile', profileData.linkedinProfile);
            if (profileData.githubProfile) formData.append('githubProfile', profileData.githubProfile);
            if (profileData.portfolioWebsite) formData.append('portfolioWebsite', profileData.portfolioWebsite);
            if (profileData.coverLetter) formData.append('coverLetter', profileData.coverLetter);
            
            // Documents - Add file fields
            if (profileData.profilePhoto instanceof File) {
                formData.append('profilePhoto', profileData.profilePhoto);
            }
            if (profileData.resume instanceof File) {
                formData.append('resume', profileData.resume);
            }

            const response = await api.put(PROFILE_ENDPOINTS.UPDATE_JOB_SEEKER_PROFILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update job seeker profile' };
        }
    },

    // Recruiter Profile Methods
    getRecruiterProfile: async () => {
        // Use unified profile endpoint
        return await profileService.getCurrentProfile();
    },

    updateRecruiterProfile: async (profileData) => {
        try {
            // Handle form data for file uploads
            const formData = new FormData();
            
            // Add text fields
            if (profileData.firstName) formData.append('firstName', profileData.firstName);
            if (profileData.lastName) formData.append('lastName', profileData.lastName);
            if (profileData.company) formData.append('company', profileData.company);
            if (profileData.city) formData.append('city', profileData.city);
            if (profileData.state) formData.append('state', profileData.state);
            if (profileData.country) formData.append('country', profileData.country);
            
            // Add file fields
            if (profileData.profilePhoto instanceof File) {
                formData.append('profilePhoto', profileData.profilePhoto);
            }

            const response = await api.put(PROFILE_ENDPOINTS.UPDATE_RECRUITER_PROFILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update recruiter profile' };
        }
    },

    // File URL Methods
    getFileUrl: async (fileType, fileName) => {
        try {
            const response = await api.get(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, fileName));
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get file URL' };
        }
    },

    // File Upload Methods
    uploadFile: async (file, fileType) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', fileType);

            const response = await api.post(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, file.name), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            // For development, simulate successful upload
            console.warn('File upload endpoint not available, simulating upload');
            return {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString()
            };
        }
    },

    deleteFile: async (fileId, fileType) => {
        try {
            const response = await api.delete(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, fileId));
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete file' };
        }
    },

    // Profile Photo Methods
    uploadProfilePhoto: async (file) => {
        return await profileService.uploadFile(file, 'profilePhoto');
    },

    deleteProfilePhoto: async () => {
        return await profileService.deleteFile(null, 'profilePhoto');
    },

    // Resume Methods
    uploadResume: async (file) => {
        return await profileService.uploadFile(file, 'resume');
    },

    deleteResume: async () => {
        return await profileService.deleteFile(null, 'resume');
    },

    // Company Logo Methods
    uploadCompanyLogo: async (file) => {
        return await profileService.uploadFile(file, 'companyLogo');
    },

    deleteCompanyLogo: async () => {
        return await profileService.deleteFile(null, 'companyLogo');
    },

    // Utility Methods
    validateProfileData: (profileData, userType) => {
        const errors = {};
        
        // Common validations
        if (!profileData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        }
        
        if (!profileData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        }
        
        if (!profileData.phone?.trim()) {
            errors.phone = 'Phone number is required';
        }
        
        // Email validation
        if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Job seeker specific validations
        if (userType === 'Job Seeker') {
            // Additional validations for job seekers if needed
        }
        
        // Recruiter specific validations
        if (userType === 'Recruiter') {
            // Additional validations for recruiters if needed
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    formatProfileData: (profileData, userType) => {
        // Clean and format profile data before sending to API
        const cleanData = { ...profileData };
        
        // Remove empty strings and convert to null where appropriate
        Object.keys(cleanData).forEach(key => {
            if (typeof cleanData[key] === 'string' && cleanData[key].trim() === '') {
                cleanData[key] = null;
            }
        });
        
        // Format specific fields
        if (cleanData.skills && Array.isArray(cleanData.skills)) {
            cleanData.skills = cleanData.skills.filter(skill => skill.trim() !== '');
        }
        
        if (cleanData.expectedSalary) {
            cleanData.expectedSalary = cleanData.expectedSalary.trim();
        }
        
        if (cleanData.foundedYear) {
            cleanData.foundedYear = parseInt(cleanData.foundedYear);
        }
        
        return cleanData;
    }
};