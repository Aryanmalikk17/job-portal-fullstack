import api from './api';

const applicationService = {
  applyToJob: (jobId) => {
    return api.post(`applications/apply/${jobId}`);
  },
  getMyApplications: async () => {
    try {
      const response = await api.get('applications/my-applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching my applications:', error);
      throw error;
    }
  },
  getRecruiterApplications: async () => {
    try {
      const response = await api.get('applications/recruiter');
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter applications:', error);
      throw error;
    }
  },
  getApplicationStatus: async (jobId) => {
    try {
      const response = await api.get(`applications/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application status:', error);
      throw error;
    }
  },
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await api.put(`applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },
  withdrawApplication: async (applicationId) => {
    try {
      const response = await api.post(`applications/withdraw/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }
};

export default applicationService;