import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import FilterSidebar from './FilterSidebar';
import JobCard from '../jobs/JobCard';
import LoadingSpinner from '../common/LoadingSpinner';

const JobSeekerDashboard = ({ user }) => {
    const navigate = useNavigate();
    
    // State management
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerms, setSearchTerms] = useState({
        jobTitle: '',
        location: ''
    });
    const [filters, setFilters] = useState({
        employmentType: [],
        remoteWork: [],
        datePosted: []
    });
    const [totalResults, setTotalResults] = useState(0);

    // Load initial jobs
    useEffect(() => {
        loadJobs();
    }, []);

    // Apply filters when they change
    useEffect(() => {
        applyFilters();
    }, [jobs, filters, searchTerms]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use the enhanced method that includes user status
            const response = await jobService.getAllJobsWithStatus();
            setJobs(response || []);
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError('Failed to load jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle save job functionality
    const handleSaveJob = async (jobId, isSaved) => {
        try {
            if (isSaved) {
                // Unsave the job
                await jobService.unsaveJob(jobId);
            } else {
                // Save the job
                await jobService.saveJob(jobId);
            }
            
            // Update the job in the state
            setJobs(prevJobs => 
                prevJobs.map(job => 
                    job.jobPostId === jobId 
                        ? { ...job, isSaved: !isSaved }
                        : job
                )
            );
            
            // Also update filtered jobs
            setFilteredJobs(prevJobs => 
                prevJobs.map(job => 
                    job.jobPostId === jobId 
                        ? { ...job, isSaved: !isSaved }
                        : job
                )
            );
            
        } catch (error) {
            console.error('Error saving/unsaving job:', error);
            setError(isSaved ? 'Failed to unsave job' : 'Failed to save job');
        }
    };

    // Handle apply to job functionality
    const handleApplyToJob = async (jobId) => {
        try {
            // Use the correct enhanced application method
            const result = await jobService.applyForJob(jobId, {
                coverLetter: '', // Empty for now - JobApplicationModal handles detailed applications
                resumePath: ''   // Empty for now - will be handled by resume upload feature
            });
            
            if (result.success) {
                // Update the job application status in state
                setJobs(prevJobs => 
                    prevJobs.map(job => 
                        job.jobPostId === jobId 
                            ? { ...job, isActive: true, hasApplied: true }
                            : job
                    )
                );
                
                setFilteredJobs(prevJobs => 
                    prevJobs.map(job => 
                        job.jobPostId === jobId 
                            ? { ...job, isActive: true, hasApplied: true }
                            : job
                    )
                );
            } else {
                throw new Error(result.message || 'Application failed');
            }
            
        } catch (error) {
            console.error('Error applying to job:', error);
            setError('Failed to apply to job: ' + (error.message || 'Unknown error'));
        }
    };

    const applyFilters = () => {
        let filtered = [...jobs];

        // Search filter
        if (searchTerms.jobTitle.trim()) {
            filtered = filtered.filter(job =>
                job.jobTitle?.toLowerCase().includes(searchTerms.jobTitle.toLowerCase())
            );
        }

        if (searchTerms.location.trim()) {
            filtered = filtered.filter(job =>
                job.jobLocationId?.city?.toLowerCase().includes(searchTerms.location.toLowerCase()) ||
                job.jobLocationId?.state?.toLowerCase().includes(searchTerms.location.toLowerCase())
            );
        }

        // Employment type filter
        if (filters.employmentType.length > 0) {
            filtered = filtered.filter(job =>
                filters.employmentType.includes(job.jobType)
            );
        }

        // Remote work filter
        if (filters.remoteWork.length > 0) {
            filtered = filtered.filter(job =>
                filters.remoteWork.includes(job.remote)
            );
        }

        // Date posted filter
        if (filters.datePosted.length > 0) {
            const now = new Date();
            filtered = filtered.filter(job => {
                const jobDate = new Date(job.postedDate);
                return filters.datePosted.some(filter => {
                    switch (filter) {
                        case 'today':
                            return jobDate.toDateString() === now.toDateString();
                        case 'last7days':
                            return (now - jobDate) / (1000 * 60 * 60 * 24) <= 7;
                        case 'last30days':
                            return (now - jobDate) / (1000 * 60 * 60 * 24) <= 30;
                        default:
                            return true;
                    }
                });
            });
        }

        setFilteredJobs(filtered);
        setTotalResults(filtered.length);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        
        // Add small delay for better UX
        setTimeout(() => {
            applyFilters();
            setSearchLoading(false);
        }, 300);
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchTerms(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (filterType, value, checked) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: checked
                ? [...prev[filterType], value]
                : prev[filterType].filter(item => item !== value)
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            employmentType: [],
            remoteWork: [],
            datePosted: []
        });
        setSearchTerms({
            jobTitle: '',
            location: ''
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="job-seeker-dashboard">
            {/* Welcome Header */}
            <div className="dashboard-header mb-4">
                <Row>
                    <Col>
                        <Card className="welcome-card">
                            <Card.Body className="p-4">
                                <Row className="align-items-center">
                                    <Col md={8}>
                                        <div className="welcome-content">
                                            <h2 className="welcome-title mb-2">
                                                Welcome back, {user?.firstName}! 👋
                                            </h2>
                                            <p className="welcome-subtitle mb-0">
                                                Ready to find your next opportunity? Let's get started!
                                            </p>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <div className="quick-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">{totalResults}</span>
                                                <span className="stat-label">Jobs Found</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Main Dashboard Content */}
            <Row>
                {/* Filter Sidebar */}
                <Col lg={3}>
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearAll={clearAllFilters}
                        totalResults={totalResults}
                    />
                </Col>

                {/* Main Content Area */}
                <Col lg={9}>
                    {/* Search Section */}
                    <Card className="search-card mb-4">
                        <Card.Body className="p-4">
                            <div className="search-header mb-3">
                                <h3 className="search-title mb-1">
                                    <i className="fas fa-search me-2"></i>
                                    Find Your Dream Job
                                </h3>
                                <p className="search-subtitle mb-0">
                                    Discover opportunities that match your skills and interests
                                </p>
                            </div>

                            <Form onSubmit={handleSearch}>
                                <Row>
                                    <Col md={5}>
                                        <Form.Group className="mb-3 mb-md-0">
                                            <Form.Control
                                                type="text"
                                                name="jobTitle"
                                                value={searchTerms.jobTitle}
                                                onChange={handleSearchInputChange}
                                                placeholder="Job title, keywords, or company"
                                                className="search-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3 mb-md-0">
                                            <Form.Control
                                                type="text"
                                                name="location"
                                                value={searchTerms.location}
                                                onChange={handleSearchInputChange}
                                                placeholder="City or state"
                                                className="search-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Button
                                            type="submit"
                                            className="search-btn w-100"
                                            disabled={searchLoading}
                                        >
                                            {searchLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-search me-2"></i>
                                                    Search Jobs
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Results Counter and Active Filters */}
                    <div className="results-header mb-3">
                        <Row className="align-items-center">
                            <Col md={6}>
                                <div className="results-counter">
                                    <h5 className="mb-0">
                                        <i className="fas fa-briefcase me-2"></i>
                                        {totalResults} Job{totalResults !== 1 ? 's' : ''} Found
                                    </h5>
                                    {(filters.employmentType.length > 0 || filters.remoteWork.length > 0 || filters.datePosted.length > 0) && (
                                        <small className="text-muted">Filtered results</small>
                                    )}
                                </div>
                            </Col>
                            <Col md={6} className="text-end">
                                {(filters.employmentType.length > 0 || filters.remoteWork.length > 0 || filters.datePosted.length > 0) && (
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="clear-filters-btn"
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear Filters
                                    </Button>
                                )}
                            </Col>
                        </Row>

                        {/* Active Filters Display */}
                        {(filters.employmentType.length > 0 || filters.remoteWork.length > 0 || filters.datePosted.length > 0) && (
                            <div className="active-filters mt-2">
                                {[...filters.employmentType, ...filters.remoteWork, ...filters.datePosted].map((filter, index) => (
                                    <Badge key={index} bg="primary" className="me-2 mb-2 filter-badge">
                                        {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        <i className="fas fa-times ms-2"></i>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-2"
                                onClick={loadJobs}
                            >
                                Try Again
                            </Button>
                        </Alert>
                    )}

                    {/* Job Cards Grid */}
                    <div className="jobs-grid">
                        {filteredJobs.length > 0 ? (
                            <Row>
                                {filteredJobs.map((job) => (
                                    <Col lg={6} key={job.jobPostId} className="mb-4">
                                        <JobCard 
                                            job={job} 
                                            onSave={handleSaveJob}
                                            onApply={handleApplyToJob}
                                            showActions={true}
                                            onClick={() => navigate(`/jobs/${job.jobPostId}`)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="no-jobs-found text-center py-5">
                                <div className="no-jobs-icon mb-3">
                                    <i className="fas fa-search fa-3x text-muted"></i>
                                </div>
                                <h4 className="no-jobs-title mb-2">No Jobs Found</h4>
                                <p className="no-jobs-text text-muted mb-4">
                                    {(searchTerms.jobTitle || searchTerms.location || filters.employmentType.length > 0 || filters.remoteWork.length > 0 || filters.datePosted.length > 0)
                                        ? "Try adjusting your search criteria or filters"
                                        : "There are no job postings available at the moment"
                                    }
                                </p>
                                {(searchTerms.jobTitle || searchTerms.location || filters.employmentType.length > 0 || filters.remoteWork.length > 0 || filters.datePosted.length > 0) && (
                                    <Button variant="primary" onClick={clearAllFilters}>
                                        <i className="fas fa-redo me-2"></i>
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <Card className="quick-actions-card mt-4">
                        <Card.Body className="p-4">
                            <h5 className="quick-actions-title mb-3">
                                <i className="fas fa-bolt me-2"></i>
                                Quick Actions
                            </h5>
                            <Row>
                                <Col md={3}>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100 quick-action-btn"
                                        onClick={() => navigate('/saved-jobs')}
                                    >
                                        <i className="fas fa-heart me-2"></i>
                                        View Saved Jobs
                                    </Button>
                                </Col>
                                <Col md={3}>
                                    <Button
                                        variant="outline-info"
                                        className="w-100 quick-action-btn"
                                        onClick={() => navigate('/my-applications')}
                                    >
                                        <i className="fas fa-briefcase me-2"></i>
                                        My Applications
                                    </Button>
                                </Col>
                                <Col md={3}>
                                    <Button
                                        variant="outline-success"
                                        className="w-100 quick-action-btn"
                                        onClick={() => navigate('/profile')}
                                    >
                                        <i className="fas fa-user me-2"></i>
                                        Update Profile
                                    </Button>
                                </Col>
                                <Col md={3}>
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100 quick-action-btn"
                                        onClick={() => navigate('/jobs')}
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Advanced Search
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default JobSeekerDashboard;