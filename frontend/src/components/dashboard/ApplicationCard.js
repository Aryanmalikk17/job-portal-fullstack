import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';

const ApplicationCard = ({ 
    application, 
    onViewDetails, 
    onUpdateStatus, 
    formatDate, 
    getStatusBadgeVariant 
}) => {
    
    const getStatusActions = (status) => {
        const nextActions = {
            'APPLIED': ['UNDER_REVIEW', 'REJECTED'],
            'UNDER_REVIEW': ['INTERVIEW_SCHEDULED', 'REJECTED'],
            'INTERVIEW_SCHEDULED': ['INTERVIEWED', 'REJECTED'],
            'INTERVIEWED': ['OFFERED', 'REJECTED'],
            'OFFERED': ['HIRED', 'REJECTED'],
            'HIRED': [],
            'REJECTED': [],
            'WITHDRAWN': []
        };
        return nextActions[status] || [];
    };

    const quickActions = getStatusActions(application.status);

    return (
        <Card className="application-card h-100 border-start border-4" 
              style={{ borderStartColor: getStatusBadgeVariant(application.status) === 'success' ? '#198754' : 
                                       getStatusBadgeVariant(application.status) === 'danger' ? '#dc3545' : 
                                       getStatusBadgeVariant(application.status) === 'warning' ? '#ffc107' : '#0d6efd' }}>
            <Card.Body>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <h6 className="card-title mb-1 fw-bold">
                            {application.applicantName}
                        </h6>
                        <p className="text-muted mb-0 small">
                            <i className="fas fa-envelope me-1"></i>
                            {application.applicantEmail}
                        </p>
                    </div>
                    <Badge 
                        bg={getStatusBadgeVariant(application.status)}
                        className="status-badge"
                    >
                        {application.status?.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Job Information */}
                <div className="job-info mb-3">
                    <p className="mb-1 fw-semibold text-primary">
                        <i className="fas fa-briefcase me-1"></i>
                        {application.jobTitle}
                    </p>
                    <p className="mb-0 small text-muted">
                        <i className="fas fa-building me-1"></i>
                        {application.companyName}
                    </p>
                </div>

                {/* Application Details */}
                <div className="application-meta mb-3">
                    <Row className="g-2 small text-muted">
                        <Col xs={6}>
                            <i className="fas fa-calendar-plus me-1"></i>
                            Applied: {formatDate(application.applyDate)}
                        </Col>
                        <Col xs={6}>
                            <i className="fas fa-clock me-1"></i>
                            Updated: {formatDate(application.lastUpdated)}
                        </Col>
                    </Row>
                </div>

                {/* Cover Letter Preview */}
                {application.coverLetter && (
                    <div className="cover-letter-preview mb-3">
                        <small className="text-muted d-block mb-1">Cover Letter:</small>
                        <p className="small text-truncate mb-0" style={{ maxHeight: '40px', overflow: 'hidden' }}>
                            {application.coverLetter.length > 100 
                                ? `${application.coverLetter.substring(0, 100)}...`
                                : application.coverLetter
                            }
                        </p>
                    </div>
                )}

                {/* Recruiter Notes Preview */}
                {application.recruiterNotes && (
                    <div className="recruiter-notes-preview mb-3">
                        <small className="text-muted d-block mb-1">Your Notes:</small>
                        <p className="small text-info mb-0" style={{ fontStyle: 'italic' }}>
                            {application.recruiterNotes.length > 80 
                                ? `${application.recruiterNotes.substring(0, 80)}...`
                                : application.recruiterNotes
                            }
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onViewDetails(application)}
                        className="me-2"
                    >
                        <i className="fas fa-eye me-1"></i>
                        View Details
                    </Button>

                    {quickActions.length > 0 && (
                        <div className="quick-actions">
                            {quickActions.slice(0, 2).map((action, index) => (
                                <Button
                                    key={action}
                                    variant={action === 'REJECTED' ? 'outline-danger' : 'outline-success'}
                                    size="sm"
                                    className="me-1"
                                    onClick={() => onUpdateStatus(application)}
                                    title={`Mark as ${action.replace(/_/g, ' ')}`}
                                >
                                    {action === 'REJECTED' ? (
                                        <i className="fas fa-times"></i>
                                    ) : action === 'UNDER_REVIEW' ? (
                                        <i className="fas fa-search"></i>
                                    ) : action === 'INTERVIEW_SCHEDULED' ? (
                                        <i className="fas fa-calendar"></i>
                                    ) : action === 'INTERVIEWED' ? (
                                        <i className="fas fa-handshake"></i>
                                    ) : action === 'OFFERED' ? (
                                        <i className="fas fa-gift"></i>
                                    ) : action === 'HIRED' ? (
                                        <i className="fas fa-user-check"></i>
                                    ) : (
                                        <i className="fas fa-arrow-right"></i>
                                    )}
                                </Button>
                            ))}
                            {quickActions.length > 2 && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => onUpdateStatus(application)}
                                    title="More actions"
                                >
                                    <i className="fas fa-ellipsis-h"></i>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Card.Body>

            <style jsx>{`
                .application-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .application-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .status-badge {
                    font-size: 0.7rem;
                    padding: 0.25rem 0.5rem;
                }
                
                .quick-actions .btn {
                    padding: 0.25rem 0.5rem;
                }
                
                .cover-letter-preview,
                .recruiter-notes-preview {
                    background: #f8f9fa;
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    border-left: 3px solid #dee2e6;
                }
                
                .recruiter-notes-preview {
                    border-left-color: #0d6efd;
                }
                
                .application-meta .col-6 {
                    font-size: 0.8rem;
                }
            `}</style>
        </Card>
    );
};

export default ApplicationCard;