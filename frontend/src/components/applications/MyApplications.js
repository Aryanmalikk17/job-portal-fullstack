import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import { jobService } from '../../services/jobService';

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
            const data = await jobService.getMyApplications();
            setApplications(data);
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

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'primary';
            case 'REVIEWED': return 'info';
            case 'INTERVIEW': return 'warning';
            case 'ACCEPTED': return 'success';
            case 'REJECTED': return 'danger';
            case 'WITHDRAWN': return 'secondary';
            default: return 'secondary';
        }
    };

    // Format date
    const formatDate = (dateString) => {
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
            const response = await jobService.withdrawApplication(selectedApplication.id);
            
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
        <Container className="my-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i className="fas fa-briefcase me-2 text-primary"></i>
                            My Job Applications
                        </h2>
                        <Button 
                            variant="outline-primary" 
                            onClick={fetchMyApplications}
                            disabled={loading}
                        >
                            <i className="fas fa-sync-alt me-2"></i>
                            Refresh
                        </Button>
                    </div>

                    {/* Filter Controls */}
                    <Card className="mb-4">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Filter by Status:</Form.Label>
                                        <Form.Select 
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
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
                                    <div className="text-muted">
                                        Total Applications: <strong>{applications.length}</strong>
                                        {filterStatus !== 'ALL' && (
                                            <span className="ms-2">
                                                | Filtered: <strong>{filteredApplications.length}</strong>
                                            </span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading your applications...</p>
                        </div>
                    )}

                    {/* Applications List */}
                    {!loading && (
                        <>
                            {filteredApplications.length === 0 ? (
                                <Card className="text-center py-5">
                                    <Card.Body>
                                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">
                                            {filterStatus === 'ALL' 
                                                ? 'No Applications Yet' 
                                                : `No ${filterStatus.toLowerCase()} applications`
                                            }
                                        </h5>
                                        <p className="text-muted">
                                            {filterStatus === 'ALL' 
                                                ? 'Start applying to jobs to see your applications here.'
                                                : 'Try changing the filter to see other applications.'
                                            }
                                        </p>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <Row>
                                    {filteredApplications.map((application) => (
                                        <Col lg={6} key={application.id} className="mb-4">
                                            <Card className="h-100 application-card">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div>
                                                            <h5 className="mb-1">
                                                                {application.jobTitle || 'Job Title'}
                                                            </h5>
                                                            <p className="text-muted mb-0">
                                                                <i className="fas fa-building me-2"></i>
                                                                {application.companyName || 'Company Name'}
                                                            </p>
                                                        </div>
                                                        <Badge bg={getStatusVariant(application.status)}>
                                                            {application.status}
                                                        </Badge>
                                                    </div>

                                                    {application.jobLocation && (
                                                        <p className="text-muted mb-2">
                                                            <i className="fas fa-map-marker-alt me-2"></i>
                                                            {application.jobLocation}
                                                        </p>
                                                    )}

                                                    <div className="mb-3">
                                                        <small className="text-muted">
                                                            <strong>Applied:</strong> {formatDate(application.applyDate)}
                                                        </small>
                                                    </div>

                                                    {application.coverLetter && (
                                                        <div className="mb-3">
                                                            <small className="text-muted d-block mb-1">
                                                                <strong>Cover Letter:</strong>
                                                            </small>
                                                            <div className="cover-letter-preview">
                                                                {application.coverLetter.length > 150 
                                                                    ? `${application.coverLetter.substring(0, 150)}...`
                                                                    : application.coverLetter
                                                                }
                                                            </div>
                                                        </div>
                                                    )}

                                                    {application.recruiterNotes && (
                                                        <div className="mb-3 p-2 bg-light rounded">
                                                            <small className="text-muted d-block mb-1">
                                                                <strong>Recruiter Notes:</strong>
                                                            </small>
                                                            <small>{application.recruiterNotes}</small>
                                                        </div>
                                                    )}

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">
                                                            Application ID: {application.id}
                                                        </small>
                                                        
                                                        {application.status === 'PENDING' && (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setShowWithdrawModal(true);
                                                                }}
                                                            >
                                                                <i className="fas fa-times me-1"></i>
                                                                Withdraw
                                                            </Button>
                                                        )}
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
            <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Withdraw Application</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to withdraw your application for{' '}
                        <strong>{selectedApplication?.jobTitle}</strong>?
                    </p>
                    <p className="text-muted">
                        This action cannot be undone. You will need to apply again if you change your mind.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowWithdrawModal(false)}
                        disabled={withdrawing}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                    >
                        {withdrawing ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Withdrawing...
                            </>
                        ) : (
                            'Withdraw Application'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .application-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    border: 1px solid #e9ecef;
                }
                
                .application-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .cover-letter-preview {
                    font-size: 0.875rem;
                    color: #6c757d;
                    font-style: italic;
                }
            `}</style>
        </Container>
    );
};

export default MyApplications;