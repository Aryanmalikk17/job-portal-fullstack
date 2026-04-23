import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Facebook, 
    Twitter, 
    Linkedin, 
    Instagram, 
    Mail, 
    Phone, 
    MapPin, 
    Heart
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-gray-300 font-sans border-t-2 border-brand-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-extrabold tracking-tight flex items-center group">
                            <span className="text-white">Zpluse</span>
                            <span className="text-brand-500 group-hover:text-brand-400 transition-colors ml-1">Jobs</span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-xs">
                            Empowering your career journey with precision matching. Connecting global talent with world-class opportunities through innovation.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { Icon: Facebook, href: "#" },
                                { Icon: Twitter, href: "#" },
                                { Icon: Linkedin, href: "#" },
                                { Icon: Instagram, href: "#" }
                            ].map(({ Icon, href }, i) => (
                                <a 
                                    key={i} 
                                    href={href} 
                                    className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-800 transition-all duration-300 shadow-sm"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Job Seekers Column */}
                    <div className="space-y-6">
                        <h5 className="text-white font-bold text-lg border-b border-brand-500/20 pb-2 inline-block">For Job Seekers</h5>
                        <ul className="space-y-3">
                            {[
                                { label: 'Browse Jobs', path: '/jobs' },
                                { label: 'My Profile', path: '/profile' },
                                { label: 'My Applications', path: '/my-applications' },
                                { label: 'Saved Jobs', path: '/saved-jobs' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="hover:text-brand-500 transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-brand-500/40 rounded-full mr-2 group-hover:bg-brand-500 transition-all"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recruiters Column */}
                    <div className="space-y-6">
                        <h5 className="text-white font-bold text-lg border-b border-brand-500/20 pb-2 inline-block">For Recruiters</h5>
                        <ul className="space-y-3">
                            {[
                                { label: 'Post a Job', path: '/register?type=recruiter' },
                                { label: 'Recruiter Dashboard', path: '/dashboard' },
                                { label: 'Manage Applications', path: '/applications' },
                                { label: 'Company Profile', path: '/companies' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="hover:text-brand-500 transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-brand-500/40 rounded-full mr-2 group-hover:bg-brand-500 transition-all"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-6">
                        <h5 className="text-white font-bold text-lg border-b border-brand-500/20 pb-2 inline-block">Get In Touch</h5>
                        <div className="space-y-4">
                            <div className="flex items-start group">
                                <MapPin size={20} className="text-brand-500 mt-1 mr-3 flex-shrink-0" />
                                <span className="group-hover:text-white transition-colors">Global Hub, Tech City, 10001</span>
                            </div>
                            <div className="flex items-center group">
                                <Phone size={20} className="text-brand-500 mr-3 flex-shrink-0" />
                                <span className="group-hover:text-white transition-colors">+1 (234) 567-890</span>
                            </div>
                            <div className="flex items-center group">
                                <Mail size={20} className="text-brand-500 mr-3 flex-shrink-0" />
                                <span className="group-hover:text-white transition-colors">support@zpluse.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p className="text-center md:text-left">
                        &copy; 2026 <span className="text-white font-medium">Zpluse Jobs Finder</span>. All rights reserved by Zpluse (<a href="https://www.zpluse.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">www.zpluse.com</a>)
                    </p>
                    <div className="flex items-center gap-1">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> for the future of work
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;