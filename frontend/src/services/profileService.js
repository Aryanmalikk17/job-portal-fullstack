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

export const getCurrentProfile = async () => {
    try {
        const response = await api.get(PROFILE_ENDPOINTS.GET_PROFILE);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch profile' };
    }
};

export const getJobSeekerProfile = async () => {
    return await getCurrentProfile();
};

export const updateJobSeekerProfile = async (profileData) => {
    try {
        const formData = new FormData();
        const appendIfDefined = (key, value) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        };

        if (profileData.userId) formData.append('userId', profileData.userId);
        appendIfDefined('firstName', profileData.firstName);
        appendIfDefined('lastName', profileData.lastName);
        appendIfDefined('phone', profileData.phone);
        appendIfDefined('dateOfBirth', profileData.dateOfBirth);
        appendIfDefined('gender', profileData.gender);
        appendIfDefined('city', profileData.city);
        appendIfDefined('state', profileData.state);
        appendIfDefined('country', profileData.country);
        
        if (profileData.willingToRelocate !== undefined && profileData.willingToRelocate !== null) {
            formData.append('willingToRelocate', profileData.willingToRelocate);
        }

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

        if (profileData.skills && Array.isArray(profileData.skills)) {
            const cleanedSkills = profileData.skills
                .map(s => (typeof s === 'string' ? s.trim() : ''))
                .filter(s => s.length > 0);

            if (cleanedSkills.length === 0) {
                formData.append('skills', '');
            } else {
                cleanedSkills.forEach(skill => formData.append('skills', skill));
            }
        }

        if (profileData.profilePhoto instanceof File) {
            formData.append('profilePhoto', profileData.profilePhoto);
        }
        if (profileData.resume instanceof File) {
            formData.append('resume', profileData.resume);
        }

        const response = await api.put(PROFILE_ENDPOINTS.UPDATE_JOB_SEEKER_PROFILE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update job seeker profile' };
    }
};

export const getRecruiterProfile = async () => {
    try {
        const response = await api.get(PROFILE_ENDPOINTS.UPDATE_RECRUITER_PROFILE);
        return response.data;
    } catch (error) {
        return await getCurrentProfile();
    }
};

export const updateRecruiterProfile = async (profileData) => {
    try {
        const formData = new FormData();
        const appendIfDefined = (key, value) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        };

        if (profileData.userId) formData.append('userId', profileData.userId);
        appendIfDefined('firstName', profileData.firstName);
        appendIfDefined('lastName', profileData.lastName);
        appendIfDefined('company', profileData.companyName);
        appendIfDefined('city', profileData.city);
        appendIfDefined('state', profileData.state);
        appendIfDefined('country', profileData.country);
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

        if (profileData.profilePhoto instanceof File) {
            formData.append('profilePhoto', profileData.profilePhoto);
        }
        if (profileData.companyLogo instanceof File) {
            formData.append('companyLogo', profileData.companyLogo);
        }

        const response = await api.put(PROFILE_ENDPOINTS.UPDATE_RECRUITER_PROFILE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update recruiter profile' };
    }
};

export const getFileUrl = async (fileType, fileName) => {
    try {
        const response = await api.get(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, fileName));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to get file URL' };
    }
};

/**
 * Utility to get a full URL for a file stored on the server.
 * If the input is already a File object, it returns a blob URL.
 * If it's a string, it returns the API download URL.
 */
export const getFullFileUrl = (file, fileType) => {
    if (!file) return null;
    if (file instanceof File) {
        try {
            return URL.createObjectURL(file);
        } catch (e) {
            console.error('Error creating object URL:', e);
            return null;
        }
    }
    if (typeof file === 'string') {
        // Assume it's a filename from the database
        return `/api/profile/download/${fileType}/${file}`;
    }
    // If it's an object with a 'url' property (from our simulated upload)
    if (file.url) return file.url;
    // If it's an object with a 'name' property but no URL (fallback)
    if (file.name) return `/api/profile/download/${fileType}/${file.name}`;
    
    return null;
};

export const uploadFile = async (file, fileType) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);
        const response = await api.post(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, file.name), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        return {
            id: Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString()
        };
    }
};

export const deleteFile = async (fileId, fileType) => {
    try {
        const response = await api.delete(PROFILE_ENDPOINTS.GET_FILE_URL(fileType, fileId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete file' };
    }
};

export const uploadProfilePhoto = async (file) => uploadFile(file, 'profilePhoto');
export const deleteProfilePhoto = async () => deleteFile(null, 'profilePhoto');
export const uploadResume = async (file) => uploadFile(file, 'resume');
export const deleteResume = async () => deleteFile(null, 'resume');
export const uploadCompanyLogo = async (file) => uploadFile(file, 'companyLogo');
export const deleteCompanyLogo = async () => deleteFile(null, 'companyLogo');

export const validateProfileData = (profileData, userType) => {
    const errors = {};
    if (!profileData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!profileData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!profileData.phone?.trim()) errors.phone = 'Phone number is required';
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
};

export const formatProfileData = (profileData, userType) => {
    const cleanData = { ...profileData };
    Object.keys(cleanData).forEach(key => {
        if (typeof cleanData[key] === 'string' && cleanData[key].trim() === '') {
            cleanData[key] = null;
        }
    });
    if (cleanData.skills && Array.isArray(cleanData.skills)) {
        cleanData.skills = cleanData.skills.filter(skill => skill.trim() !== '');
    }
    if (cleanData.expectedSalary) cleanData.expectedSalary = cleanData.expectedSalary.trim();
    if (cleanData.foundedYear) cleanData.foundedYear = parseInt(cleanData.foundedYear);
    return cleanData;
};

// Also export as a default object for backward compatibility during transition if needed
// but components should prefer named imports
const profileService = {
    getCurrentProfile,
    getJobSeekerProfile,
    updateJobSeekerProfile,
    getRecruiterProfile,
    updateRecruiterProfile,
    getFileUrl,
    uploadFile,
    deleteFile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    uploadResume,
    deleteResume,
    uploadCompanyLogo,
    deleteCompanyLogo,
    validateProfileData,
    formatProfileData
};

export default profileService;