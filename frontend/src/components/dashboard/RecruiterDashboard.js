import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Alert, Tab, Tabs, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    getRecruiterJobs 
} from '../../services/jobService';
import { 
    getRecruiterApplications, 
    getRecruiterStatistics 
} from '../../services/applicationService';
import LoadingSpinner from '../common/LoadingSpinner';
import ApplicationStatusManager from '../applications/ApplicationStatusManager';
import StatsCard from './StatsCard';
import { 
    Plus, 
    Briefcase, 
    Users, 
    Calendar, 
    UserCheck, 
    AlertCircle,
    Eye,
    Edit,
    FileText,
    MapPin,
    Home,
    DollarSign,
    AlertTriangle,
    RefreshCcw,
    Building2,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

const RecruiterDashboard = ({ user }) => {
    const navigate = useNavigate();
    
    // State management
    const [applications, setApplications] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mainTab, setMainTab] = useState('jobs'); 


    // Load initial data
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Sequential Fetching to prevent 503
                await loadApplicationsData();
                await new Promise(r => setTimeout(r, 100));
                await loadStatistics();
                await new Promise(r => setTimeout(r, 100));
                await loadPostedJobs();
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const loadApplicationsData = async () => {
        try {
            const response = await getRecruiterApplications();
            setApplications(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading applications:', err);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await getRecruiterStatistics();
            setStatistics(stats || {});
        } catch (err) {
            console.error('Error loading statistics:', err);
        }
    };

    const loadPostedJobs = async () => {
        try {
            setJobsLoading(true);
            const response = await getRecruiterJobs();
            setPostedJobs(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading posted jobs:', err);
        } finally {
            setJobsLoading(false);
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
    };



    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const getJobStatus = (job) => {
        const isActive = job.isActive !== undefined ? job.isActive : job.active;
        return isActive ? 'Active' : 'Inactive';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="recruiter-dashboard container-fluid px-4 py-5">
            {/* Welcome Header */}
            <div className="dashboard-header mb-5">
                <Card className="welcome-card border-0 shadow-sm overflow-hidden rounded-4">
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            <Col md={8} className="p-5">
                                <div className="welcome-content">
                                    <Badge bg="soft-primary" className="text-primary mb-3 px-3 py-2 rounded-pill fw-bold">
                                        <TrendingUp size={14} className="me-2" /> Recruiter Insights
                                    </Badge>
                                    <h1 className="display-5 fw-bold text-dark mb-2">
                                        Welcome back, {user?.firstName}! 👋
                                    </h1>
                                    <p className="lead text-muted mb-0">
                                        Your talent acquisition hub is ready. Manage job postings and track candidate progress.
                                    </p>
                                </div>
                            </Col>
                            <Col md={4} className="welcome-action-col d-flex align-items-center justify-content-center p-5 bg-light border-start">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/jobs/create')}
                                    className="d-flex align-items-center px-4 py-3 shadow rounded-3 fw-bold"
                                    size="lg"
                                >
                                    <Plus className="me-2" size={24} />
                                    Post a New Job
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>

            {/* Enhanced Statistics Cards */}
            <Row className="mb-5 g-4">
                <Col lg={3} sm={6}>
                    <StatsCard 
                        title="Posted Jobs" 
                        value={postedJobs.length || 0} 
                        icon={Briefcase} 
                        color="primary" 
                    />
                </Col>
                <Col lg={3} sm={6}>
                    <StatsCard 
                        title="Total Applications" 
                        value={statistics.totalApplications || 0} 
                        icon={Users} 
                        color="info" 
                    />
                </Col>
                <Col lg={3} sm={6}>
                    <StatsCard 
                        title="Interviews" 
                        value={statistics.INTERVIEW_SCHEDULED || 0} 
                        icon={Calendar} 
                        color="warning" 
                    />
                </Col>
                <Col lg={3} sm={6}>
                    <StatsCard 
                        title="Hired" 
                        value={statistics.HIRED || 0} 
                        icon={UserCheck} 
                        color="success" 
                    />
                </Col>
            </Row>

            {/* Error Message */}
            {error && (
                <Alert variant="danger" className="mb-4 border-0 shadow-sm d-flex align-items-center rounded-3">
                    <AlertCircle className="me-3" size={24} />
                    <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">Dashboard Error</h6>
                        <p className="mb-0 small">{error}</p>
                    </div>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-3 px-3"
                        onClick={loadApplicationsData}
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

            {/* Main Dashboard Tabs */}
            <Card className="dashboard-main-card border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 p-0">
                    <Tabs
                        activeKey={mainTab}
                        onSelect={(key) => setMainTab(key)}
                        className="dashboard-main-tabs d-flex border-bottom"
                    >
                        <Tab eventKey="jobs" title={
                            <div className="d-flex align-items-center">
                                <Briefcase className="me-2" size={18} />
                                My Posted Jobs
                                <Badge bg="soft-primary" className="text-primary ms-2 px-2 py-1">{postedJobs.length}</Badge>
                            </div>
                        }>
                            {/* Posted Jobs Content */}
                            <div className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold text-dark mb-0">Job Postings Pipeline</h4>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={loadPostedJobs}
                                        disabled={jobsLoading}
                                        className="d-flex align-items-center px-3"
                                    >
                                        <RefreshCcw size={14} className={`me-2 ${jobsLoading ? 'spin-animation' : ''}`} />
                                        Refresh Postings
                                    </Button>
                                </div>

                                {jobsLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                                        <p className="mt-3 text-muted">Syncing job data...</p>
                                    </div>
                                ) : postedJobs.length > 0 ? (
                                    <Row className="g-4">
                                        {postedJobs.map((job) => (
                                            <Col lg={6} key={job.jobPostId}>
                                                <Card className="job-card h-100 border-0 shadow-sm rounded-4 hover-shadow">
                                                    <Card.Body className="p-4">
                                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                                            <div className="d-flex">
                                                                <div className="bg-soft-primary p-3 rounded-3 me-3">
                                                                    <Building2 size={24} className="text-primary" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="fw-bold text-dark mb-1">
                                                                        {job.jobTitle}
                                                                    </h5>
                                                                    <p className="text-muted mb-0 small fw-medium">
                                                                        {job.jobCompany?.name || 'Company Name'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge 
                                                                bg={null}
                                                                className={`px-3 py-2 rounded-pill status-badge-${getJobStatus(job).toLowerCase()}`}
                                                            >
                                                                {getJobStatus(job)}
                                                            </Badge>
                                                        </div>

                                                        <div className="job-meta-grid mb-4">
                                                            <Row className="g-3 small text-muted">
                                                                <Col xs={6} className="d-flex align-items-center">
                                                                    <MapPin className="me-2 text-primary" size={14} />
                                                                    {job.jobLocation?.city}, {job.jobLocation?.state}
                                                                </Col>
                                                                <Col xs={6} className="d-flex align-items-center">
                                                                    <Briefcase className="me-2 text-primary" size={14} />
                                                                    {job.jobType}
                                                                </Col>
                                                                <Col xs={6} className="d-flex align-items-center">
                                                                    <Home className="me-2 text-primary" size={14} />
                                                                    {job.remote}
                                                                </Col>
                                                                <Col xs={6} className="d-flex align-items-center">
                                                                    <Calendar className="me-2 text-primary" size={14} />
                                                                    Posted {formatDate(job.postedDate).split(' ')[0]}
                                                                </Col>
                                                            </Row>
                                                        </div>

                                                        {job.salary && (
                                                            <div className="salary-box mb-4 p-2 bg-light rounded-3 d-inline-flex align-items-center">
                                                                <DollarSign className="text-success me-1" size={16} />
                                                                <span className="text-success fw-bold small">{job.salary}</span>
                                                            </div>
                                                        )}

                                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="px-3"
                                                                    onClick={() => handleViewJobDetails(job.jobPostId)}
                                                                >
                                                                    <Eye className="me-2" size={14} /> View
                                                                </Button>
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="px-3"
                                                                    onClick={() => handleEditJob(job.jobPostId)}
                                                                >
                                                                    <Edit className="me-2" size={14} /> Edit
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                className="px-4 shadow-sm fw-bold d-flex align-items-center"
                                                                onClick={() => handleViewJobApplications(job.jobPostId)}
                                                            >
                                                                Manage Candidates <ChevronRight size={14} className="ms-1" />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="bg-light p-4 rounded-circle d-inline-flex mb-4">
                                            <Briefcase className="text-muted" size={48} strokeWidth={1} />
                                        </div>
                                        <h4 className="fw-bold">No Jobs Posted Yet</h4>
                                        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                                            Start your recruitment journey by posting your first job opening to attract the best talent.
                                        </p>
                                        <Button variant="primary" className="px-4 py-2" onClick={() => navigate('/jobs/create')}>
                                            Post Your First Job
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Tab>

                        <Tab eventKey="applications" title={
                            <div className="d-flex align-items-center">
                                <FileText className="me-2" size={18} />
                                Application Management
                                <Badge bg="soft-info" className="text-info ms-2 px-2 py-1">{applications.length}</Badge>
                            </div>
                        }>
                            <div className="p-4">
                                {user ? (
                                    <ApplicationStatusManager 
                                        userType={user.userType} 
                                        userId={user.userId} 
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <AlertTriangle className="text-warning mb-3" size={64} strokeWidth={1} />
                                        <h4>Authentication Required</h4>
                                        <p className="text-muted">Please log in with recruiter credentials to access this section.</p>
                                    </div>
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Header>
            </Card>




            <style jsx>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .bg-soft-primary { background-color: rgba(52, 193, 217, 0.1); }
                .bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }

                .dashboard-main-tabs { border-bottom: 2px solid #f8f9fa; }
                
                .dashboard-main-tabs :global(.nav-link) {
                    font-weight: 700;
                    color: #6c757d;
                    border: none;
                    padding: 1.5rem 2rem;
                    transition: all 0.2s;
                    position: relative;
                }

                .dashboard-main-tabs :global(.nav-link.active) {
                    color: #34C1D9;
                    background-color: transparent;
                }

                .dashboard-main-tabs :global(.nav-link.active::after) {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background-color: #34C1D9;
                }

                .job-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }

                .status-badge-active {
                    background-color: #f0fff4;
                    color: #276749;
                    font-weight: 700;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                }

                .status-badge-inactive {
                    background-color: #f7fafc;
                    color: #4a5568;
                    font-weight: 700;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                }

                .job-meta-grid {
                    background-color: #fdfdfd;
                    padding: 1rem;
                    border-radius: 12px;
                }
            `}</style>
        </div>
    );
};

export default RecruiterDashboard;