import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { companyService } from '../services/companyService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import './CompanyDetailsPage.css';

const CompanyDetailsPage = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCompanyData = useCallback(async () => {
        try {
            setLoading(true);
            const [companyData, jobsData] = await Promise.all([
                companyService.getCompanyDetails(id),
                companyService.getCompanyJobs(id)
            ]);
            setCompany(companyData);
            setJobs(jobsData);
        } catch (err) {
            console.error('Error loading company data:', err);
            setError('Failed to load company details. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCompanyData();
    }, [loadCompanyData]);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="glass-card p-4 text-center">
                    <i className="fa fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                    <h4>Something went wrong</h4>
                    <p>{error}</p>
                    <Button variant="teal" onClick={loadCompanyData} className="mt-3">
                        <i className="fa fa-redo me-2"></i> Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!company) return (
        <Container className="py-5 text-center">
            <h3>Company not found</h3>
            <Link to="/jobs"><Button variant="teal">Browse Jobs</Button></Link>
        </Container>
    );

    const plainTextDescription = (company.description || '').replace(/<[^>]+>/g, '').substring(0, 155);

    const jsonLdOrganization = {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness'],
        name: company.name,
        url: company.website ? (company.website.startsWith('http') ? company.website : `https://${company.website}`) : 'https://www.zplusejobs.com',
        logo: `https://www.zplusejobs.com/logos/company/${company.id}/${company.logo || ''}`,
        description: plainTextDescription,
        address: {
            '@type': 'PostalAddress',
            streetAddress: company.officeAddress || '',
            addressLocality: company.city || '',
            addressRegion: company.state || '',
            addressCountry: company.country || 'IN'
        }
    };

    return (
        <div className="company-details-page">
            <Helmet>
                <title>{company.name} | Careers & Jobs at Zpluse Jobs</title>
                <meta name="description" content={plainTextDescription || `View jobs and career opportunities at ${company.name}.`} />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLdOrganization)}
                </script>
            </Helmet>
            {/* Hero Section */}
            <div className="company-hero">
                <Container>
                    <div className="hero-content">
                        <div className="company-logo-container glass-card">
                            {company.logo ? (
                                <img 
                                    src={`/logos/company/${company.id}/${company.logo}`} 
                                    alt={`${company.name} office and logo`} 
                                    className="company-logo-img"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <div className="company-logo-fallback" style={{ display: company.logo ? 'none' : 'block' }}>
                                <i className="fa fa-building"></i>
                            </div>
                        </div>
                        <div className="hero-text">
                            <h1>{company.name}</h1>
                            {company.website && (
                                <a 
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="company-website-link"
                                >
                                    <i className="fa fa-external-link-alt"></i>
                                    {company.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                {/* Fact Grid */}
                <div className="fact-grid">
                    <div className="fact-item glass-card">
                        <i className="fa fa-industry fact-icon"></i>
                        <span className="fact-label">Industry</span>
                        <span className="fact-value">{company.industry || 'Not Specified'}</span>
                    </div>
                    <div className="fact-item glass-card">
                        <i className="fa fa-users fact-icon"></i>
                        <span className="fact-label">Company Size</span>
                        <span className="fact-value">{company.size || 'Not Specified'}</span>
                    </div>
                    <div className="fact-item glass-card">
                        <i className="fa fa-map-marker-alt fact-icon"></i>
                        <span className="fact-label">Headquarters</span>
                        <span className="fact-value">
                            {company.city ? `${company.city}, ${company.state || ''}` : 'Not Specified'}
                        </span>
                    </div>
                    <div className="fact-item glass-card">
                        <i className="fa fa-calendar-check fact-icon"></i>
                        <span className="fact-label">Founded</span>
                        <span className="fact-value">{company.foundedYear || 'Not Specified'}</span>
                    </div>
                </div>

                <Row>
                    {/* Left: About */}
                    <Col lg={8} className="mb-4">
                        <div className="glass-card p-4 h-100">
                            <h2 className="section-title">
                                <i className="fa fa-info-circle"></i> About {company.name}
                            </h2>
                            <div className="about-content">
                                {company.description || 'No description provided by the company.'}
                            </div>
                            
                            {company.officeAddress && (
                                <div className="mt-4 pt-4 border-top">
                                    <h5 className="text-muted mb-3">Office Address</h5>
                                    <p className="mb-0">
                                        <i className="fa fa-map-pin me-2 text-teal"></i>
                                        {company.officeAddress}, {company.city}, {company.state}, {company.country}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* Right: Summary / CTA */}
                    <Col lg={4} className="mb-4">
                        <div className="glass-card p-4">
                            <h2 className="section-title">Company Info</h2>
                            <ul className="list-unstyled mb-0">
                                <li className="mb-3 d-flex justify-content-between">
                                    <span className="text-muted">Type</span>
                                    <span className="fw-bold">{company.type || 'N/A'}</span>
                                </li>
                                <li className="mb-3 d-flex justify-content-between">
                                    <span className="text-muted">Industry</span>
                                    <span className="fw-bold">{company.industry || 'N/A'}</span>
                                </li>
                                <li className="mb-0 d-flex justify-content-between">
                                    <span className="text-muted">Jobs Active</span>
                                    <span className="badge bg-teal rounded-pill">{jobs.length}</span>
                                </li>
                            </ul>
                        </div>
                    </Col>
                </Row>

                {/* Jobs Feed */}
                <div className="mt-5">
                    <h2 className="section-title">
                        <i className="fa fa-briefcase"></i> Open Positions at {company.name}
                    </h2>
                    {jobs.length > 0 ? (
                        <div className="jobs-list">
                            {jobs.map(job => (
                                <div key={job.jobPostId} className="job-item-card glass-card">
                                    <div className="job-info">
                                        <h3>{job.jobTitle}</h3>
                                        <div className="job-meta">
                                            <span><i className="fa fa-map-marker-alt"></i> {job.jobLocationId?.city || 'Location N/A'}</span>
                                            <span><i className="fa fa-clock"></i> {job.jobType}</span>
                                            {job.salary && <span><i className="fa fa-wallet"></i> {job.salary}</span>}
                                        </div>
                                    </div>
                                    <Link to={`/jobs/${job.jobPostId}`}>
                                        <Button className="view-job-btn">
                                            View Details <i className="fa fa-arrow-right ms-2"></i>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Alert variant="info" className="glass-card p-4 text-center">
                            No current job openings at this company. Check back later!
                        </Alert>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default CompanyDetailsPage;
