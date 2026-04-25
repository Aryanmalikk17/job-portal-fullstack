import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
    AlertTriangle, 
    RotateCcw, 
    Building2, 
    ExternalLink, 
    Factory, 
    Users, 
    MapPin, 
    CalendarCheck, 
    Info, 
    Briefcase, 
    Clock, 
    Wallet, 
    ArrowRight 
} from 'lucide-react';
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
                    <AlertTriangle size={48} className="mb-3 text-danger" />
                    <h4>Something went wrong</h4>
                    <p>{error}</p>
                    <Button variant="teal" onClick={loadCompanyData} className="mt-3 d-inline-flex align-items-center">
                        <RotateCcw size={18} className="me-2" /> Retry
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
                                <Building2 size={48} />
                            </div>
                        </div>
                        <div className="hero-text">
                            <h1>{company.name}</h1>
                            {company.website && (
                                <a 
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="company-website-link d-inline-flex align-items-center"
                                >
                                    <ExternalLink size={16} className="me-2" />
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
                        <Factory size={24} className="fact-icon" />
                        <span className="fact-label">Industry</span>
                        <span className="fact-value">{company.industry || 'Not Specified'}</span>
                    </div>
                    <div className="fact-item glass-card">
                        <Users size={24} className="fact-icon" />
                        <span className="fact-label">Company Size</span>
                        <span className="fact-value">{company.size || 'Not Specified'}</span>
                    </div>
                    <div className="fact-item glass-card">
                        <MapPin size={24} className="fact-icon" />
                        <span className="fact-label">Headquarters</span>
                        <span className="fact-value">
                            {company.city ? `${company.city}, ${company.state || ''}` : 'Not Specified'}
                        </span>
                    </div>
                    <div className="fact-item glass-card">
                        <CalendarCheck size={24} className="fact-icon" />
                        <span className="fact-label">Founded</span>
                        <span className="fact-value">{company.foundedYear || 'Not Specified'}</span>
                    </div>
                </div>

                <Row>
                    {/* Left: About */}
                    <Col lg={8} className="mb-4">
                        <div className="glass-card p-4 h-100">
                            <h2 className="section-title d-flex align-items-center">
                                <Info size={24} className="me-2 text-teal" /> About {company.name}
                            </h2>
                            <div className="about-content">
                                {company.description || 'No description provided by the company.'}
                            </div>
                            
                            {company.officeAddress && (
                                <div className="mt-4 pt-4 border-top">
                                    <h5 className="text-muted mb-3">Office Address</h5>
                                    <p className="mb-0 d-flex align-items-center">
                                        <MapPin size={18} className="me-2 text-teal" />
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
                    <h2 className="section-title d-flex align-items-center">
                        <Briefcase size={24} className="me-2 text-teal" /> Open Positions at {company.name}
                    </h2>
                    {jobs.length > 0 ? (
                        <div className="jobs-list">
                            {jobs.map(job => (
                                <div key={job.jobPostId} className="job-item-card glass-card">
                                    <div className="job-info">
                                        <h3>{job.jobTitle}</h3>
                                        <div className="job-meta">
                                            <span className="d-inline-flex align-items-center"><MapPin size={14} className="me-1" /> {job.jobLocationId?.city || 'Location N/A'}</span>
                                            <span className="d-inline-flex align-items-center"><Clock size={14} className="me-1" /> {job.jobType}</span>
                                            {job.salary && <span className="d-inline-flex align-items-center"><Wallet size={14} className="me-1" /> {job.salary}</span>}
                                        </div>
                                    </div>
                                    <Link to={`/jobs/${job.jobPostId}`}>
                                        <Button className="view-job-btn d-inline-flex align-items-center">
                                            View Details <ArrowRight size={18} className="ms-2" />
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
