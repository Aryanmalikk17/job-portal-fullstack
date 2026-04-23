import api from './api';

// Helper for throttling requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const jobService = {
  getAllJobs: async () => {
    try {
      const response = await api.get('jobs');
      // Pro-fix for the "t is not iterable" crash
      const jobs = (response.data?.data || response.data) ?? [];
      return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getJobById: async (id) => {
    try {
      const response = await api.get(`jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  getAllJobsWithStatus: async () => {
    try {
      // First get all jobs
      const response = await api.get('jobs');
      // Pro-fix for the "t is not iterable" crash
      const jobs = (response.data?.data || response.data) ?? [];
      const validatedJobs = Array.isArray(jobs) ? jobs : [];
      
      // THRESHOLD: To prevent "Polling Storm" (503), we fetch status sequentially with a small delay
      const jobsWithStatus = [];
      for (const job of validatedJobs) {
        // Guard: skip if no valid ID to avoid /status/undefined
        const targetId = job.id || job.jobId;
        if (!targetId) continue;

        try {
          // Add a small 100ms delay between individual status checks
          await delay(100);
          const statusRes = await api.get(`applications/status/${targetId}`);
          jobsWithStatus.push({ 
            ...job, 
            applicationStatus: statusRes.data?.data || statusRes.data 
          });
        } catch (e) {
          jobsWithStatus.push({ ...job, applicationStatus: null });
        }
      }
      
      return jobsWithStatus;
    } catch (error) {
      console.error('Error fetching jobs with status:', error);
      throw error;
    }
  },

  createJob: async (jobData) => {
    try {
      const response = await api.post('jobs/create', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  getRecruiterJobs: async () => {
    try {
      const response = await api.get('jobs/recruiter');
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
      throw error;
    }
  },

  deleteJob: async (id) => {
    try {
      const response = await api.delete(`jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  }
};

export default jobService;