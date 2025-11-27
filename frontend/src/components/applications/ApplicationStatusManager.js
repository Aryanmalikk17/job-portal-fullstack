import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Dropdown } from 'react-bootstrap';
import applicationService from '../../services/applicationService';

const ApplicationStatusManager = ({ userType, userId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [recruiterNotes, setRecruiterNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const [pollId, setPollId] = useState(null);

    useEffect(() => {
        loadApplications();
        
        // Start polling for real-time updates
        const id = applicationService.startStatusPolling((updatedApps) => {
            setApplications(updatedApps);
        }, 30000);
        setPollId(id);

        // Cleanup polling on unmount
        return () => {
            if (id) applicationService.stopStatusPolling(id);
        };
    }, [userType]);

    const loadApplications = async () => {
        try {
            setLoading(true);
            let data;
            
            if (userType === 'Job Seeker') {
                data = await applicationService.getMyApplications();
            } else if (userType === 'Recruiter') {
                data = await applicationService.getRecruiterApplications();
            }
            
            setApplications(data || []);
        } catch (error) {
            setError(error.error || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedApplication || !newStatus) return;

        try {
            setUpdating(true);
            const statusData = {
                status: newStatus,
                recruiterNotes: recruiterNotes.trim() || null
            };

            const updatedApp = await applicationService.updateApplicationStatus(
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
            
            // Show success message
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
        const variant = {
            'APPLIED': 'primary',
            'UNDER_REVIEW': 'warning',
            'INTERVIEW_SCHEDULED': 'info',
            'INTERVIEWED': 'secondary',
            'OFFERED': 'success',
            'HIRED': 'success',
            'REJECTED': 'danger',
            'WITHDRAWN': 'secondary'
        }[status] || 'secondary';

        return (
            <Badge 
                bg={variant} 
                style={{ 
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem'
                }}
            >
                <i className={`fa ${applicationService.getStatusIcon(status)} me-1`}></i>
                {status.replace('_', ' ')}
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
        return applicationService.getNextPossibleStatuses(selectedApplication.status);
    };

    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <i className="fa fa-spinner fa-spin fa-2x mb-3"></i>
                    <p>Loading applications...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div>
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="fa fa-briefcase me-2"></i>
                            {userType === 'Job Seeker' ? 'My Applications' : 'Application Management'}
                        </h5>
                        <Button variant="outline-primary" size="sm" onClick={loadApplications}>
                            <i className="fa fa-refresh me-1"></i>
                            Refresh
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {applications.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                            <p className="text-muted">
                                {userType === 'Job Seeker' 
                                    ? 'You haven\'t applied for any jobs yet.' 
                                    : 'No applications received yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    {userType === 'Recruiter' && <th>Applicant</th>}
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                        <td>
                                            <strong>{app.jobTitle}</strong>
                                            {app.jobLocation && (
                                                <small className="text-muted d-block">
                                                    <i className="fa fa-map-marker-alt me-1"></i>
                                                    {app.jobLocation}
                                                </small>
                                            )}
                                        </td>
                                        <td>{app.companyName}</td>
                                        {userType === 'Recruiter' && (
                                            <td>
                                                <div>
                                                    <strong>{app.applicantName}</strong>
                                                    <small className="text-muted d-block">
                                                        {app.applicantEmail}
                                                    </small>
                                                </div>
                                            </td>
                                        )}
                                        <td>{getStatusBadge(app.status)}</td>
                                        <td>{formatDate(app.applyDate)}</td>
                                        <td>{formatDate(app.lastUpdated)}</td>
                                        <td>
                                            <Dropdown>
                                                <Dropdown.Toggle 
                                                    variant="outline-secondary" 
                                                    size="sm"
                                                    id={`dropdown-${app.id}`}
                                                >
                                                    <i className="fa fa-ellipsis-v"></i>
                                                </Dropdown.Toggle>
                                                
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => openStatusModal(app)}>
                                                        <i className="fa fa-eye me-2"></i>
                                                        View Details
                                                    </Dropdown.Item>
                                                    
                                                    {userType === 'Recruiter' && (
                                                        <Dropdown.Item onClick={() => openStatusModal(app)}>
                                                            <i className="fa fa-edit me-2"></i>
                                                            Update Status
                                                        </Dropdown.Item>
                                                    )}
                                                    
                                                    {userType === 'Job Seeker' && 
                                                     app.status === 'APPLIED' && (
                                                        <Dropdown.Item 
                                                            className="text-danger"
                                                            onClick={() => {/* Handle withdraw */}}
                                                        >
                                                            <i className="fa fa-times me-2"></i>
                                                            Withdraw
                                                        </Dropdown.Item>
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
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fa fa-edit me-2"></i>
                        Application Details
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    {selectedApplication && (
                        <div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Job:</strong> {selectedApplication.jobTitle}
                                </div>
                                <div className="col-md-6">
                                    <strong>Company:</strong> {selectedApplication.companyName}
                                </div>
                            </div>
                            
                            {userType === 'Recruiter' && (
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Applicant:</strong> {selectedApplication.applicantName}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Email:</strong> {selectedApplication.applicantEmail}
                                    </div>
                                </div>
                            )}
                            
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <strong>Applied:</strong> {formatDate(selectedApplication.applyDate)}
                                </div>
                                <div className="col-md-6">
                                    <strong>Last Updated:</strong> {formatDate(selectedApplication.lastUpdated)}
                                </div>
                            </div>

                            {userType === 'Recruiter' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Update Status</strong>
                                        </Form.Label>
                                        <Form.Select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            disabled={updating}
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

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <strong>Recruiter Notes</strong>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={recruiterNotes}
                                            onChange={(e) => setRecruiterNotes(e.target.value)}
                                            placeholder="Add notes about this application (optional)..."
                                            disabled={updating}
                                        />
                                    </Form.Group>
                                </>
                            )}

                            {selectedApplication.coverLetter && (
                                <div className="mb-3">
                                    <strong>Cover Letter:</strong>
                                    <div className="bg-light p-3 mt-2 rounded">
                                        {selectedApplication.coverLetter}
                                    </div>
                                </div>
                            )}

                            {selectedApplication.recruiterNotes && (
                                <div className="mb-3">
                                    <strong>Recruiter Notes:</strong>
                                    <div className="bg-light p-3 mt-2 rounded">
                                        {selectedApplication.recruiterNotes}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowStatusModal(false)}
                        disabled={updating}
                    >
                        Close
                    </Button>
                    
                    {userType === 'Recruiter' && (
                        <Button 
                            variant="primary" 
                            onClick={handleStatusUpdate}
                            disabled={updating || !newStatus || newStatus === selectedApplication?.status}
                        >
                            {updating && <i className="fa fa-spinner fa-spin me-2"></i>}
                            Update Status
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ApplicationStatusManager;