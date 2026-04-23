import api from './api';

const PROFILE_ENDPOINTS = {
    // Unified Profile endpoint - matches backend
    GET_PROFILE: 'profile',
    
    // Job Seeker Profile
    UPDATE_JOB_SEEKER_PROFILE: 'profile/job-seeker',
    
    // Recruiter Profile  
    UPDATE_RECRUITER_PROFILE: 'profile/recruiter',
    
    // File handling
    GET_FILE_URL: (fileType, fileName) => `profile/download/${fileType}/${fileName}`,
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

            // Helper: append only if field exists (not undefined/null)
            // Allows empty strings so users can clear fields in the DB
            const appendIfDefined = (key, value) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            };

            // Personal Information - send all fields (including empty strings to clear values)
            if (profileData.userId) formData.append('userId', profileData.userId);
            appendIfDefined('firstName', profileData.firstName);
            appendIfDefined('lastName', profileData.lastName);
            appendIfDefined('phone', profileData.phone);
            appendIfDefined('dateOfBirth', profileData.dateOfBirth);
            appendIfDefined('gender', profileData.gender);
            appendIfDefined('city', profileData.city);
            appendIfDefined('state', profileData.state);
            appendIfDefined('country', profileData.country);
            // Boolean: send false explicitly — `if (x)` would silently drop false
            if (profileData.willingToRelocate !== undefined && profileData.willingToRelocate !== null) {
                formData.append('willingToRelocate', profileData.willingToRelocate);
            }

            // Professional Information - send all fields
            appendIfDefined('currentJobTitle', profileData.currentJobTitle);
            appendIfDefined('experience', profileData.experience);
            appendIfDefined('education', profileData.education);
            appendIfDefined('workAuthorization', profileData.workAuthorization);
            appendIfDefined('employmentType', profileData.employmentType);
            appendIfDefined('expectedSalary', profileData.expectedSalary);
            appendIfDefined('availabilityDate', profileData.availabilityDate);
            appendIfDefined('linkedinProfile', profileData.linkedinProfile);
            appendIfDefined('githubProfile', profileData.githubProfile);
            appendIfDefined('portfolioWebsite', profileData.portfolioWebsite);
            appendIfDefined('coverLetter', profileData.coverLetter);

            // Skills — trim and de-duplicate the raw array first, then send.
            // If the cleaned list is empty (user cleared all skills, or array contained
            // only whitespace), send skills='' as an empty sentinel so Spring Boot receives
            // a non-null List<String> and the controller's clear block runs.
            // Without the sentinel, skills=null → controller skips the clear → old rows remain.
            if (profileData.skills && Array.isArray(profileData.skills)) {
                const cleanedSkills = profileData.skills
                    .map(s => (typeof s === 'string' ? s.trim() : ''))
                    .filter(s => s.length > 0);

                if (cleanedSkills.length === 0) {
                    // Empty sentinel: signals "clear all skills from DB"
                    formData.append('skills', '');
                } else {
                    cleanedSkills.forEach(skill => formData.append('skills', skill));
                }
            }

            // Documents - only send if a new File object was selected
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

            // Helper: append only if field exists (not undefined/null)
            const appendIfDefined = (key, value) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            };

            // Add text fields
            if (profileData.userId) formData.append('userId', profileData.userId);
            appendIfDefined('firstName', profileData.firstName);
            appendIfDefined('lastName', profileData.lastName);
            // Note: component uses 'companyName', backend @RequestParam is 'company'
            appendIfDefined('company', profileData.companyName);
            appendIfDefined('city', profileData.city);
            appendIfDefined('state', profileData.state);
            appendIfDefined('country', profileData.country);

            // New Recruiter Fields
            appendIfDefined('phone', profileData.phone);
            appendIfDefined('jobTitle', profileData.jobTitle);
            appendIfDefined('companyWebsite', profileData.companyWebsite);
            appendIfDefined('companyDescription', profileData.companyDescription);
            appendIfDefined('industry', profileData.industry);
            appendIfDefined('companySize', profileData.companySize);
            appendIfDefined('companyType', profileData.companyType);
            appendIfDefined('foundedYear', profileData.foundedYear);
            appendIfDefined('businessPhone', profileData.businessPhone);
            appendIfDefined('businessEmail', profileData.businessEmail);
            appendIfDefined('officeAddress', profileData.officeAddress);
            appendIfDefined('officeCity', profileData.officeCity);
            appendIfDefined('officeState', profileData.officeState);
            appendIfDefined('officeCountry', profileData.officeCountry);

            // Add file fields
            if (profileData.profilePhoto instanceof File) {
                formData.append('profilePhoto', profileData.profilePhoto);
            }
            if (profileData.companyLogo instanceof File) {
                formData.append('companyLogo', profileData.companyLogo);
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