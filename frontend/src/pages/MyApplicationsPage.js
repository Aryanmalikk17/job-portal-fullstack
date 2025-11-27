import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApplicationStatusManager from '../components/applications/ApplicationStatusManager';

const MyApplicationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="my-applications-page">
            <Container fluid className="px-4">
                <Row className="mb-4">
                    <Col>
                        <div className="page-header d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="page-title mb-1">
                                    <i className="fa fa-briefcase me-2"></i>
                                    My Job Applications
                                </h2>
                                <p className="page-subtitle text-muted mb-0">
                                    Track the status of your job applications and view updates from recruiters
                                </p>
                            </div>
                            <div className="page-actions">
                                <Button 
                                    variant="outline-secondary" 
                                    className="me-2"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    <i className="fa fa-arrow-left me-2"></i>
                                    Back to Dashboard
                                </Button>
                                <Button 
                                    variant="primary"
                                    onClick={() => navigate('/')}
                                >
                                    <i className="fa fa-search me-2"></i>
                                    Find Jobs
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        {user ? (
                            <ApplicationStatusManager 
                                userType={user.userType} 
                                userId={user.userId} 
                            />
                        ) : (
                            <Card>
                                <Card.Body className="text-center py-5">
                                    <i className="fa fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                    <h4>Authentication Required</h4>
                                    <p className="text-muted">Please log in to view your applications.</p>
                                    <Button variant="primary" onClick={() => navigate('/login')}>
                                        Go to Login
                                    </Button>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MyApplicationsPage;