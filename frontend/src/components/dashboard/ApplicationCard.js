import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { 
    Mail, 
    Briefcase, 
    Building2, 
    CalendarPlus, 
    Clock, 
    Eye, 
    X, 
    Search, 
    Calendar, 
    Handshake, 
    Gift, 
    UserCheck, 
    ArrowRight, 
    MoreHorizontal 
} from 'lucide-react';

import { getStatusIcon, getStatusColor, getStatusLabel } from '../../utils/statusHelpers';
import { formatDate as defaultFormatDate } from '../../utils/dateUtils';

const ApplicationCard = ({ 
    application, 
    onViewDetails = () => {}, 
    onUpdateStatus = () => {}, 
    formatDate = defaultFormatDate,
}) => {
    // getStatusBadgeVariant is no longer needed as we use getStatusColor
    
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

    const safeApplication = application || {};
    const quickActions = getStatusActions(safeApplication.status);

    return (
        <Card className="application-card h-100 border-start border-4" 
              style={{ borderStartColor: getStatusColor(safeApplication.status) === 'success' ? '#198754' : 
                                       getStatusColor(safeApplication.status) === 'danger' ? '#dc3545' : 
                                       getStatusColor(safeApplication.status) === 'warning' ? '#ffc107' : '#0d6efd' }}>
            <Card.Body className="d-flex flex-column">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <h6 className="card-title mb-1 fw-bold">
                            {safeApplication.applicantName || 'Anonymous'}
                        </h6>
                        <p className="text-muted mb-0 small d-flex align-items-center">
                            <Mail className="me-1" size={14} />
                            {safeApplication.applicantEmail || 'No email provided'}
                        </p>
                    </div>
                    <Badge 
                        bg={getStatusColor(safeApplication.status)}
                        className="status-badge d-flex align-items-center"
                    >
                        <span className="me-1 d-flex align-items-center">
                            {getStatusIcon(safeApplication.status, 12)}
                        </span>
                        {getStatusLabel(safeApplication.status)}
                    </Badge>
                </div>

                {/* Job Information */}
                <div className="job-info mb-3">
                    <p className="mb-1 fw-semibold text-primary d-flex align-items-center">
                        <Briefcase className="me-1" size={14} />
                        {safeApplication.jobTitle || 'Untitled Role'}
                    </p>
                    <p className="mb-0 small text-muted d-flex align-items-center">
                        <Building2 className="me-1" size={14} />
                        {safeApplication.companyName || 'Unknown Company'}
                    </p>
                </div>

                {/* Application Details */}
                <div className="application-meta mb-3">
                    <Row className="g-2 small text-muted">
                        <Col xs={6} className="d-flex align-items-center">
                            <CalendarPlus className="me-1" size={14} />
                            Applied: {formatDate(safeApplication.applyDate)}
                        </Col>
                        <Col xs={6} className="d-flex align-items-center">
                            <Clock className="me-1" size={14} />
                            Updated: {formatDate(safeApplication.lastUpdated)}
                        </Col>
                    </Row>
                </div>

                {/* Cover Letter Preview */}
                {safeApplication.coverLetter && (
                    <div className="cover-letter-preview mb-3">
                        <small className="text-muted d-block mb-1">Cover Letter:</small>
                        <p className="small text-truncate mb-0" style={{ maxHeight: '40px', overflow: 'hidden' }}>
                            {safeApplication.coverLetter.length > 100 
                                ? `${safeApplication.coverLetter.substring(0, 100)}...`
                                : safeApplication.coverLetter
                            }
                        </p>
                    </div>
                )}

                {/* Recruiter Notes Preview */}
                {safeApplication.recruiterNotes && (
                    <div className="recruiter-notes-preview mb-3">
                        <small className="text-muted d-block mb-1">Your Notes:</small>
                        <p className="small text-info mb-0" style={{ fontStyle: 'italic' }}>
                            {safeApplication.recruiterNotes.length > 80 
                                ? `${safeApplication.recruiterNotes.substring(0, 80)}...`
                                : safeApplication.recruiterNotes
                            }
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onViewDetails(safeApplication)}
                        className="me-2 d-flex align-items-center"
                    >
                        <Eye className="me-1" size={14} />
                        View Details
                    </Button>

                    {quickActions.length > 0 && (
                        <div className="quick-actions d-flex align-items-center">
                            {quickActions.slice(0, 2).map((action, index) => (
                                <Button
                                    key={action}
                                    variant={action === 'REJECTED' ? 'outline-danger' : 'outline-success'}
                                    size="sm"
                                    className="me-1 d-flex align-items-center justify-content-center"
                                    onClick={() => onUpdateStatus(safeApplication)}
                                    title={`Mark as ${action.replace(/_/g, ' ')}`}
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    {action === 'REJECTED' ? (
                                        <X size={16} />
                                    ) : action === 'UNDER_REVIEW' ? (
                                        <Search size={16} />
                                    ) : action === 'INTERVIEW_SCHEDULED' ? (
                                        <Calendar size={16} />
                                    ) : action === 'INTERVIEWED' ? (
                                        <Handshake size={16} />
                                    ) : action === 'OFFERED' ? (
                                        <Gift size={16} />
                                    ) : action === 'HIRED' ? (
                                        <UserCheck size={16} />
                                    ) : (
                                        <ArrowRight size={16} />
                                    )}
                                </Button>
                            ))}
                            {quickActions.length > 2 && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => onUpdateStatus(safeApplication)}
                                    title="More actions"
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    <MoreHorizontal size={16} />
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
                    border: 1px solid #eee;
                }
                
                .application-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .status-badge {
                    font-size: 0.7rem;
                    padding: 0.25rem 0.5rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .quick-actions .btn {
                    padding: 0;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                
                .quick-actions .btn:hover {
                    transform: scale(1.1);
                }
                
                .cover-letter-preview,
                .recruiter-notes-preview {
                    background: #f8f9fa;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border-left: 3px solid #dee2e6;
                }
                
                .recruiter-notes-preview {
                    border-left-color: #0d6efd;
                    background: #f0f7ff;
                }
                
                .application-meta .col-6 {
                    font-size: 0.75rem;
                }
            `}</style>
        </Card>
    );
};

export default ApplicationCard;