import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [jobStatus, setJobStatus] = useState({ alreadyApplied: false, alreadySaved: false });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorType, setErrorType] = useState(null); // Track error type for specific handling
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const loadJobDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setErrorType(null);

            // Load job details
            const jobData = await jobService.getJobById(id);
            setJob(jobData);

            // Load job status for job seekers
            if (user?.userType === 'Job Seeker') {
                try {
                    const statusData = await jobService.checkJobStatus(id);
                    setJobStatus(statusData);
                } catch (statusErr) {
                    // Continue without status if this fails
                    console.warn('Failed to load job status:', statusErr);
                }
            }

            // Load candidates for recruiters
            if (user?.userType === 'Recruiter') {
                try {
                    const candidatesData = await jobService.getJobCandidates(id);
                    setCandidates(candidatesData);
                } catch (candidatesErr) {
                    // Continue without candidates if this fails
                    console.warn('Failed to load candidates:', candidatesErr);
                    setCandidates([]);
                }
            }

        } catch (err) {
            const errorInfo = handleApiError(err, 'job');
            setError(errorInfo.message);
            setErrorType(errorInfo.type);
        } finally {
            setLoading(false);
        }
    }, [id, user?.userType]);

    useEffect(() => {
        loadJobDetails();
    }, [loadJobDetails]);

    // Enhanced error handling function
    const handleApiError = (err, context) => {
        let errorMessage = 'An unexpected error occurred';
        let errorTypeCode = 'GENERAL_ERROR';

        if (err.response) {
            // Server responded with error status
            const status = err.response.status;
            switch (status) {
                case 400:
                    errorMessage = `Invalid request: ${err.response.data?.message || 'Bad request'}`;
                    errorTypeCode = 'INVALID_REQUEST';
                    break;
                case 401:
                    errorMessage = 'You are not authorized to perform this action. Please log in again.';
                    errorTypeCode = 'UNAUTHORIZED';
                    break;
                case 403:
                    errorMessage = 'You do not have permission to access this resource.';
                    errorTypeCode = 'FORBIDDEN';
                    break;
                case 404:
                    errorMessage = context === 'job' ? 'Job not found. It may have been deleted.' : 'Resource not found';
                    errorTypeCode = 'NOT_FOUND';
                    break;
                case 500:
                    errorMessage = 'Server error occurred. Please try again later.';
                    errorTypeCode = 'SERVER_ERROR';
                    break;
                default:
                    errorMessage = `Request failed with status ${status}`;
                    errorTypeCode = 'HTTP_ERROR';
            }
        } else if (err.request) {
            // Network error
            errorMessage = 'Network error. Please check your internet connection.';
            errorTypeCode = 'NETWORK_ERROR';
        } else {
            // Other error
            errorMessage = err.message || errorMessage;
            errorTypeCode = 'GENERAL_ERROR';
        }

        return { message: errorMessage, type: errorTypeCode };
    };

    const handleApplyJob = async () => {
        try {
            setActionLoading(true);
            await jobService.applyForJob(id);
            setJobStatus(prev => ({ ...prev, alreadyApplied: true }));
            showNotification('Successfully applied for the job!', 'success');
        } catch (err) {
            const errorInfo = handleApiError(err, 'apply');
            showNotification(errorInfo.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveJob = async () => {
        try {
            setActionLoading(true);
            if (jobStatus.alreadySaved) {
                await jobService.unsaveJob(id);
                setJobStatus(prev => ({ ...prev, alreadySaved: false }));
                showNotification('Job removed from saved jobs', 'success');
            } else {
                await jobService.saveJob(id);
                setJobStatus(prev => ({ ...prev, alreadySaved: true }));
                showNotification('Job saved successfully!', 'success');
            }
        } catch (err) {
            const errorInfo = handleApiError(err, 'save');
            showNotification(errorInfo.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditJob = () => {
        navigate(`/dashboard/edit/${id}`);
    };

    const handleDeleteJob = async () => {
        try {
            setActionLoading(true);
            await jobService.deleteJob(id);
            showNotification('Job deleted successfully!', 'success');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            const errorInfo = handleApiError(err, 'delete');
            showNotification(errorInfo.message, 'error');
        } finally {
            setActionLoading(false);
            setShowDeleteModal(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/jobs');
        }
    };

    // Enhanced retry function
    const handleRetry = () => {
        if (errorType === 'UNAUTHORIZED') {
            // Redirect to login for auth errors
            navigate('/login');
        } else {
            // Retry loading job details
            loadJobDetails();
        }
    };

    // Enhanced error display component
    const renderError = () => {
        const getErrorIcon = () => {
            switch (errorType) {
                case 'NETWORK_ERROR':
                    return 'fa-wifi';
                case 'NOT_FOUND':
                    return 'fa-search';
                case 'UNAUTHORIZED':
                case 'FORBIDDEN':
                    return 'fa-lock';
                case 'SERVER_ERROR':
                    return 'fa-server';
                default:
                    return 'fa-exclamation-triangle';
            }
        };

        const getRetryButtonText = () => {
            switch (errorType) {
                case 'UNAUTHORIZED':
                    return 'Go to Login';
                case 'NETWORK_ERROR':
                    return 'Check Connection & Retry';
                case 'NOT_FOUND':
                    return 'Search for Jobs';
                default:
                    return 'Try Again';
            }
        };

        const getSecondaryAction = () => {
            if (errorType === 'NOT_FOUND') {
                return (
                    <Button 
                        variant="outline-primary" 
                        onClick={() => navigate('/jobs')}
                        className="ms-2"
                    >
                        <i className="fa fa-search me-2"></i>
                        Browse All Jobs
                    </Button>
                );
            }
            return null;
        };

        return (
            <Container className="py-5">
                <Row>
                    <Col>
                        <Alert variant="danger" className="text-center error-alert">
                            <div className="error-content">
                                <i className={`fa ${getErrorIcon()} fa-3x mb-3 text-danger`}></i>
                                <h4 className="mb-3">Oops! Something went wrong</h4>
                                <p className="mb-4">{error}</p>
                                
                                <div className="error-actions">
                                    <Button 
                                        variant="primary" 
                                        onClick={handleRetry}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-redo me-2"></i>
                                                {getRetryButtonText()}
                                            </>
                                        )}
                                    </Button>
                                    
                                    {getSecondaryAction()}
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={goBack}
                                        className="ms-2"
                                    >
                                        <i className="fa fa-arrow-left me-2"></i>
                                        Go Back
                                    </Button>
                                </div>

                                {errorType === 'NETWORK_ERROR' && (
                                    <div className="mt-3">
                                        <small className="text-muted">
                                            <i className="fa fa-info-circle me-1"></i>
                                            Please check your internet connection and try again
                                        </small>
                                    </div>
                                )}
                            </div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return renderError();
    }

    if (!job) {
        return (
            <Container className="py-5">
                <Row>
                    <Col>
                        <Alert variant="warning" className="text-center">
                            <i className="fa fa-exclamation-circle me-2"></i>
                            Job not found
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <div className="job-details-page">
            <Container className="py-4">
                {/* Notification */}
                {notification && (
                    <Alert 
                        variant={notification.type === 'success' ? 'success' : 'danger'} 
                        className="mb-4 modern-alert"
                        dismissible 
                        onClose={() => setNotification(null)}
                    >
                        <div className="d-flex align-items-center">
                            <i className={`fa ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-3`}></i>
                            <span>{notification.message}</span>
                        </div>
                    </Alert>
                )}

                {/* Header Section */}
                <div className="job-details-header mb-5">
                    <div className="d-flex align-items-center mb-4">
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="back-btn me-3" 
                            onClick={goBack}
                        >
                            <i className="fa fa-arrow-left me-2"></i>
                            Back
                        </Button>
                        
                        <div className="page-breadcrumb text-muted">
                            <small>
                                <Link to="/dashboard" className="text-decoration-none">Dashboard</Link>
                                <i className="fa fa-angle-right mx-2"></i>
                                <span>Job Details</span>
                            </small>
                        </div>
                    </div>
                    
                    <div className="job-header-card">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="job-header-content">
                                    <div className="d-flex align-items-start mb-4">
                                        <div className="company-logo me-4">
                                            <div className="logo-placeholder">
                                                <i className="fa fa-building fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h1 className="job-title mb-3">{job.jobTitle}</h1>
                                            <div className="company-info mb-3">
                                                <h5 className="company-name text-primary mb-2">
                                                    {job.jobCompanyId?.name || 'Company not specified'}
                                                </h5>
                                                <div className="location-info text-muted">
                                                    <i className="fa fa-map-marker-alt me-2"></i>
                                                    {job.jobLocationId ? 
                                                        `${job.jobLocationId.city}, ${job.jobLocationId.state}` : 
                                                        'Location not specified'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Recruiter Actions - Right Aligned */}
                                        {user?.userType === 'Recruiter' && (
                                            <div className="recruiter-actions ms-3">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="me-2 mb-2"
                                                    onClick={handleEditJob}
                                                    disabled={actionLoading}
                                                >
                                                    <i className="fa fa-edit me-2"></i>
                                                    Edit Job
                                                </Button>
                                                
                                                <Button
                                                    variant="outline-danger"
                                                    size="lg"
                                                    className="mb-2"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    disabled={actionLoading}
                                                >
                                                    <i className="fa fa-trash me-2"></i>
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Job Tags */}
                                    <div className="job-tags">
                                        {job.jobType && (
                                            <span className="badge bg-primary me-2 mb-2">
                                                <i className="fa fa-briefcase me-1"></i>
                                                {job.jobType}
                                            </span>
                                        )}
                                        {job.remote && (
                                            <span className="badge bg-success me-2 mb-2">
                                                <i className="fa fa-wifi me-1"></i>
                                                {job.remote}
                                            </span>
                                        )}
                                        {job.salary && (
                                            <span className="badge bg-warning text-dark me-2 mb-2">
                                                <i className="fa fa-dollar-sign me-1"></i>
                                                {job.salary}
                                            </span>
                                        )}
                                        <span className="badge bg-secondary me-2 mb-2">
                                            <i className="fa fa-calendar me-1"></i>
                                            Posted {formatDate(job.postedDate)}
                                        </span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Row>
                    {/* Left Column - Job Details */}
                    <Col lg={user?.userType === 'Recruiter' ? 8 : 12}>
                        {/* Job Specifications */}
                        <Card className="job-specs-card mb-4 border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <h4 className="section-title mb-4">
                                    <i className="fa fa-info-circle me-2 text-primary"></i>
                                    Job Information
                                </h4>
                                
                                <Row className="job-specs-grid">
                                    <Col md={6} lg={3} className="mb-3">
                                        <div className="spec-card">
                                            <div className="spec-icon">
                                                <i className="fa fa-calendar-alt"></i>
                                            </div>
                                            <div className="spec-content">
                                                <label className="spec-label">Date Posted</label>
                                                <span className="spec-value">{formatDate(job.postedDate)}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    
                                    <Col md={6} lg={3} className="mb-3">
                                        <div className="spec-card">
                                            <div className="spec-icon">
                                                <i className="fa fa-dollar-sign"></i>
                                            </div>
                                            <div className="spec-content">
                                                <label className="spec-label">Salary</label>
                                                <span className="spec-value">{job.salary || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    
                                    <Col md={6} lg={3} className="mb-3">
                                        <div className="spec-card">
                                            <div className="spec-icon">
                                                <i className="fa fa-briefcase"></i>
                                            </div>
                                            <div className="spec-content">
                                                <label className="spec-label">Job Type</label>
                                                <span className="spec-value">{job.jobType || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    
                                    <Col md={6} lg={3} className="mb-3">
                                        <div className="spec-card">
                                            <div className="spec-icon">
                                                <i className="fa fa-wifi"></i>
                                            </div>
                                            <div className="spec-content">
                                                <label className="spec-label">Work Type</label>
                                                <span className="spec-value">{job.remote || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Job Description */}
                        <Card className="job-description-card border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <h4 className="section-title mb-4">
                                    <i className="fa fa-file-alt me-2 text-primary"></i>
                                    Job Description
                                </h4>
                                <div 
                                    className="job-description-content"
                                    dangerouslySetInnerHTML={{ __html: job.descriptionOfJob || '<p class="text-muted">No description provided.</p>' }}
                                />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Candidates Sidebar (Recruiter Only) */}
                    {user?.userType === 'Recruiter' && (
                        <Col lg={4}>
                            <Card className="candidates-sidebar-card border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="candidates-header mb-4">
                                        <h5 className="section-title mb-0">
                                            <i className="fa fa-users me-2 text-primary"></i>
                                            Applications
                                            <span className="badge bg-primary ms-2">{candidates.length}</span>
                                        </h5>
                                    </div>
                                    
                                    {candidates.length > 0 ? (
                                        <div className="candidates-list">
                                            {candidates.map((candidate, index) => (
                                                <div key={index} className="candidate-card mb-3">
                                                    <Link 
                                                        to={`/job-seeker-profile/${candidate.userId?.userAccountId}`}
                                                        className="candidate-link text-decoration-none"
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <div className="candidate-avatar me-3">
                                                                <i className="fa fa-user-circle fa-2x text-primary"></i>
                                                            </div>
                                                            <div className="candidate-info">
                                                                <h6 className="candidate-name mb-1">
                                                                    {candidate.userId ? 
                                                                        `${candidate.userId.firstName} ${candidate.userId.lastName}` : 
                                                                        'Anonymous User'
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    <i className="fa fa-clock me-1"></i>
                                                                    Applied recently
                                                                </small>
                                                            </div>
                                                            <div className="ms-auto">
                                                                <i className="fa fa-chevron-right text-muted"></i>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-candidates text-center py-4">
                                            <i className="fa fa-users fa-3x text-muted mb-3"></i>
                                            <h6 className="text-muted mb-2">No Applications Yet</h6>
                                            <p className="text-muted small mb-0">
                                                When candidates apply for this job, they'll appear here.
                                            </p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                </Row>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fa fa-exclamation-triangle text-danger me-2"></i>
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this job posting?</p>
                    <p><strong>"{job?.jobTitle}"</strong></p>
                    <p className="text-muted">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteJob}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-trash me-2"></i>
                                Delete Job
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default JobDetailsPage;