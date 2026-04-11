import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import AddJobPage from './pages/AddJobPage';
import ProfilePage from './pages/ProfilePage';
import SavedJobsPage from './pages/SavedJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage'; // Updated import

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Job-related routes - SPECIFIC routes must come BEFORE parameterized routes */}
            <Route path="/jobs/create" element={
              <ProtectedRoute requiredRole="Recruiter">
                <AddJobPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/companies/:id" element={<CompanyDetailsPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/add-job" element={
              <ProtectedRoute requiredRole="Recruiter">
                <AddJobPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/saved-jobs" element={
              <ProtectedRoute requiredRole="Job Seeker">
                <SavedJobsPage />
              </ProtectedRoute>
            } />
            <Route path="/my-applications" element={
              <ProtectedRoute requiredRole="Job Seeker">
                <MyApplicationsPage />
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;