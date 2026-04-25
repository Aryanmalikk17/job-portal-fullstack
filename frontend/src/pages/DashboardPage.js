import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobSeekerDashboard from '../components/dashboard/JobSeekerDashboard';
import RecruiterDashboard from '../components/dashboard/RecruiterDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Short delay to ensure Auth context is ready
        const timer = setTimeout(() => {
            setLoading(false);
            
            // Redirection logic for base /dashboard route
            if (user && location.pathname === '/dashboard') {
                if (user.userType === 'Job Seeker') {
                    navigate('/dashboard/jobseeker', { replace: true });
                } else if (user.userType === 'Recruiter') {
                    navigate('/dashboard/recruiter', { replace: true });
                }
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [user, location.pathname, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <h3>Please login to view your dashboard</h3>
            </div>
        );
    }

    // Determine which dashboard to show based on URL or Role
    const isJobSeekerPath = location.pathname === '/dashboard/jobseeker';
    const isRecruiterPath = location.pathname === '/dashboard/recruiter';

    if (isJobSeekerPath || (location.pathname === '/dashboard' && user.userType === 'Job Seeker')) {
        return <JobSeekerDashboard user={user} />;
    }
    
    if (isRecruiterPath || (location.pathname === '/dashboard' && user.userType === 'Recruiter')) {
        return <RecruiterDashboard user={user} />;
    }

    // Fallback if accessed via generic /dashboard and redirection hasn't happened yet
    return (
        <div className="container mt-5 py-5 text-center">
            <div className="card shadow-sm p-5 border-0">
                <i className="fas fa-user-shield fa-3x text-primary mb-4"></i>
                <h2 className="fw-bold">Identifying Account...</h2>
                <p className="text-muted mb-4">We're preparing your personal dashboard.</p>
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;