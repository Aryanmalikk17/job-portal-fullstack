import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobSeekerDashboard from '../components/dashboard/JobSeekerDashboard';
import RecruiterDashboard from '../components/dashboard/RecruiterDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading user data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard-page">
            <Container fluid className="px-4">
                <Row>
                    <Col>
                        {user?.userType === 'Job Seeker' ? (
                            <JobSeekerDashboard user={user} />
                        ) : user?.userType === 'Recruiter' ? (
                            <RecruiterDashboard user={user} />
                        ) : (
                            <div className="text-center py-5">
                                <i className="fa fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                <h3>Unknown User Type</h3>
                                <p className="text-muted">Unable to determine dashboard type</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DashboardPage;