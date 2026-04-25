import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Dropdown, Spinner, Row, Col } from 'react-bootstrap';
import { 
    Loader2, 
    Briefcase, 
    RefreshCcw, 
    AlertTriangle, 
    Inbox, 
    MapPin, 
    MoreVertical, 
    Eye, 
    Edit3, 
    X,
    CheckCircle2,
    Info
} from 'lucide-react';
import { 
    getMyApplications, 
    getRecruiterApplications, 
    updateApplicationStatus, 
    getNextPossibleStatuses 
} from '../../services/applicationService';
import { getStatusIcon, getStatusColor, getStatusLabel } from '../../utils/statusHelpers';

const ApplicationStatusManager = ({ userType, userId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [recruiterNotes, setRecruiterNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    const loadApplications = useCallback(async () => {
        try {
            setLoading(true);
            let data;
            
            if (userType === 'Job Seeker') {
                data = await getMyApplications();
            } else if (userType === 'Recruiter') {
                data = await getRecruiterApplications();
            }
            
            setApplications(data || []);
        } catch (error) {
            setError(error.error || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, [userType]);

    useEffect(() => {
        loadApplications();
        
        // Polling every 30 seconds for real-time updates
        const id = setInterval(loadApplications, 30000);

        // Cleanup polling on unmount
        return () => {
            if (id) clearInterval(id);
        };
    }, [loadApplications]);

    const handleStatusUpdate = async () => {
        if (!selectedApplication || !newStatus) return;

        try {
            setUpdating(true);
            const statusData = {
                status: newStatus,
                recruiterNotes: recruiterNotes.trim() || null
            };

            const updatedApp = await updateApplicationStatus(
                selectedApplication.id, 
                statusData
            );

            // Update the application in the list
            setApplications(prev => 
                prev.map(app => 
                    app.id === selectedApplication.id 
                        ? { ...app, ...updatedApp }
                        : app
                )
            );

            // Close modal and reset
            setShowStatusModal(false);
            setSelectedApplication(null);
            setNewStatus('');
            setRecruiterNotes('');
            
            setError(null);

        } catch (error) {
            setError(error.error || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const openStatusModal = (application) => {
        setSelectedApplication(application);
        setNewStatus(application.status);
        setRecruiterNotes(application.recruiterNotes || '');
        setShowStatusModal(true);
        setError(null);
    };

    const getStatusBadge = (status) => {
        const variant = getStatusColor(status);

        return (
            <Badge 
                bg={variant} 
                className="d-inline-flex align-items-center px-2 py-1 border-0 shadow-sm"
                style={{ 
                    color: 'white',
                    fontSize: '0.75rem',
                    borderRadius: '6px'
                }}
            >
                <span className="me-1 d-flex align-items-center">
                    {getStatusIcon(status, 12)}
                </span>
                {getStatusLabel(status)}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getNextStatuses = () => {
        if (!selectedApplication) return [];
        return getNextPossibleStatuses(selectedApplication.status);
    };

    if (loading) {
        return (
            <Card className="border-0 shadow-sm glass-card">
                <Card.Body className="text-center py-5">
                    <Loader2 size={40} className="text-primary spin-animation mb-3" />
                    <p className="text-muted fw-medium">Loading applications...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div className="application-status-manager">
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold d-flex align-items-center">
                            <Briefcase size={20} className="me-2 text-primary" />
                            {userType === 'Job Seeker' ? 'My Applications' : 'Application Management'}
                        </h5>
                        <Button 
                            variant="light" 
                            size="sm" 
                            onClick={loadApplications}
                            className="d-flex align-items-center border shadow-sm px-3"
                        >
                            <RefreshCcw size={14} className="me-2" />
                            Refresh
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body className="p-4 pt-2">
                    {error && (
                        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center" dismissible onClose={() => setError(null)}>
                            <AlertTriangle size={18} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    {applications.length === 0 ? (
                        <div className="text-center py-5 glass-card rounded-4">
                            <div className="text-muted mb-3 d-flex justify-content-center">
                                <Inbox size={64} strokeWidth={1} />
                            </div>
                            <p className="text-muted fw-medium mb-0">
                                {userType === 'Job Seeker' 
                                    ? 'You haven\'t applied for any jobs yet.' 
                                    : 'No applications received yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 custom-status-table">
                            <thead>
                                <tr>
                                    <th>Job Position</th>
                                    <th>Company</th>
                                    {userType === 'Recruiter' && <th>Applicant</th>}
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Last Updated</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark">{app.jobTitle}</div>
                                            {app.jobLocation && (
                                                <small className="text-muted d-flex align-items-center mt-1">
                                                    <MapPin size={12} className="me-1" />
                                                    {app.jobLocation}
                                                </small>
                                            )}
                                        </td>
                                        <td className="py-3 fw-medium">{app.companyName}</td>
                                        {userType === 'Recruiter' && (
                                            <td className="py-3">
                                                <div>
                                                    <div className="fw-bold">{app.applicantName}</div>
                                                    <small className="text-muted d-block">
                                                        {app.applicantEmail}
                                                    </small>
                                                </div>
                                            </td>
                                        )}
                                        <td className="py-3">{getStatusBadge(app.status)}</td>
                                        <td className="py-3 small text-muted">{formatDate(app.applyDate)}</td>
                                        <td className="py-3 small text-muted">{formatDate(app.lastUpdated)}</td>
                                        <td className="py-3 text-end">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle 
                                                    variant="light" 
                                                    size="sm"
                                                    id={`dropdown-${app.id}`}
                                                    className="border-0 shadow-none p-2 rounded-circle hover-bg-light"
                                                >
                                                    <MoreVertical size={16} className="text-muted" />
                                                </Dropdown.Toggle>
                                                
                                                <Dropdown.Menu className="border-0 shadow-lg p-2 rounded-3">
                                                    <Dropdown.Item onClick={() => openStatusModal(app)} className="rounded-2 d-flex align-items-center">
                                                        <Eye size={16} className="me-2 text-primary" />
                                                        View Details
                                                    </Dropdown.Item>
                                                    
                                                    {userType === 'Recruiter' && (
                                                        <Dropdown.Item onClick={() => openStatusModal(app)} className="rounded-2 d-flex align-items-center">
                                                            <Edit3 size={16} className="me-2 text-info" />
                                                            Update Status
                                                        </Dropdown.Item>
                                                    )}
                                                    
                                                    {userType === 'Job Seeker' && 
                                                     app.status === 'APPLIED' && (
                                                        <>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item 
                                                                className="rounded-2 text-danger d-flex align-items-center"
                                                                onClick={() => {/* Handle withdraw */}}
                                                            >
                                                                <X size={16} className="me-2" />
                                                                Withdraw
                                                            </Dropdown.Item>
                                                        </>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Status Update Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 px-4 pt-4">
                    <Modal.Title className="fw-bold d-flex align-items-center">
                        <Edit3 size={24} className="me-3 text-primary" />
                        Application Details
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body className="px-4">
                    {selectedApplication && (
                        <div className="p-2">
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <div className="small text-muted text-uppercase fw-bold mb-1">Job Position</div>
                                        <div className="fw-bold text-primary">{selectedApplication.jobTitle}</div>
                                        <div className="small fw-medium mt-1">{selectedApplication.companyName}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <div className="small text-muted text-uppercase fw-bold mb-1">Status</div>
                                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                        <div className="small text-muted mt-2">
                                            Applied: {formatDate(selectedApplication.applyDate)}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            
                            {userType === 'Recruiter' && (
                                <div className="applicant-info-panel p-3 border border-light rounded-3 mb-4 shadow-sm">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <Info size={16} className="me-2 text-info" /> Applicant Information
                                    </h6>
                                    <Row>
                                        <Col md={6}>
                                            <div className="small text-muted">Name</div>
                                            <div className="fw-semibold">{selectedApplication.applicantName}</div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="small text-muted">Email</div>
                                            <div className="fw-semibold">{selectedApplication.applicantEmail}</div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {userType === 'Recruiter' && (
                                <div className="status-form-panel">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Update Status</Form.Label>
                                        <Form.Select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            disabled={updating}
                                            className="border-light bg-light py-2"
                                        >
                                            <option value={selectedApplication.status}>
                                                {selectedApplication.status.replace('_', ' ')} (Current)
                                            </option>
                                            {getNextStatuses().map(status => (
                                                <option key={status} value={status}>
                                                    {status.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Recruiter Notes (Internal)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={recruiterNotes}
                                            onChange={(e) => setRecruiterNotes(e.target.value)}
                                            placeholder="Add private notes about this application..."
                                            disabled={updating}
                                            className="border-light bg-light"
                                        />
                                    </Form.Group>
                                </div>
                            )}

                            {selectedApplication.coverLetter && (
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted text-uppercase d-block mb-2">Cover Letter</label>
                                    <div className="bg-light p-3 rounded-3 border-start border-4 border-primary shadow-sm" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedApplication.coverLetter}
                                    </div>
                                </div>
                            )}

                            {userType === 'Job Seeker' && selectedApplication.recruiterNotes && (
                                <div className="mb-3">
                                    <label className="small fw-bold text-muted text-uppercase d-block mb-2">Message from Employer</label>
                                    <div className="bg-light p-3 rounded-3 border-start border-4 border-info shadow-sm">
                                        {selectedApplication.recruiterNotes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button 
                        variant="light" 
                        onClick={() => setShowStatusModal(false)}
                        disabled={updating}
                        className="px-4"
                    >
                        Close
                    </Button>
                    
                    {userType === 'Recruiter' && (
                        <Button 
                            variant="primary" 
                            onClick={handleStatusUpdate}
                            disabled={updating || !newStatus || newStatus === selectedApplication?.status}
                            className="px-4 d-flex align-items-center shadow"
                        >
                            {updating ? (
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                            ) : (
                                <CheckCircle2 size={18} className="me-2" />
                            )}
                            Update Status
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .spin-animation {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .custom-status-table thead th {
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #edf2f7;
                    color: #718096;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .hover-bg-light:hover {
                    background-color: #f8f9fa !important;
                }
            `}</style>
        </div>
    );
};

export default ApplicationStatusManager;