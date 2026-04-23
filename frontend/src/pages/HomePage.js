import React from 'react';
import LandingPage from '../components/landing/LandingPage';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
    return (
        <div className="home-page">
            <Helmet>
                <title>Zpluse Jobs — Find Your Next Career Move</title>
                <meta name="description" content="Discover premium job opportunities in DevOps, Data Science, Design, and Engineering. Join the elite talent pool on Zpluse." />
            </Helmet>
            <LandingPage />
        </div>
    );
};

export default HomePage;