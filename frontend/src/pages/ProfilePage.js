import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobSeekerProfile from '../components/profile/JobSeekerProfile';
import RecruiterProfile from '../components/profile/RecruiterProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        // Simulate loading user profile data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="profile-page">
            <Container fluid className="px-4">
                <Row>
                    <Col>
                        {/* Profile Content */}
                        <div className="profile-content">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="profile-tabs"
                            >
                                <Tab eventKey="personal" title={
                                    <span>
                                        <i className="fas fa-user me-2"></i>
                                        Personal Info
                                    </span>
                                }>
                                    {user?.userType === 'Job Seeker' ? (
                                        <JobSeekerProfile user={user} />
                                    ) : (
                                        <RecruiterProfile user={user} />
                                    )}
                                </Tab>

                                {user?.userType === 'Job Seeker' && (
                                    <Tab eventKey="professional" title={
                                        <span>
                                            <i className="fas fa-briefcase me-2"></i>
                                            Professional
                                        </span>
                                    }>
                                        <JobSeekerProfile user={user} section="professional" />
                                    </Tab>
                                )}

                                {user?.userType === 'Recruiter' && (
                                    <Tab eventKey="company" title={
                                        <span>
                                            <i className="fas fa-building me-2"></i>
                                            Company Info
                                        </span>
                                    }>
                                        <RecruiterProfile user={user} section="company" />
                                    </Tab>
                                )}

                                <Tab eventKey="documents" title={
                                    <span>
                                        <i className="fas fa-file-alt me-2"></i>
                                        Documents
                                    </span>
                                }>
                                    {user?.userType === 'Job Seeker' ? (
                                        <JobSeekerProfile user={user} section="documents" />
                                    ) : (
                                        <RecruiterProfile user={user} section="documents" />
                                    )}
                                </Tab>

                                <Tab eventKey="settings" title={
                                    <span>
                                        <i className="fas fa-cog me-2"></i>
                                        Settings
                                    </span>
                                }>
                                    {user?.userType === 'Job Seeker' ? (
                                        <JobSeekerProfile user={user} section="settings" />
                                    ) : (
                                        <RecruiterProfile user={user} section="settings" />
                                    )}
                                </Tab>
                            </Tabs>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProfilePage;