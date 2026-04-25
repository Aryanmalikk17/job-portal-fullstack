import api from './api';
import { getStatusIcon as statusIconHelper } from '../utils/statusHelpers';

export const applyToJob = (jobId, data = {}) => {
  return api.post(`applications/apply/${jobId}`, data);
};

export const getMyApplications = async () => {
  try {
    const response = await api.get('applications/my-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

export const getRecruiterApplications = async () => {
  try {
    const response = await api.get('applications/recruiter/applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    throw error;
  }
};

export const getRecruiterStatistics = async () => {
  try {
    const response = await api.get('applications/recruiter/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching recruiter statistics:', error);
    throw error;
  }
};

export const getApplicationStatus = async (jobId) => {
  try {
    const response = await api.get(`applications/status/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId, statusData) => {
  try {
    const response = await api.put(`applications/${applicationId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

export const withdrawApplication = async (applicationId) => {
  try {
    // FIXED: Backend uses PUT /api/applications/{id}/withdraw
    const response = await api.put(`applications/${applicationId}/withdraw`);
    return response.data;
  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw error;
  }
};

// Bridge function to prevent "service.getStatusIcon is not a function"
export const getStatusIcon = (status) => statusIconHelper(status);

export const applicationService = {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  getRecruiterStatistics,
  getApplicationStatus,
  updateApplicationStatus,
  withdrawApplication,
  getStatusIcon
};

export default applicationService;