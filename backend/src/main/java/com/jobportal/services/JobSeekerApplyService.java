package com.jobportal.services;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.JobSeekerApply;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.repository.JobSeekerApplyRepository;

@Service
public class JobSeekerApplyService {

    private final JobSeekerApplyRepository jobSeekerApplyRepository;

    @Autowired
    public JobSeekerApplyService(JobSeekerApplyRepository jobSeekerApplyRepository) {
        this.jobSeekerApplyRepository = jobSeekerApplyRepository;
    }

    // Original methods
    public List<JobSeekerApply> getCandidatesJobs(JobSeekerProfile userAccountId) {
        return jobSeekerApplyRepository.findByUserId(userAccountId);
    }

    public List<JobSeekerApply> getJobCandidates(JobPostActivity job) {
        return jobSeekerApplyRepository.findByJob(job);
    }

    public void addNew(JobSeekerApply jobSeekerApply) {
        jobSeekerApplyRepository.save(jobSeekerApply);
    }

    // Enhanced methods for complete application management

    /**
     * Apply for a job with validation
     */
    public JobSeekerApply applyForJob(JobSeekerProfile jobSeeker, JobPostActivity job, String coverLetter, String resumePath) {
        // Check if already applied
        Optional<JobSeekerApply> existingApplication = jobSeekerApplyRepository.findByUserIdAndJob(jobSeeker, job);
        if (existingApplication.isPresent()) {
            throw new IllegalStateException("User has already applied for this job");
        }

        JobSeekerApply application = new JobSeekerApply();
        application.setUserId(jobSeeker);
        application.setJob(job);
        application.setCoverLetter(coverLetter);
        application.setResumePath(resumePath);
        application.setApplyDate(new Date());
        application.setStatus(JobSeekerApply.ApplicationStatus.APPLIED);
        application.setLastUpdated(new Date());

        return jobSeekerApplyRepository.save(application);
    }

    /**
     * Check if user has already applied for a job
     */
    public boolean hasUserAppliedForJob(JobSeekerProfile jobSeeker, JobPostActivity job) {
        return jobSeekerApplyRepository.findByUserIdAndJob(jobSeeker, job).isPresent();
    }

    /**
     * Get application by ID
     */
    public Optional<JobSeekerApply> getApplicationById(Integer applicationId) {
        return jobSeekerApplyRepository.findById(applicationId);
    }

    /**
     * Update application status (for recruiters) - ENHANCED with transaction management
     */
    @Transactional
    public JobSeekerApply updateApplicationStatus(Integer applicationId, JobSeekerApply.ApplicationStatus newStatus, String recruiterNotes) {
        Optional<JobSeekerApply> applicationOpt = jobSeekerApplyRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found with ID: " + applicationId);
        }

        JobSeekerApply application = applicationOpt.get();
        
        // Validate status transition
        if (!isValidStatusTransition(application.getStatus(), newStatus)) {
            throw new IllegalStateException("Invalid status transition from " + 
                application.getStatus() + " to " + newStatus);
        }
        
        // Update status and notes
        JobSeekerApply.ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(newStatus);
        
        if (recruiterNotes != null && !recruiterNotes.trim().isEmpty()) {
            application.setRecruiterNotes(recruiterNotes);
        }
        
        application.setLastUpdated(new Date());

        // Save with explicit flush to ensure immediate persistence
        JobSeekerApply savedApplication = jobSeekerApplyRepository.save(application);
        jobSeekerApplyRepository.flush();
        
        // Log the status change for audit trail
        System.out.println("Application ID " + applicationId + " status updated from " + 
            oldStatus + " to " + newStatus + " at " + new Date());
        
        return savedApplication;
    }
    
    /**
     * Validate if status transition is allowed
     */
    private boolean isValidStatusTransition(JobSeekerApply.ApplicationStatus currentStatus, 
                                          JobSeekerApply.ApplicationStatus newStatus) {
        // Allow any transition for now, but log invalid ones
        if (currentStatus == JobSeekerApply.ApplicationStatus.HIRED && 
            newStatus != JobSeekerApply.ApplicationStatus.HIRED) {
            System.out.println("WARNING: Changing status from HIRED to " + newStatus);
        }
        
        if (currentStatus == JobSeekerApply.ApplicationStatus.WITHDRAWN && 
            newStatus != JobSeekerApply.ApplicationStatus.WITHDRAWN) {
            System.out.println("WARNING: Changing status from WITHDRAWN to " + newStatus);
        }
        
        return true; // Allow all transitions for flexibility
    }

    /**
     * Get all applications for a recruiter's jobs
     */
    public List<JobSeekerApply> getApplicationsForRecruiter(Integer recruiterId) {
        return jobSeekerApplyRepository.findApplicationsByRecruiterId(recruiterId);
    }

    /**
     * Get applications for a recruiter filtered by status
     */
    public List<JobSeekerApply> getApplicationsForRecruiterByStatus(Integer recruiterId, JobSeekerApply.ApplicationStatus status) {
        return jobSeekerApplyRepository.findApplicationsByRecruiterIdAndStatus(recruiterId, status);
    }

    /**
     * Get applications by status
     */
    public List<JobSeekerApply> getApplicationsByStatus(JobSeekerApply.ApplicationStatus status) {
        return jobSeekerApplyRepository.findByStatus(status);
    }

    /**
     * Get applications for a specific job filtered by status
     */
    public List<JobSeekerApply> getJobApplicationsByStatus(JobPostActivity job, JobSeekerApply.ApplicationStatus status) {
        return jobSeekerApplyRepository.findByJobAndStatus(job, status);
    }

    /**
     * Count total applications for a job
     */
    public Long countApplicationsForJob(JobPostActivity job) {
        return jobSeekerApplyRepository.countApplicationsByJob(job);
    }

    /**
     * Count total applications for a recruiter
     */
    public Long countApplicationsForRecruiter(Integer recruiterId) {
        return jobSeekerApplyRepository.countApplicationsByRecruiterId(recruiterId);
    }

    /**
     * Get recent applications for a recruiter (last 30 days)
     */
    public List<JobSeekerApply> getRecentApplicationsForRecruiter(Integer recruiterId) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.add(java.util.Calendar.DAY_OF_MONTH, -30);
        java.util.Date date30DaysAgo = cal.getTime();
        return jobSeekerApplyRepository.findRecentApplicationsByRecruiterId(recruiterId, date30DaysAgo);
    }

    /**
     * Get application statistics for a recruiter
     */
    public Map<String, Long> getApplicationStatisticsForRecruiter(Integer recruiterId) {
        List<Object[]> statusCounts = jobSeekerApplyRepository.getApplicationStatusCountsByRecruiterId(recruiterId);
        Map<String, Long> statistics = new HashMap<>();
        
        // Initialize all statuses with 0
        for (JobSeekerApply.ApplicationStatus status : JobSeekerApply.ApplicationStatus.values()) {
            statistics.put(status.name(), 0L);
        }
        
        // Fill actual counts
        for (Object[] statusCount : statusCounts) {
            JobSeekerApply.ApplicationStatus status = (JobSeekerApply.ApplicationStatus) statusCount[0];
            Long count = (Long) statusCount[1];
            statistics.put(status.name(), count);
        }
        
        return statistics;
    }

    /**
     * Withdraw application (for job seekers)
     */
    public JobSeekerApply withdrawApplication(Integer applicationId, JobSeekerProfile jobSeeker) {
        Optional<JobSeekerApply> applicationOpt = jobSeekerApplyRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found");
        }

        JobSeekerApply application = applicationOpt.get();
        
        // Verify the application belongs to the job seeker
        if (!application.getUserId().getUserAccountId().equals(jobSeeker.getUserAccountId())) {
            throw new IllegalArgumentException("Application does not belong to this user");
        }

        // Check if application can be withdrawn
        if (application.getStatus() == JobSeekerApply.ApplicationStatus.HIRED || 
            application.getStatus() == JobSeekerApply.ApplicationStatus.WITHDRAWN) {
            throw new IllegalStateException("Application cannot be withdrawn in current status: " + application.getStatus());
        }

        application.setStatus(JobSeekerApply.ApplicationStatus.WITHDRAWN);
        application.setLastUpdated(new Date());

        return jobSeekerApplyRepository.save(application);
    }

    /**
     * Delete application (admin only)
     */
    public void deleteApplication(Integer applicationId) {
        jobSeekerApplyRepository.deleteById(applicationId);
    }

    /**
     * Get all applications (admin only)
     */
    public List<JobSeekerApply> getAllApplications() {
        return jobSeekerApplyRepository.findAll();
    }
}
