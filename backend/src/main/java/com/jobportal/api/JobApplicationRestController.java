package com.jobportal.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.JobSeekerApply;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.RecruiterProfile;
import com.jobportal.entity.Users;
import com.jobportal.services.JobPostActivityService;
import com.jobportal.services.JobSeekerApplyService;
import com.jobportal.services.JobSeekerProfileService;
import com.jobportal.services.RecruiterProfileService;
import com.jobportal.services.UsersService;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class JobApplicationRestController {

    private final JobSeekerApplyService jobSeekerApplyService;
    private final JobPostActivityService jobPostActivityService;
    private final JobSeekerProfileService jobSeekerProfileService;
    private final RecruiterProfileService recruiterProfileService;
    private final UsersService usersService;

    @Autowired
    public JobApplicationRestController(
            JobSeekerApplyService jobSeekerApplyService,
            JobPostActivityService jobPostActivityService,
            JobSeekerProfileService jobSeekerProfileService,
            RecruiterProfileService recruiterProfileService,
            UsersService usersService) {
        this.jobSeekerApplyService = jobSeekerApplyService;
        this.jobPostActivityService = jobPostActivityService;
        this.jobSeekerProfileService = jobSeekerProfileService;
        this.recruiterProfileService = recruiterProfileService;
        this.usersService = usersService;
    }

    // DTO Classes for Request/Response
    public static class JobApplicationRequest {
        private String coverLetter;
        private String resumePath;

        // Constructors
        public JobApplicationRequest() {}

        public JobApplicationRequest(String coverLetter, String resumePath) {
            this.coverLetter = coverLetter;
            this.resumePath = resumePath;
        }

        // Getters and Setters
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    }

    public static class ApplicationStatusUpdateRequest {
        private JobSeekerApply.ApplicationStatus status;
        private String recruiterNotes;

        // Constructors
        public ApplicationStatusUpdateRequest() {}

        public ApplicationStatusUpdateRequest(JobSeekerApply.ApplicationStatus status, String recruiterNotes) {
            this.status = status;
            this.recruiterNotes = recruiterNotes;
        }

        // Getters and Setters
        public JobSeekerApply.ApplicationStatus getStatus() { return status; }
        public void setStatus(JobSeekerApply.ApplicationStatus status) { this.status = status; }
        public String getRecruiterNotes() { return recruiterNotes; }
        public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
    }

    public static class ApplicationResponse {
        private Integer id;
        private Integer jobId;
        private String jobTitle;
        private String companyName;
        private String jobLocation;
        private String applicantName;
        private String applicantEmail;
        private String coverLetter;
        private JobSeekerApply.ApplicationStatus status;
        private String applyDate;
        private String lastUpdated;
        private String recruiterNotes;
        private String resumePath;

        // Constructor and getters/setters
        public ApplicationResponse() {}

        // Static factory method to create from entity
        public static ApplicationResponse fromEntity(JobSeekerApply application) {
            ApplicationResponse response = new ApplicationResponse();
            response.setId(application.getId());
            response.setJobId(application.getJob().getJobPostId());
            response.setJobTitle(application.getJob().getJobTitle());
            response.setCompanyName(application.getJob().getJobCompanyId() != null ? 
                application.getJob().getJobCompanyId().getName() : "Company");
            response.setJobLocation(application.getJob().getJobLocationId() != null ?
                application.getJob().getJobLocationId().getCity() + ", " + 
                application.getJob().getJobLocationId().getState() : null);
            
            // FIXED: Access applicant name directly from JobSeekerProfile
            String firstName = application.getUserId().getFirstName();
            String lastName = application.getUserId().getLastName();
            String fullName = ((firstName != null ? firstName : "") + " " + 
                (lastName != null ? lastName : "")).trim();
            response.setApplicantName(fullName);
            
            // Access email from the Users entity
            response.setApplicantEmail(application.getUserId().getUserId().getEmail());
            response.setCoverLetter(application.getCoverLetter());
            response.setStatus(application.getStatus());
            response.setApplyDate(application.getApplyDate() != null ? 
                application.getApplyDate().toString() : null);
            response.setLastUpdated(application.getLastUpdated() != null ? 
                application.getLastUpdated().toString() : null);
            response.setRecruiterNotes(application.getRecruiterNotes());
            response.setResumePath(application.getResumePath());
            return response;
        }

        // Getters and Setters
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public Integer getJobId() { return jobId; }
        public void setJobId(Integer jobId) { this.jobId = jobId; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getJobLocation() { return jobLocation; }
        public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }
        public String getApplicantName() { return applicantName; }
        public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
        public String getApplicantEmail() { return applicantEmail; }
        public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
        public JobSeekerApply.ApplicationStatus getStatus() { return status; }
        public void setStatus(JobSeekerApply.ApplicationStatus status) { this.status = status; }
        public String getApplyDate() { return applyDate; }
        public void setApplyDate(String applyDate) { this.applyDate = applyDate; }
        public String getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
        public String getRecruiterNotes() { return recruiterNotes; }
        public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    }

    // JOB SEEKER ENDPOINTS

    /**
     * Apply for a job
     */
    @PostMapping("/job/{jobId}/apply")
    public ResponseEntity<?> applyForJob(@PathVariable Integer jobId, 
                                       @RequestBody JobApplicationRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<JobSeekerProfile> jobSeekerOpt = jobSeekerProfileService.getOne(currentUser.getUserId());
            if (jobSeekerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only job seekers can apply for jobs"));
            }

            JobPostActivity job = jobPostActivityService.getOne(jobId);
            if (job == null) {
                return ResponseEntity.notFound().build();
            }

            JobSeekerApply application = jobSeekerApplyService.applyForJob(
                jobSeekerOpt.get(), job, request.getCoverLetter(), request.getResumePath());

            return ResponseEntity.ok(ApplicationResponse.fromEntity(application));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to apply for job: " + e.getMessage()));
        }
    }

    /**
     * Get user's applications
     */
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<JobSeekerProfile> jobSeekerOpt = jobSeekerProfileService.getOne(currentUser.getUserId());
            if (jobSeekerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only job seekers can view applications"));
            }

            List<JobSeekerApply> applications = jobSeekerApplyService.getCandidatesJobs(jobSeekerOpt.get());
            List<ApplicationResponse> response = applications.stream()
                .map(ApplicationResponse::fromEntity)
                .toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get applications: " + e.getMessage()));
        }
    }

    /**
     * Withdraw application
     */
    @PutMapping("/{applicationId}/withdraw")
    public ResponseEntity<?> withdrawApplication(@PathVariable Integer applicationId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<JobSeekerProfile> jobSeekerOpt = jobSeekerProfileService.getOne(currentUser.getUserId());
            if (jobSeekerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only job seekers can withdraw applications"));
            }

            JobSeekerApply application = jobSeekerApplyService.withdrawApplication(applicationId, jobSeekerOpt.get());
            return ResponseEntity.ok(ApplicationResponse.fromEntity(application));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to withdraw application: " + e.getMessage()));
        }
    }

    /**
     * Check if user has applied for a job
     */
    @GetMapping("/job/{jobId}/status")
    public ResponseEntity<?> getApplicationStatus(@PathVariable Integer jobId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<JobSeekerProfile> jobSeekerOpt = jobSeekerProfileService.getOne(currentUser.getUserId());
            if (jobSeekerOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("hasApplied", false));
            }

            JobPostActivity job = jobPostActivityService.getOne(jobId);
            if (job == null) {
                return ResponseEntity.notFound().build();
            }

            boolean hasApplied = jobSeekerApplyService.hasUserAppliedForJob(jobSeekerOpt.get(), job);
            return ResponseEntity.ok(Map.of("hasApplied", hasApplied));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to check application status: " + e.getMessage()));
        }
    }

    // RECRUITER ENDPOINTS

    /**
     * Get applications for recruiter's jobs
     */
    @GetMapping("/recruiter/applications")
    public ResponseEntity<?> getRecruiterApplications(
            @RequestParam(required = false) JobSeekerApply.ApplicationStatus status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<RecruiterProfile> recruiterOpt = recruiterProfileService.getOne(currentUser.getUserId());
            if (recruiterOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only recruiters can view job applications"));
            }

            List<JobSeekerApply> applications;
            if (status != null) {
                applications = jobSeekerApplyService.getApplicationsForRecruiterByStatus(
                    currentUser.getUserId(), status);
            } else {
                applications = jobSeekerApplyService.getApplicationsForRecruiter(currentUser.getUserId());
            }

            List<ApplicationResponse> response = applications.stream()
                .map(ApplicationResponse::fromEntity)
                .toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get applications: " + e.getMessage()));
        }
    }

    /**
     * Get applications for a specific job
     */
    @GetMapping("/job/{jobId}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Integer jobId,
            @RequestParam(required = false) JobSeekerApply.ApplicationStatus status) {
        try {
            JobPostActivity job = jobPostActivityService.getOne(jobId);
            if (job == null) {
                return ResponseEntity.notFound().build();
            }

            // Verify the recruiter owns this job
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            if (!Objects.equals(job.getPostedById().getUserId(), currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only view applications for your own jobs"));
            }

            List<JobSeekerApply> applications;
            if (status != null) {
                applications = jobSeekerApplyService.getJobApplicationsByStatus(job, status);
            } else {
                applications = jobSeekerApplyService.getJobCandidates(job);
            }

            List<ApplicationResponse> response = applications.stream()
                .map(ApplicationResponse::fromEntity)
                .toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get job applications: " + e.getMessage()));
        }
    }

    /**
     * Update application status (recruiter only)
     */
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Integer applicationId,
                                                   @RequestBody ApplicationStatusUpdateRequest request) {
        try {
            // Verify the recruiter owns the job for this application
            Optional<JobSeekerApply> applicationOpt = jobSeekerApplyService.getApplicationById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());

            JobSeekerApply application = applicationOpt.get();
            if (!Objects.equals(application.getJob().getPostedById().getUserId(), currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update applications for your own jobs"));
            }

            JobSeekerApply updatedApplication = jobSeekerApplyService.updateApplicationStatus(
                applicationId, request.getStatus(), request.getRecruiterNotes());

            return ResponseEntity.ok(ApplicationResponse.fromEntity(updatedApplication));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update application status: " + e.getMessage()));
        }
    }

    /**
     * Get application statistics for recruiter
     */
    @GetMapping("/recruiter/statistics")
    public ResponseEntity<?> getRecruiterStatistics() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<RecruiterProfile> recruiterOpt = recruiterProfileService.getOne(currentUser.getUserId());
            if (recruiterOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only recruiters can view statistics"));
            }

            Map<String, Long> statistics = jobSeekerApplyService.getApplicationStatisticsForRecruiter(currentUser.getUserId());
            Long totalApplications = jobSeekerApplyService.countApplicationsForRecruiter(currentUser.getUserId());
            
            Map<String, Object> response = new HashMap<>(statistics);
            response.put("totalApplications", totalApplications);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get statistics: " + e.getMessage()));
        }
    }

    /**
     * Get recent applications for recruiter
     */
    @GetMapping("/recruiter/recent")
    public ResponseEntity<?> getRecentApplications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            Optional<RecruiterProfile> recruiterOpt = recruiterProfileService.getOne(currentUser.getUserId());
            if (recruiterOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only recruiters can view applications"));
            }

            List<JobSeekerApply> applications = jobSeekerApplyService.getRecentApplicationsForRecruiter(currentUser.getUserId());
            List<ApplicationResponse> response = applications.stream()
                .map(ApplicationResponse::fromEntity)
                .toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get recent applications: " + e.getMessage()));
        }
    }

    // COMMON ENDPOINTS

    /**
     * Get application by ID
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getApplication(@PathVariable Integer applicationId) {
        try {
            Optional<JobSeekerApply> applicationOpt = jobSeekerApplyService.getApplicationById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            JobSeekerApply application = applicationOpt.get();
            
            // Verify user has permission to view this application
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Users currentUser = usersService.findByEmail(auth.getName());
            
            boolean isOwner = Objects.equals(application.getUserId().getUserAccountId(), currentUser.getUserId());
            boolean isRecruiter = Objects.equals(application.getJob().getPostedById().getUserId(), currentUser.getUserId());
            
            if (!isOwner && !isRecruiter) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to view this application"));
            }

            return ResponseEntity.ok(ApplicationResponse.fromEntity(application));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get application: " + e.getMessage()));
        }
    }

    /**
     * Get available application statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<?> getApplicationStatuses() {
        try {
            Map<String, String> statuses = new HashMap<>();
            for (JobSeekerApply.ApplicationStatus status : JobSeekerApply.ApplicationStatus.values()) {
                statuses.put(status.name(), status.getDisplayName());
            }
            return ResponseEntity.ok(statuses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get statuses: " + e.getMessage()));
        }
    }
}