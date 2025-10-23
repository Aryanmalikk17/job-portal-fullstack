import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';

const ApplicationDetailsModal = ({ 
    show, 
    onHide, 
    application, 
    onUpdateStatus, 
    formatDate, 
    getStatusBadgeVariant 
}) => {
    if (!application) return null;

    const getStatusTimeline = (status) => {
        const allStatuses = [
            'APPLIED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 
            'INTERVIEWED', 'OFFERED', 'HIRED'
        ];
        
        const currentIndex = allStatuses.indexOf(status);
        
        return allStatuses.map((statusItem, index) => ({
            status: statusItem,
            isActive: index <= currentIndex,
            isCurrent: statusItem === status
        }));
    };

    const timeline = application.status !== 'REJECTED' && application.status !== 'WITHDRAWN' 
        ? getStatusTimeline(application.status) 
        : [];

    return (
        <Modal 
            show={show} 
            onHide={onHide}
            size="lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-user-circle me-2 text-primary"></i>
                    Application Details
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Applicant Information */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">
                            <i className="fas fa-user me-2"></i>
                            Applicant Information
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <div className="applicant-info">
                                    <h5 className="text-primary mb-1">{application.applicantName}</h5>
                                    <p className="text-muted mb-2">
                                        <i className="fas fa-envelope me-2"></i>
                                        <a href={`mailto:${application.applicantEmail}`} className="text-decoration-none">
                                            {application.applicantEmail}
                                        </a>
                                    </p>
                                </div>
                            </Col>
                            <Col md={6} className="text-end">
                                <Badge 
                                    bg={getStatusBadgeVariant(application.status)}
                                    className="status-badge-large px-3 py-2"
                                >
                                    <i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>
                                    {application.status?.replace(/_/g, ' ')}
                                </Badge>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Job Information */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">
                            <i className="fas fa-briefcase me-2"></i>
                            Job Information
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <h6 className="text-primary mb-2">{application.jobTitle}</h6>
                        <p className="text-muted mb-0">
                            <i className="fas fa-building me-2"></i>
                            {application.companyName}
                        </p>
                    </Card.Body>
                </Card>

                {/* Application Timeline */}
                {timeline.length > 0 && (
                    <Card className="mb-4">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">
                                <i className="fas fa-clock me-2"></i>
                                Application Progress
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="timeline-container">
                                <div className="timeline">
                                    {timeline.map((item, index) => (
                                        <div 
                                            key={item.status}
                                            className={`timeline-item ${item.isActive ? 'active' : ''} ${item.isCurrent ? 'current' : ''}`}
                                        >
                                            <div className="timeline-marker">
                                                <i className={`fas ${item.isActive ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                            </div>
                                            <div className="timeline-content">
                                                <span className={`timeline-label ${item.isCurrent ? 'fw-bold' : ''}`}>
                                                    {item.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Application Details */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">
                            <i className="fas fa-info-circle me-2"></i>
                            Application Details
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <strong>Application Date:</strong>
                                <p className="mb-0 text-muted">{formatDate(application.applyDate)}</p>
                            </Col>
                            <Col md={6}>
                                <strong>Last Updated:</strong>
                                <p className="mb-0 text-muted">{formatDate(application.lastUpdated)}</p>
                            </Col>
                        </Row>

                        {/* Cover Letter */}
                        {application.coverLetter && (
                            <div className="cover-letter-section">
                                <strong className="d-block mb-2">Cover Letter:</strong>
                                <div className="cover-letter-content p-3 bg-light rounded border-start border-4 border-primary">
                                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {application.coverLetter}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Resume */}
                        {application.resumePath && (
                            <div className="resume-section mt-3">
                                <strong className="d-block mb-2">Resume:</strong>
                                <div className="resume-link p-2 bg-light rounded">
                                    <i className="fas fa-file-pdf me-2 text-danger"></i>
                                    <a href={application.resumePath} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                        View Resume
                                    </a>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Recruiter Notes */}
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <h6 className="mb-0">
                            <i className="fas fa-sticky-note me-2"></i>
                            Your Notes
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        {application.recruiterNotes ? (
                            <div className="recruiter-notes-content p-3 bg-info bg-opacity-10 rounded border-start border-4 border-info">
                                <p className="mb-0 text-info" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {application.recruiterNotes}
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted mb-0 text-center py-3">
                                <i className="fas fa-edit me-2"></i>
                                No notes added yet. Click "Update Status" to add notes.
                            </p>
                        )}
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Application ID: #{application.id}
                    </small>
                </div>
                <div>
                    <Button 
                        variant="secondary" 
                        onClick={onHide}
                        className="me-2"
                    >
                        Close
                    </Button>
                    
                    {application.status !== 'HIRED' && application.status !== 'REJECTED' && application.status !== 'WITHDRAWN' && (
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                onUpdateStatus(application);
                                onHide();
                            }}
                        >
                            <i className="fas fa-edit me-2"></i>
                            Update Status
                        </Button>
                    )}
                </div>
            </Modal.Footer>

            <style jsx>{`
                .status-badge-large {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                .timeline-container {
                    overflow-x: auto;
                    padding: 1rem 0;
                }
                
                .timeline {
                    display: flex;
                    align-items: center;
                    min-width: 600px;
                    position: relative;
                }
                
                .timeline-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                
                .timeline-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 60%;
                    width: 80%;
                    height: 2px;
                    background: #dee2e6;
                    z-index: 1;
                }
                
                .timeline-item.active:not(:last-child)::after {
                    background: #198754;
                }
                
                .timeline-marker {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 2px solid #dee2e6;
                    color: #6c757d;
                    font-size: 0.8rem;
                    z-index: 2;
                    position: relative;
                }
                
                .timeline-item.active .timeline-marker {
                    border-color: #198754;
                    color: #198754;
                }
                
                .timeline-item.current .timeline-marker {
                    background: #198754;
                    color: white;
                    animation: pulse 2s infinite;
                }
                
                .timeline-label {
                    margin-top: 0.5rem;
                    font-size: 0.8rem;
                    text-align: center;
                    color: #6c757d;
                    white-space: nowrap;
                }
                
                .timeline-item.active .timeline-label {
                    color: #198754;
                }
                
                .timeline-item.current .timeline-label {
                    color: #198754;
                    font-weight: bold;
                }
                
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
                }
                
                .cover-letter-content,
                .recruiter-notes-content {
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .card-header {
                    border-bottom: 1px solid #dee2e6;
                }
            `}</style>
        </Modal>
    );
};

export default ApplicationDetailsModal;