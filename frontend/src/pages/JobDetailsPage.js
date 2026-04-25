import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Wifi, 
    Search, 
    Lock, 
    Server, 
    AlertTriangle, 
    RotateCcw, 
    ArrowLeft, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight, 
    Building2, 
    MapPin, 
    Edit3, 
    Trash2, 
    Briefcase, 
    DollarSign, 
    Calendar, 
    Info, 
    FileText, 
    Users, 
    UserCircle2,
    Clock,
    Rocket,
    Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
    getJobById, 
    checkJobStatus, 
    getJobCandidates, 
    applyForJob, 
    saveJob, 
    unsaveJob, 
    deleteJob 
} from '../services/jobService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
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
    const [errorType, setErrorType] = useState(null); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const loadJobDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setErrorType(null);

            // 1. Load basic job details
            const jobData = await getJobById(id);
            setJob(jobData);

            // Sequential Fetching for user-specific data to avoid 503
            await new Promise(r => setTimeout(r, 100));

            // 2. Load job status for job seekers
            if (user?.userType === 'Job Seeker') {
                try {
                    const statusData = await checkJobStatus(id);
                    setJobStatus(statusData || { alreadyApplied: false, alreadySaved: false });
                } catch (statusErr) {
                    console.warn('Failed to load job status:', statusErr);
                }
            }

            // 3. Load candidates for recruiters
            if (user?.userType === 'Recruiter') {
                try {
                    const candidatesData = await getJobCandidates(id);
                    setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
                } catch (candidatesErr) {
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

    // Helper function for API errors
    const handleApiError = (err, context) => {
        let errorMessage = 'An unexpected error occurred';
        let errorTypeCode = 'GENERAL_ERROR';

        if (err.response) {
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
            errorMessage = 'Network error. Please check your internet connection.';
            errorTypeCode = 'NETWORK_ERROR';
        } else {
            errorMessage = err.message || errorMessage;
            errorTypeCode = 'GENERAL_ERROR';
        }

        return { message: errorMessage, type: errorTypeCode };
    };

    const handleApplyJob = async () => {
        try {
            setActionLoading(true);
            await applyForJob(id);
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
                await unsaveJob(id);
                setJobStatus(prev => ({ ...prev, alreadySaved: false }));
                showNotification('Job removed from saved jobs', 'success');
            } else {
                await saveJob(id);
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
            await deleteJob(id);
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
                    return Wifi;
                case 'NOT_FOUND':
                    return Search;
                case 'UNAUTHORIZED':
                case 'FORBIDDEN':
                    return Lock;
                case 'SERVER_ERROR':
                    return Server;
                default:
                    return AlertTriangle;
            }
        };

        const Icon = getErrorIcon();

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
                        className="ms-2 d-flex align-items-center"
                    >
                        <Search size={18} className="me-2" />
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
                                <Icon size={48} className="mb-3 text-danger" />
                                <h4 className="mb-3">Oops! Something went wrong</h4>
                                <p className="mb-4">{error}</p>
                                
                                <div className="error-actions d-flex justify-content-center">
                                    <Button 
                                        variant="primary" 
                                        onClick={handleRetry}
                                        disabled={loading}
                                        className="d-flex align-items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw size={18} className="me-2" />
                                                {getRetryButtonText()}
                                            </>
                                        )}
                                    </Button>
                                    
                                    {getSecondaryAction()}
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={goBack}
                                        className="ms-2 d-flex align-items-center"
                                    >
                                        <ArrowLeft size={18} className="me-2" />
                                        Go Back
                                    </Button>
                                </div>

                                {errorType === 'NETWORK_ERROR' && (
                                    <div className="mt-3">
                                        <small className="text-muted d-flex align-items-center justify-content-center">
                                            <Info size={14} className="me-1" />
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
                            <AlertCircle size={24} className="me-2" />
                            Job not found
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    const locationCity = job.jobLocationId?.city || job.location || 'Unknown Location';
    const locationCountry = job.jobLocationId?.country || 'IN';
    const salary = job.salary || '';
    const isRemote = job.remote === 'Remote-Only' || job.remote === 'Partial-Remote';
    const companyName = job.jobCompanyId?.name || job.companyName || 'Zpluse Jobs';

    // Calculate validThrough as 30 days after datePosted
    const datePostedStr = job.postedDate
        ? new Date(job.postedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
    
    const validThroughDate = new Date(datePostedStr);
    validThroughDate.setDate(validThroughDate.getDate() + 30);
    const validThroughStr = validThroughDate.toISOString().split('T')[0] + 'T00:00:00Z';

    const plainTextDescription = (job.descriptionOfJob || '').replace(/<[^>]+>/g, '').substring(0, 155);

    const jsonLd = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: job.jobTitle || '',
        description: job.descriptionOfJob || '',
        identifier: {
            '@type': 'PropertyValue',
            name: companyName,
            value: String(job.jobPostId || ''),
        },
        datePosted: datePostedStr + 'T00:00:00Z',
        validThrough: validThroughStr,
        employmentType: (job.jobType || 'FULL_TIME').toUpperCase().replace(/[- ]/g, '_'),
        hiringOrganization: {
            '@type': 'Organization',
            name: companyName,
            sameAs: 'https://www.zplusejobs.com',
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: locationCity,
                addressCountry: locationCountry,
            },
        },
        ...(isRemote ? { jobLocationType: 'TELECOMMUTE' } : {}),
        ...(salary ? {
            baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'INR',
                value: {
                    '@type': 'QuantitativeValue',
                    value: salary,
                    unitText: 'YEAR',
                },
            },
        } : {}),
        url: `https://www.zplusejobs.com/jobs/${job.jobPostId}`,
        directApply: true,
    };

    return (
        <div className="job-details-page">
            <Helmet>
                <title>{job.jobTitle} in {locationCity} | {companyName} Careers | Zpluse Jobs</title>
                <meta name="description" content={plainTextDescription} />
                <meta property="og:title" content={`${job.jobTitle} at ${companyName}`} />
                <meta property="og:description" content={plainTextDescription} />
                <meta property="og:url" content={`https://www.zplusejobs.com/jobs/${job.jobPostId}`} />
                <meta property="og:type" content="website" />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>
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
                            {notification.type === 'success' ? <CheckCircle2 size={18} className="me-3" /> : <AlertCircle size={18} className="me-3" />}
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
                            className="back-btn me-3 d-flex align-items-center" 
                            onClick={goBack}
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Back
                        </Button>
                        
                        <div className="page-breadcrumb text-muted">
                            <small className="d-flex align-items-center">
                                <Link to="/dashboard" className="text-decoration-none">Dashboard</Link>
                                <ChevronRight size={14} className="mx-2" />
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
                                                <Building2 size={32} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h1 className="job-title mb-3">{job.jobTitle}</h1>
                                            <div className="company-info mb-3">
                                                <h5 className="company-name mb-2">
                                                    <Link 
                                                        to={`/companies/${job.postedBy?.userId || job.postedById?.userId}`} 
                                                        className="text-primary text-decoration-none hover-underline"
                                                    >
                                                        {job.jobCompanyId?.name || job.companyName || 'Company not specified'}
                                                    </Link>
                                                </h5>
                                                <div className="location-info text-muted d-flex align-items-center">
                                                    <MapPin size={16} className="me-2" />
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
                                                    className="me-2 mb-2 d-flex align-items-center"
                                                    onClick={handleEditJob}
                                                    disabled={actionLoading}
                                                >
                                                    <Edit3 size={18} className="me-2" />
                                                    Edit Job
                                                </Button>
                                                
                                                <Button
                                                    variant="outline-danger"
                                                    size="lg"
                                                    className="mb-2 d-flex align-items-center"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    disabled={actionLoading}
                                                >
                                                    <Trash2 size={18} className="me-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}

                                        {/* Job Seeker Actions - Right Aligned */}
                                        {user?.userType === 'Job Seeker' && (
                                            <div className="job-seeker-actions ms-3">
                                                <Button
                                                    variant={jobStatus.alreadyApplied ? "success" : "primary"}
                                                    size="lg"
                                                    className="me-2 mb-2 d-flex align-items-center"
                                                    onClick={handleApplyJob}
                                                    disabled={actionLoading || jobStatus.alreadyApplied}
                                                >
                                                    {jobStatus.alreadyApplied ? (
                                                        <><CheckCircle2 size={18} className="me-2" /> Applied</>
                                                    ) : (
                                                        <><Rocket size={18} className="me-2" /> Apply Now</>
                                                    )}
                                                </Button>
                                                
                                                <Button
                                                    variant={jobStatus.alreadySaved ? "warning" : "outline-primary"}
                                                    size="lg"
                                                    className="mb-2 d-flex align-items-center"
                                                    onClick={handleSaveJob}
                                                    disabled={actionLoading}
                                                >
                                                    {jobStatus.alreadySaved ? (
                                                        <><Heart size={18} className="me-2 fill-current" /> Saved</>
                                                    ) : (
                                                        <><Heart size={18} className="me-2" /> Save Job</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Job Tags */}
                                    <div className="job-tags">
                                        {job.jobType && (
                                            <span className="badge bg-primary me-2 mb-2 d-inline-flex align-items-center">
                                                <Briefcase size={14} className="me-1" />
                                                {job.jobType}
                                            </span>
                                        )}
                                        {job.remote && (
                                            <span className="badge bg-success me-2 mb-2 d-inline-flex align-items-center">
                                                <Wifi size={14} className="me-1" />
                                                {job.remote}
                                            </span>
                                        )}
                                        {job.salary && (
                                            <span className="badge bg-warning text-dark me-2 mb-2 d-inline-flex align-items-center">
                                                <DollarSign size={14} className="me-1" />
                                                {job.salary}
                                            </span>
                                        )}
                                        <span className="badge bg-secondary me-2 mb-2 d-inline-flex align-items-center">
                                            <Calendar size={14} className="me-1" />
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
                                <h2 className="section-title mb-4 d-flex align-items-center">
                                    <Info size={24} className="me-2 text-primary" />
                                    Job Information
                                </h2>
                                
                                <Row className="job-specs-grid">
                                    <Col md={6} lg={3} className="mb-3">
                                        <div className="spec-card">
                                            <div className="spec-icon">
                                                <Calendar size={20} />
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
                                                <DollarSign size={20} />
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
                                                <Briefcase size={20} />
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
                                                <Wifi size={20} />
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
                                <h2 className="section-title mb-4 d-flex align-items-center">
                                    <FileText size={24} className="me-2 text-primary" />
                                    Job Description
                                </h2>
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
                                        <h5 className="section-title mb-0 d-flex align-items-center">
                                            <Users size={20} className="me-2 text-primary" />
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
                                                                <UserCircle2 size={32} className="text-primary" />
                                                            </div>
                                                            <div className="candidate-info">
                                                                <h6 className="candidate-name mb-1">
                                                                    {candidate.userId ? 
                                                                        `${candidate.userId.firstName} ${candidate.userId.lastName}` : 
                                                                        'Anonymous User'
                                                                    }
                                                                </h6>
                                                                <small className="text-muted d-flex align-items-center">
                                                                    <Clock size={12} className="me-1" />
                                                                    Applied recently
                                                                </small>
                                                            </div>
                                                            <div className="ms-auto">
                                                                <ChevronRight size={16} className="text-muted" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-candidates text-center py-4">
                                            <Users size={48} className="text-muted mb-3" />
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
                    <Modal.Title className="d-flex align-items-center">
                        <AlertTriangle size={24} className="text-danger me-2" />
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
                        className="d-flex align-items-center"
                    >
                        {actionLoading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} className="me-2" />
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