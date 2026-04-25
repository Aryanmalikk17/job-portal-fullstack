import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications, applyToJob } from '../../services/applicationService';
import { getAllJobsWithStatus } from '../../services/jobService';
import StatsCard from './StatsCard';
import ApplicationCard from './ApplicationCard';
import JobCard from '../jobs/JobCard';
import { Briefcase, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { getStatusIcon, getStatusColor, getStatusLabel } from '../../utils/statusHelpers';

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sequential Fetching: To prevent "Polling Storm" (503) on production
      let applicationsResponse = [];
      try {
        applicationsResponse = await getMyApplications();
      } catch (appErr) {
        console.error('Error loading applications:', appErr);
      }
      setApplications(Array.isArray(applicationsResponse) ? applicationsResponse : []);
      
      // Small 100ms throttle between primary and secondary dashboard calls
      await new Promise(r => setTimeout(r, 100));
      
      let jobsResponse = [];
      try {
        jobsResponse = await getAllJobsWithStatus();
      } catch (jobErr) {
        console.error('Error loading jobs:', jobErr);
      }
      setJobs(Array.isArray(jobsResponse) ? jobsResponse : []);
      
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Polling every 30 seconds to prevent "Polling Storm" (503)
    const intervalId = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleApply = async (jobId) => {
    try {
      // FIXED: Using named import applyToJob
      const result = await applyToJob(jobId);
      if (result.success) {
        // Reload data after application
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error applying to job:', err);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.descriptionOfJob.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Applied', value: applications.length, icon: <Briefcase />, color: 'blue' },
    { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, icon: <Clock />, color: 'orange' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length, icon: <CheckCircle />, color: 'green' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, icon: <XCircle />, color: 'red' },
  ];

  if (loading && applications.length === 0) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  // Ensure the mapping handles both job.id and job.jobId depending on the backend response
  const validJobs = jobs.filter(j => j && (j.id || j.jobId));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back!</h1>
        <p>Keep track of your job applications and discover new opportunities.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-content">
        <section className="applications-section">
          <div className="section-header">
            <h2>My Applications</h2>
            <button className="view-all-btn" onClick={() => navigate('/my-applications')}>View All</button>
          </div>
          <div className="applications-list">
            {applications.length > 0 ? (
              applications.slice(0, 5).map(app => (
                <ApplicationCard key={app.applicationId || app.id} application={app} />
              ))
            ) : (
              <div className="empty-state">
                <p>You haven't applied to any jobs yet.</p>
                <button className="primary-btn" onClick={() => navigate('/jobs')}>Find Jobs</button>
              </div>
            )}
          </div>
        </section>

        <section className="jobs-section">
          <div className="section-header">
            <h2>Recommended Jobs</h2>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search jobs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="jobs-grid">
            {validJobs.length > 0 ? (
              validJobs.slice(0, 6).map(job => (
                <JobCard 
                  key={job.jobId || job.id} 
                  job={job} 
                  onApply={() => handleApply(job.jobId || job.id)}
                  isApplied={job.applicationStatus !== null}
                />
              ))
            ) : (
              <p className="no-results">No matching jobs found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;