import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import { 
    Briefcase, 
    RefreshCcw, 
    AlertCircle, 
    Inbox, 
    Building2, 
    MapPin, 
    FileText,
    MessageSquare,
    ChevronRight,
    Trash2
} from 'lucide-react';
import { getMyApplications, withdrawApplication } from '../../services/applicationService';
import { getStatusIcon, getStatusLabel } from '../../utils/statusHelpers';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);

    // Fetch user's applications on component mount
    useEffect(() => {
        fetchMyApplications();
    }, []);

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const data = await getMyApplications();
            setApplications(data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch your applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter applications by status
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'ALL') return true;
        return app.status === filterStatus;
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle withdraw application
    const handleWithdraw = async () => {
        try {
            setWithdrawing(true);
            const response = await withdrawApplication(selectedApplication.id);
            
            if (response.success) {
                // Update local state
                setApplications(prev => prev.map(app => 
                    app.id === selectedApplication.id 
                        ? { ...app, status: 'WITHDRAWN' }
                        : app
                ));
                setShowWithdrawModal(false);
                setSelectedApplication(null);
            } else {
                setError(response.message || 'Failed to withdraw application');
            }
        } catch (error) {
            console.error('Error withdrawing application:', error);
            setError('Failed to withdraw application. Please try again.');
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <Container className="my-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <h2 className="fw-bold d-flex align-items-center">
                            <Briefcase size={32} className="me-3 text-primary" />
                            My Job Applications
                        </h2>
                        <Button 
                            variant="outline-primary" 
                            className="d-flex align-items-center px-4 py-2 shadow-sm"
                            onClick={fetchMyApplications}
                            disabled={loading}
                        >
                            <RefreshCcw size={18} className={`me-2 ${loading ? 'spin-animation' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Filter Controls */}
                    <Card className="mb-5 border-0 shadow-sm glass-card rounded-4">
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Filter by Status:</Form.Label>
                                        <Form.Select 
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="border-light bg-light py-2"
                                        >
                                            <option value="ALL">All Applications</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="REVIEWED">Under Review</option>
                                            <option value="INTERVIEW">Interview</option>
                                            <option value="ACCEPTED">Accepted</option>
                                            <option value="REJECTED">Rejected</option>
                                            <option value="WITHDRAWN">Withdrawn</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="text-end">
                                    <div className="text-muted small">
                                        Total Applications: <strong className="text-dark">{applications.length}</strong>
                                        {filterStatus !== 'ALL' && (
                                            <span className="ms-2">
                                                | Filtered: <strong className="text-primary">{filteredApplications.length}</strong>
                                            </span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center mb-4" dismissible onClose={() => setError(null)}>
                            <AlertCircle size={20} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-3 text-muted fw-medium">Loading your applications...</p>
                        </div>
                    )}

                    {/* Applications List */}
                    {!loading && (
                        <>
                            {filteredApplications.length === 0 ? (
                                <Card className="text-center py-5 border-0 shadow-sm glass-card rounded-4">
                                    <Card.Body>
                                        <div className="text-muted mb-3 d-flex justify-content-center">
                                            <Inbox size={64} strokeWidth={1} />
                                        </div>
                                        <h4 className="fw-bold text-dark mb-3">
                                            {filterStatus === 'ALL' 
                                                ? 'No Applications Yet' 
                                                : `No ${filterStatus.toLowerCase()} applications`
                                            }
                                        </h4>
                                        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                                            {filterStatus === 'ALL' 
                                                ? 'Start your career journey today! Browse open positions and apply to your dream job.'
                                                : 'Try changing the filter or search to see other applications in your history.'
                                            }
                                        </p>
                                        {filterStatus === 'ALL' && (
                                            <Button variant="primary" className="px-4 py-2" href="/jobs">
                                                Browse Jobs <ChevronRight size={16} className="ms-1" />
                                            </Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            ) : (
                                <Row className="g-4">
                                    {filteredApplications.map((application) => (
                                        <Col lg={6} key={application.id}>
                                            <Card className="h-100 border-0 shadow-sm application-card rounded-4 overflow-hidden">
                                                <Card.Body className="p-4">
                                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                                        <div className="d-flex">
                                                            <div className="bg-light p-3 rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                                <Building2 size={28} className="text-primary" />
                                                            </div>
                                                            <div>
                                                                <h5 className="fw-bold text-dark mb-1">
                                                                    {application.jobTitle || 'Job Title'}
                                                                </h5>
                                                                <p className="text-muted mb-0 fw-medium d-flex align-items-center">
                                                                    {application.companyName || 'Company Name'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge 
                                                            bg={null} 
                                                            className={`status-badge d-flex align-items-center status-${application.status.toLowerCase()}`}
                                                        >
                                                            <span className="me-1 d-flex align-items-center">
                                                                {getStatusIcon(application.status, 12)}
                                                            </span>
                                                            {getStatusLabel(application.status)}
                                                        </Badge>
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-3 mb-4">
                                                        {application.jobLocation && (
                                                            <div className="d-flex align-items-center text-muted small bg-light px-2 py-1 rounded">
                                                                <MapPin size={14} className="me-1" />
                                                                {application.jobLocation}
                                                            </div>
                                                        )}
                                                        <div className="d-flex align-items-center text-muted small bg-light px-2 py-1 rounded">
                                                            <FileText size={14} className="me-1" />
                                                            Applied: {formatDate(application.applyDate)}
                                                        </div>
                                                    </div>

                                                    {application.coverLetter && (
                                                        <div className="mb-4">
                                                            <div className="small fw-bold text-muted text-uppercase mb-2 d-flex align-items-center">
                                                                <FileText size={14} className="me-1" /> Cover Letter Preview
                                                            </div>
                                                            <div className="cover-letter-preview p-3 bg-light rounded-3 border-start border-4 border-primary shadow-sm">
                                                                {application.coverLetter.length > 180 
                                                                    ? `${application.coverLetter.substring(0, 180)}...`
                                                                    : application.coverLetter
                                                                }
                                                            </div>
                                                        </div>
                                                    )}

                                                    {application.recruiterNotes && (
                                                        <div className="mb-4 p-3 bg-soft-info rounded-3 border-start border-4 border-info shadow-sm">
                                                            <div className="small fw-bold text-info text-uppercase mb-1 d-flex align-items-center">
                                                                <MessageSquare size={14} className="me-1" /> Feedback from Recruiter
                                                            </div>
                                                            <div className="small text-dark fw-medium">{application.recruiterNotes}</div>
                                                        </div>
                                                    )}

                                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                                        <small className="text-muted fw-medium">
                                                            ID: #{application.id}
                                                        </small>
                                                        
                                                        <div className="d-flex gap-2">
                                                            <Button variant="light" size="sm" className="px-3" href={`/jobs/${application.jobId}`}>
                                                                View Job
                                                            </Button>
                                                            {application.status === 'PENDING' && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    className="px-3 d-flex align-items-center"
                                                                    onClick={() => {
                                                                        setSelectedApplication(application);
                                                                        setShowWithdrawModal(true);
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} className="me-1" />
                                                                    Withdraw
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </>
                    )}
                </Col>
            </Row>

            {/* Withdraw Confirmation Modal */}
            <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Withdraw Application</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="text-center mb-4">
                        <div className="bg-soft-danger p-3 rounded-circle d-inline-flex mb-3">
                            <AlertCircle size={40} className="text-danger" />
                        </div>
                        <h5>Are you sure?</h5>
                        <p className="text-muted px-4">
                            You are about to withdraw your application for <br />
                            <strong className="text-dark">{selectedApplication?.jobTitle}</strong>.
                        </p>
                    </div>
                    <div className="p-3 bg-light rounded-3 mb-2 small text-muted">
                        <strong>Important:</strong> This action cannot be undone. Your profile will be removed from the recruiter's list for this position.
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button 
                        variant="light" 
                        onClick={() => setShowWithdrawModal(false)}
                        disabled={withdrawing}
                        className="px-4"
                    >
                        Keep Application
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                        className="px-4 shadow"
                    >
                        {withdrawing ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Withdrawing...
                            </>
                        ) : (
                            'Confirm Withdrawal'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .application-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid #f1f3f5;
                }
                
                .application-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
                }
                
                .cover-letter-preview {
                    font-size: 0.875rem;
                    color: #495057;
                    line-height: 1.6;
                }

                .bg-soft-info { background-color: #e3f2fd; }
                .bg-soft-danger { background-color: #ffebee; }

                .status-badge {
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .status-pending, .status-applied { background-color: #ebf8ff; color: #2b6cb0; }
                .status-reviewed, .status-under_review { background-color: #e6fffa; color: #2c7a7b; }
                .status-interview, .status-interview_scheduled { background-color: #fffaf0; color: #9c4221; }
                .status-accepted, .status-offered, .status-hired { background-color: #f0fff4; color: #276749; }
                .status-rejected { background-color: #fff5f5; color: #9b2c2c; }
                .status-withdrawn { background-color: #f7fafc; color: #4a5568; }
            `}</style>
        </Container>
    );
};

export default MyApplications;