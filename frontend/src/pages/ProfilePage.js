import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { 
    UserCircle, 
    Briefcase, 
    Building2, 
    FileText, 
    Settings2 
} from 'lucide-react';
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
                                    <span className="d-flex align-items-center">
                                        <UserCircle size={18} className="me-2" />
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
                                        <span className="d-flex align-items-center">
                                            <Briefcase size={18} className="me-2" />
                                            Professional
                                        </span>
                                    }>
                                        <JobSeekerProfile user={user} section="professional" />
                                    </Tab>
                                )}

                                {user?.userType === 'Recruiter' && (
                                    <Tab eventKey="company" title={
                                        <span className="d-flex align-items-center">
                                            <Building2 size={18} className="me-2" />
                                            Company Info
                                        </span>
                                    }>
                                        <RecruiterProfile user={user} section="company" />
                                    </Tab>
                                )}

                                <Tab eventKey="documents" title={
                                    <span className="d-flex align-items-center">
                                        <FileText size={18} className="me-2" />
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
                                    <span className="d-flex align-items-center">
                                        <Settings2 size={18} className="me-2" />
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