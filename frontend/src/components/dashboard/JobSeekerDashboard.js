import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';
import StatsCard from './StatsCard';
import ApplicationCard from './ApplicationCard';
import JobCard from '../jobs/JobCard';
import { Briefcase, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

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
      
      // Sequential Fetching: To prevent "Polling Storm" (503) on production,
      // we fetch data in sequence with a small delay.
      const applicationsResponse = await applicationService.getMyApplications();
      setApplications(applicationsResponse || []);
      
      // Small 100ms throttle between primary and secondary dashboard calls
      await new Promise(r => setTimeout(r, 100));
      
      const jobsResponse = await jobService.getAllJobsWithStatus();
      setJobs(jobsResponse || []);
      
      setError(null);
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
      const result = await applicationService.applyToJob(jobId);
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

  const validJobs = filteredJobs.filter(j => j && (j.id || j.jobId));

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
            <button className="view-all-btn" onClick={() => navigate('/applications')}>View All</button>
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