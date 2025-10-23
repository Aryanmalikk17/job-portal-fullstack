import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Alert, Tab, Tabs, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import LoadingSpinner from '../common/LoadingSpinner';
import ApplicationCard from './ApplicationCard';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import StatusUpdateModal from './StatusUpdateModal';

const RecruiterDashboard = ({ user }) => {
    const navigate = useNavigate();
    
    // State management
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [mainTab, setMainTab] = useState('jobs'); // Changed default to 'jobs' to show posted jobs first
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Application status filter
    const statusFilters = [
        { key: 'all', label: 'All Applications', variant: 'primary' },
        { key: 'APPLIED', label: 'New Applications', variant: 'info' },
        { key: 'UNDER_REVIEW', label: 'Under Review', variant: 'warning' },
        { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', variant: 'success' },
        { key: 'INTERVIEWED', label: 'Interviewed', variant: 'secondary' },
        { key: 'OFFERED', label: 'Offered', variant: 'success' },
        { key: 'HIRED', label: 'Hired', variant: 'success' },
        { key: 'REJECTED', label: 'Rejected', variant: 'danger' }
    ];

    // Load initial data
    useEffect(() => {
        loadApplicationsData();
        loadStatistics();
        loadPostedJobs();
    }, []);

    // Filter applications when tab changes
    useEffect(() => {
        filterApplications();
    }, [applications, activeTab]);

    const loadApplicationsData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get all applications for this recruiter
            const response = await jobService.getRecruiterApplications();
            setApplications(response || []);
        } catch (err) {
            console.error('Error loading applications:', err);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await jobService.getRecruiterStatistics();
            setStatistics(stats || {});
        } catch (err) {
            console.error('Error loading statistics:', err);
            // Don't show error for statistics, just log it
        }
    };

    // New function to load posted jobs
    const loadPostedJobs = async () => {
        try {
            setJobsLoading(true);
            const response = await jobService.getRecruiterJobs();
            setPostedJobs(response || []);
        } catch (err) {
            console.error('Error loading posted jobs:', err);
            // Don't set main error, just log it
        } finally {
            setJobsLoading(false);
        }
    };

    const filterApplications = () => {
        if (activeTab === 'all') {
            setFilteredApplications(applications);
        } else {
            const filtered = applications.filter(app => app.status === activeTab);
            setFilteredApplications(filtered);
        }
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = (application) => {
        setSelectedApplication(application);
        setShowStatusModal(true);
    };

    const handleStatusUpdated = async (applicationId, newStatus, notes) => {
        try {
            // Update status via API
            const updatedApplication = await jobService.updateApplicationStatus(applicationId, {
                status: newStatus,
                recruiterNotes: notes
            });

            // Update local state
            setApplications(prev => 
                prev.map(app => 
                    app.id === applicationId 
                        ? { ...app, status: newStatus, recruiterNotes: notes, lastUpdated: new Date().toISOString() }
                        : app
                )
            );

            // Refresh statistics
            loadStatistics();

            setShowStatusModal(false);
            setSelectedApplication(null);

        } catch (error) {
            console.error('Error updating application status:', error);
            setError('Failed to update application status: ' + error.message);
        }
    };

    // New function to handle job actions
    const handleViewJobDetails = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleEditJob = (jobId) => {
        navigate(`/jobs/${jobId}/edit`);
    };

    const handleViewJobApplications = (jobId) => {
        setMainTab('applications');
        // You could also filter applications by job ID here
    };

    const getStatusBadgeVariant = (status) => {
        const statusMap = {
            'APPLIED': 'primary',
            'UNDER_REVIEW': 'info',
            'INTERVIEW_SCHEDULED': 'warning',
            'INTERVIEWED': 'secondary',
            'OFFERED': 'success',
            'HIRED': 'success',
            'REJECTED': 'danger',
            'WITHDRAWN': 'secondary'
        };
        return statusMap[status] || 'secondary';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const getJobStatus = (job) => {
        // You can customize this based on your job model
        return job.active ? 'Active' : 'Inactive';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="recruiter-dashboard">
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
                                                Manage your job postings and applications to find the best candidates
                                            </p>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate('/jobs/create')}
                                            className="me-2"
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Post New Job
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Enhanced Statistics Cards */}
            <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3">
                    <Card className="stats-card">
                        <Card.Body className="text-center">
                            <div className="stats-icon mb-2">
                                <i className="fas fa-briefcase fa-2x text-primary"></i>
                            </div>
                            <h3 className="stats-number mb-1">{postedJobs.length || 0}</h3>
                            <p className="stats-label mb-0">Posted Jobs</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="stats-card">
                        <Card.Body className="text-center">
                            <div className="stats-icon mb-2">
                                <i className="fas fa-users fa-2x text-info"></i>
                            </div>
                            <h3 className="stats-number mb-1">{statistics.totalApplications || 0}</h3>
                            <p className="stats-label mb-0">Total Applications</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="stats-card">
                        <Card.Body className="text-center">
                            <div className="stats-icon mb-2">
                                <i className="fas fa-calendar-check fa-2x text-warning"></i>
                            </div>
                            <h3 className="stats-number mb-1">{statistics.INTERVIEW_SCHEDULED || 0}</h3>
                            <p className="stats-label mb-0">Interviews Scheduled</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="stats-card">
                        <Card.Body className="text-center">
                            <div className="stats-icon mb-2">
                                <i className="fas fa-user-check fa-2x text-success"></i>
                            </div>
                            <h3 className="stats-number mb-1">{statistics.HIRED || 0}</h3>
                            <p className="stats-label mb-0">Hired</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Error Message */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={loadApplicationsData}
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

            {/* Main Dashboard Tabs */}
            <Card className="dashboard-main-card">
                <Card.Header>
                    <Tabs
                        activeKey={mainTab}
                        onSelect={(key) => setMainTab(key)}
                        className="dashboard-main-tabs"
                    >
                        <Tab eventKey="jobs" title={
                            <span>
                                <i className="fas fa-briefcase me-2"></i>
                                My Posted Jobs
                                <Badge bg="primary" className="ms-2">{postedJobs.length}</Badge>
                            </span>
                        }>
                            {/* Posted Jobs Content */}
                            <div className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Your Job Postings</h5>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={loadPostedJobs}
                                        disabled={jobsLoading}
                                    >
                                        <i className="fas fa-sync-alt me-2"></i>
                                        Refresh
                                    </Button>
                                </div>

                                {jobsLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                ) : postedJobs.length > 0 ? (
                                    <Row>
                                        {postedJobs.map((job) => (
                                            <Col lg={6} key={job.jobPostId} className="mb-3">
                                                <Card className="job-card h-100 border-start border-4 border-primary">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="flex-grow-1">
                                                                <h6 className="job-title mb-1 fw-bold">
                                                                    {job.jobTitle}
                                                                </h6>
                                                                <p className="text-muted mb-0 small">
                                                                    <i className="fas fa-building me-1"></i>
                                                                    {job.jobCompany?.name || 'Company Name'}
                                                                </p>
                                                            </div>
                                                            <Badge 
                                                                bg={getJobStatus(job) === 'Active' ? 'success' : 'secondary'}
                                                                className="status-badge"
                                                            >
                                                                {getJobStatus(job)}
                                                            </Badge>
                                                        </div>

                                                        <div className="job-details mb-3">
                                                            <Row className="g-2 small text-muted">
                                                                <Col xs={6}>
                                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                                    {job.jobLocation?.city}, {job.jobLocation?.state}
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <i className="fas fa-briefcase me-1"></i>
                                                                    {job.jobType}
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <i className="fas fa-home me-1"></i>
                                                                    {job.remote}
                                                                </Col>
                                                                <Col xs={6}>
                                                                    <i className="fas fa-calendar me-1"></i>
                                                                    {formatDate(job.postedDate)}
                                                                </Col>
                                                            </Row>
                                                        </div>

                                                        {job.salary && (
                                                            <div className="salary-info mb-3">
                                                                <small className="text-success fw-bold">
                                                                    <i className="fas fa-dollar-sign me-1"></i>
                                                                    {job.salary}
                                                                </small>
                                                            </div>
                                                        )}

                                                        <div className="job-actions d-flex justify-content-between">
                                                            <div className="action-buttons">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => handleViewJobDetails(job.jobPostId)}
                                                                >
                                                                    <i className="fas fa-eye me-1"></i>
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => handleEditJob(job.jobPostId)}
                                                                >
                                                                    <i className="fas fa-edit me-1"></i>
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handleViewJobApplications(job.jobPostId)}
                                                            >
                                                                <i className="fas fa-users me-1"></i>
                                                                Applications
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div className="no-jobs text-center py-5">
                                        <div className="no-jobs-icon mb-3">
                                            <i className="fas fa-briefcase fa-3x text-muted"></i>
                                        </div>
                                        <h4 className="no-jobs-title mb-2">No Jobs Posted Yet</h4>
                                        <p className="no-jobs-text text-muted mb-4">
                                            Start by posting your first job to attract talented candidates
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Tab>

                        <Tab eventKey="applications" title={
                            <span>
                                <i className="fas fa-file-alt me-2"></i>
                                Application Management
                                <Badge bg="info" className="ms-2">{applications.length}</Badge>
                            </span>
                        }>
                            {/* Applications Management Content */}
                            <div className="p-0">
                                <div className="p-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Manage Applications</h5>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={loadApplicationsData}
                                        >
                                            <i className="fas fa-sync-alt me-2"></i>
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                {/* Status Filter Tabs */}
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(key) => setActiveTab(key)}
                                    className="border-bottom-0"
                                >
                                    {statusFilters.map(filter => (
                                        <Tab 
                                            key={filter.key}
                                            eventKey={filter.key} 
                                            title={
                                                <span>
                                                    {filter.label}
                                                    {filter.key === 'all' ? (
                                                        <Badge bg={filter.variant} className="ms-2">
                                                            {applications.length}
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg={filter.variant} className="ms-2">
                                                            {statistics[filter.key] || 0}
                                                        </Badge>
                                                    )}
                                                </span>
                                            }
                                        >
                                            {/* Applications List */}
                                            <div className="applications-list p-3">
                                                {filteredApplications.length > 0 ? (
                                                    <Row>
                                                        {filteredApplications.map((application) => (
                                                            <Col lg={6} key={application.id} className="mb-3">
                                                                <ApplicationCard
                                                                    application={application}
                                                                    onViewDetails={handleViewDetails}
                                                                    onUpdateStatus={handleUpdateStatus}
                                                                    formatDate={formatDate}
                                                                    getStatusBadgeVariant={getStatusBadgeVariant}
                                                                />
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                ) : (
                                                    <div className="no-applications text-center py-5">
                                                        <div className="no-applications-icon mb-3">
                                                            <i className="fas fa-inbox fa-3x text-muted"></i>
                                                        </div>
                                                        <h4 className="no-applications-title mb-2">No Applications Found</h4>
                                                        <p className="no-applications-text text-muted mb-4">
                                                            {activeTab === 'all' 
                                                                ? "You haven't received any job applications yet."
                                                                : `No applications with status "${statusFilters.find(f => f.key === activeTab)?.label}"`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Tab>
                                    ))}
                                </Tabs>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Header>
            </Card>

            {/* Application Details Modal */}
            <ApplicationDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                application={selectedApplication}
                onUpdateStatus={handleUpdateStatus}
                formatDate={formatDate}
                getStatusBadgeVariant={getStatusBadgeVariant}
            />

            {/* Status Update Modal */}
            <StatusUpdateModal
                show={showStatusModal}
                onHide={() => setShowStatusModal(false)}
                application={selectedApplication}
                onStatusUpdate={handleStatusUpdated}
            />

            <style jsx>{`
                .dashboard-main-tabs .nav-link {
                    font-weight: 600;
                    color: #6b7280;
                    border: none;
                    padding: 1rem 1.5rem;
                }

                .dashboard-main-tabs .nav-link.active {
                    color: #3b82f6;
                    background-color: transparent;
                    border-bottom: 3px solid #3b82f6;
                }

                .job-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .job-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .job-title {
                    color: #1f2937;
                    font-size: 1.1rem;
                }

                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                }

                .job-actions .btn {
                    border-radius: 6px;
                    font-size: 0.85rem;
                }

                .salary-info {
                    background: #f0fdf4;
                    padding: 0.5rem;
                    border-radius: 6px;
                    border-left: 3px solid #10b981;
                }

                .no-jobs, .no-applications {
                    padding: 3rem 2rem;
                }

                .no-jobs-icon, .no-applications-icon {
                    opacity: 0.5;
                }

                .stats-card {
                    transition: all 0.3s ease;
                }

                .stats-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default RecruiterDashboard;