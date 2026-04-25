import api from './api';

// Helper for throttling requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllJobs = async () => {
  try {
    const response = await api.get('jobs');
    // Pro-fix for the "t is not iterable" crash
    const jobs = (response.data?.data || response.data) ?? [];
    return Array.isArray(jobs) ? jobs : [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${id}:`, error);
    throw error;
  }
};

export const getAllJobsWithStatus = async () => {
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
};

export const createJob = async (jobData) => {
  try {
    const response = await api.post('jobs/create', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getRecruiterJobs = async () => {
  try {
    const response = await api.get('jobs/recruiter');
    // Extract data from ApiResponse wrapper
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    throw error;
  }
};

// Recruiter application functions moved to applicationService.js

export const deleteJob = async (id) => {
  try {
    const response = await api.delete(`jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job ${id}:`, error);
    throw error;
  }
};

export const checkJobStatus = (id) => {
  return api.get(`jobs/${id}/status`);
};

export const getJobCandidates = (id) => {
  return api.get(`jobs/${id}/candidates`);
};

export const saveJob = (id) => {
  return api.post(`jobs/${id}/save`);
};

export const unsaveJob = (id) => {
  return api.delete(`jobs/${id}/unsave`);
};

export const applyForJob = (id) => {
  return api.post(`jobs/${id}/apply`);
};

// Also export as an object for backward compatibility where needed
export const jobService = {
  getAllJobs,
  getJobById,
  getAllJobsWithStatus,
  createJob,
  getRecruiterJobs,
  deleteJob,
  checkJobStatus,
  getJobCandidates,
  saveJob,
  unsaveJob,
  applyForJob
};

export default jobService;