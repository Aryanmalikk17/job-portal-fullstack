import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ErrorBoundary>
            <div className="app-layout">
                <Header />
                <main className="main-content">
                    {children}
                </main>
                <Footer />
            </div>
        </ErrorBoundary>
    );
};

export default Layout;