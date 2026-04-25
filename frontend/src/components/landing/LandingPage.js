import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Globe, 
  ShieldCheck, 
  Code,
  BarChart,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/dashboard?${params.toString()}`);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const categories = [
    { title: 'DevOps', icon: <Layers size={32} />, count: '1.2k+ Jobs' },
    { title: 'Data Science', icon: <BarChart size={32} />, count: '850+ Jobs' },
    { title: 'Design', icon: <Palette size={32} />, count: '600+ Jobs' },
    { title: 'Engineering', icon: <Code size={32} />, count: '2.4k+ Jobs' },
  ];

  const spotlightJobs = [
    { title: 'Senior Frontend Engineer', company: 'TechFlow', tags: ['Remote', 'Equity', 'High-Pay'], logo: '⚡' },
    { title: 'Product Designer', company: 'CreativeLab', tags: ['Hybrid', 'Full-time'], logo: '🎨' },
    { title: 'Data Scientist', company: 'DataMind', tags: ['Remote', 'AI/ML'], logo: '📊' },
  ];

  return (
    <div className="landing-container">
      {/* --- HERO SECTION --- */}
      <section className="hero-wrapper">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container"
        >
          <motion.h1 variants={fadeInUp} className="hero-massive-text">
            The quickest path to <br />
            <span>your next big move.</span>
          </motion.h1>

          <motion.div variants={fadeInUp} className="search-bar-wrapper">
            <form onSubmit={handleSearch} className="search-bar-container mx-auto">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="What job are you looking for?" 
                  className="search-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-input-wrapper">
                <MapPin className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Where (City or Remote)" 
                  className="search-field"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="search-submit-btn">
                Find Jobs
              </button>
            </form>
          </motion.div>

          <motion.div variants={fadeInUp} className="hero-trust-badges mt-5 d-flex flex-wrap justify-content-center gap-4 opacity-50">
            <div className="d-flex align-items-center gap-2">
              <TrendingUp size={16} /> <span>10k+ New Jobs Weekly</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Globe size={16} /> <span>Global Opportunities</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Briefcase size={16} /> <span>Top Tier Companies</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- SPOTLIGHT OPPORTUNITIES --- */}
      <section className="py-5 px-3">
        <div className="container py-5">
          <div className="section-header">
            <span className="section-tag">Curated for you</span>
            <h2 className="section-title">Spotlight Opportunities</h2>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="jobs-grid"
          >
            {spotlightJobs.map((job, index) => (
              <motion.article 
                key={index} 
                variants={fadeInUp}
                className="job-card-premium"
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="job-logo-wrapper" style={{ fontSize: '2rem' }}>{job.logo}</div>
                  <div className="job-badge-row">
                    {job.tags.map((tag, tIndex) => (
                      <span key={tIndex} className={`badge-premium ${tag === 'High-Pay' ? 'high-pay' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="h4 font-bold mb-1">{job.title}</h3>
                <p className="text-gray-400 mb-4">{job.company}</p>
                <button className="btn btn-link p-0 text-teal-400 d-flex align-items-center gap-2 text-decoration-none" style={{ color: 'var(--landing-teal)' }}>
                  View Details <ArrowRight size={16} />
                </button>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- EXPLORE CATEGORIES --- */}
      <section className="py-5 px-3 bg-opacity-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container py-5">
          <div className="section-header">
            <span className="section-tag">Browse by expertise</span>
            <h2 className="section-title">Explore Premium Categories</h2>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="category-grid"
          >
            {categories.map((cat, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="category-card"
                onClick={() => navigate(`/dashboard?q=${cat.title}`)}
              >
                <div className="category-icon-wrapper">
                  {cat.icon}
                </div>
                <h3 className="h5 font-bold mb-2">{cat.title}</h3>
                <p className="text-gray-400 text-sm mb-0">{cat.count}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-5 px-3">
        <div className="container py-5">
          <div className="section-header">
            <span className="section-tag">Community</span>
            <h2 className="section-title">Real Stories from Real Users</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="testimonial-card"
              >
                <div className="quote-mark">"</div>
                <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  "Zpluse helped me find a remote role at a top startup within 2 weeks. The matching precision is unlike anything I've seen before."
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-teal-500" style={{ width: 48, height: 48, background: 'var(--landing-teal)' }}></div>
                  <div>
                    <h4 className="h6 mb-0">Sarah Jenkins</h4>
                    <p className="text-sm text-gray-500 mb-0">Senior Product Designer</p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="testimonial-card"
              >
                <div className="quote-mark">"</div>
                <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  "As a recruiter, the quality of talent on Zpluse is exceptional. We've closed 5 key engineering roles using their premium funnel."
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-blue-500" style={{ width: 48, height: 48, background: 'var(--landing-blue)' }}></div>
                  <div>
                    <h4 className="h6 mb-0">Marcus Chen</h4>
                    <p className="text-sm text-gray-500 mb-0">Talent Acquisition, TechFlow</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECURITY TRUST --- */}
      <div className="security-mention">
        <ShieldCheck size={18} />
        <span>Enterprise-grade security. Verified SSL Protected. Your data is always encrypted.</span>
      </div>
    </div>
  );
};

export default LandingPage;
