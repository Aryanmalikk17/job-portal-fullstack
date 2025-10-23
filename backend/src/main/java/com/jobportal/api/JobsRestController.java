package com.jobportal.api;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.JobCreateRequestDto;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.JobCompany;
import com.jobportal.entity.JobLocation;
import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.JobSeekerApply;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.JobSeekerSave;
import com.jobportal.entity.Users;
import com.jobportal.repository.JobCompanyRepository;
import com.jobportal.repository.JobLocationRepository;
import com.jobportal.services.JobPostActivityService;
import com.jobportal.services.JobSeekerApplyService;
import com.jobportal.services.JobSeekerSaveService;
import com.jobportal.services.UsersService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class JobsRestController {

    private static final Logger logger = LoggerFactory.getLogger(JobsRestController.class);

    @Autowired
    private JobPostActivityService jobPostActivityService;

    @Autowired
    private JobSeekerApplyService jobSeekerApplyService;

    @Autowired
    private JobSeekerSaveService jobSeekerSaveService;

    @Autowired
    private UsersService usersService;

    @Autowired
    private JobLocationRepository jobLocationRepository;

    @Autowired
    private JobCompanyRepository jobCompanyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponse>>> getAllJobs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "job", required = false) String job,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "jobType", required = false) List<String> jobTypes,
            @RequestParam(value = "remote", required = false) List<String> remoteOptions,
            @RequestParam(value = "days", required = false) Integer days) {
        
        try {
            // If search parameters are provided, use search functionality
            if (StringUtils.hasText(job) || StringUtils.hasText(location) || 
                (jobTypes != null && !jobTypes.isEmpty()) || 
                (remoteOptions != null && !remoteOptions.isEmpty()) || 
                days != null) {
                
                return searchJobs(job, location, jobTypes, remoteOptions, days);
            }

            List<JobPostActivity> jobs = jobPostActivityService.getAll();
            
            // Convert to JobResponse DTOs
            List<JobResponse> jobResponses = jobs.stream()
                .map(this::convertToJobResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Jobs retrieved successfully", jobResponses));
        } catch (Exception e) {
            logger.error("Error retrieving jobs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving jobs", null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<JobResponse>>> searchJobs(
            @RequestParam(value = "job", required = false) String job,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "jobType", required = false) List<String> jobTypes,
            @RequestParam(value = "remote", required = false) List<String> remoteOptions,
            @RequestParam(value = "days", required = false) Integer days) {
        
        try {
            LocalDate searchDate = null;
            if (days != null && days > 0) {
                searchDate = LocalDate.now().minusDays(days);
            }

            // Set defaults if not provided
            if (jobTypes == null || jobTypes.isEmpty()) {
                jobTypes = Arrays.asList("Part-Time", "Full-Time", "Freelance", "InternShip");
            }
            if (remoteOptions == null || remoteOptions.isEmpty()) {
                remoteOptions = Arrays.asList("Remote-Only", "Office-Only", "Partial-Remote");
            }

            List<JobPostActivity> jobs;
            if (!StringUtils.hasText(job) && !StringUtils.hasText(location) && searchDate == null) {
                jobs = jobPostActivityService.getAll();
            } else {
                jobs = jobPostActivityService.search(job, location, jobTypes, remoteOptions, searchDate);
            }

            List<JobResponse> jobResponses = jobs.stream()
                .map(this::convertToJobResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Search completed successfully", jobResponses));
        } catch (Exception e) {
            logger.error("Error searching jobs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error searching jobs", null));
        }
    }

    // NEW: Add GET endpoint for job creation form - MUST come before /{id} endpoint
    @GetMapping("/create")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCreateJobForm() {
        try {
            // Return form metadata (companies, locations, etc.)
            Map<String, Object> formData = new HashMap<>();
            
            // Get available companies
            List<JobCompany> companies = jobCompanyRepository.findAll();
            formData.put("companies", companies);
            
            // Get available locations  
            List<JobLocation> locations = jobLocationRepository.findAll();
            formData.put("locations", locations);
            
            // Add job type options
            formData.put("jobTypes", Arrays.asList("Full-Time", "Part-Time", "Contract", "Freelance", "InternShip"));
            
            // Add remote options
            formData.put("remoteOptions", Arrays.asList("Office-Only", "Remote-Only", "Partial-Remote"));
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Create job form data retrieved", formData));
        } catch (Exception e) {
            logger.error("Error getting create job form data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error getting form data", null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(@PathVariable Integer id) {
        try {
            JobPostActivity job = jobPostActivityService.getOne(id);
            if (job == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            JobResponse jobResponse = convertToJobResponse(job);
            
            // Add user-specific data if authenticated
            try {
                Users currentUser = usersService.getCurrentUser();
                if (currentUser != null && "Job Seeker".equals(currentUser.getUserTypeId().getUserTypeName())) {
                    Object profile = usersService.getCurrentUserProfile();
                    if (profile instanceof JobSeekerProfile) {
                        JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;
                        
                        // Check if applied
                        List<JobSeekerApply> applications = jobSeekerApplyService.getCandidatesJobs(seekerProfile);
                        boolean hasApplied = applications.stream()
                            .anyMatch(apply -> Objects.equals(apply.getJob().getJobPostId(), id));
                        
                        // Check if saved
                        List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
                        boolean hasSaved = savedJobs.stream()
                            .anyMatch(save -> Objects.equals(save.getJob().getJobPostId(), id));
                        
                        jobResponse.setApplied(hasApplied);
                        jobResponse.setSaved(hasSaved);
                    }
                }
            } catch (Exception e) {
                // Continue without user-specific data if not authenticated
                logger.debug("User not authenticated or error getting user data", e);
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Job retrieved successfully", jobResponse));
        } catch (Exception e) {
            logger.error("Error retrieving job with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving job", null));
        }
    }

    // New endpoint for checking job status (applied/saved) - Frontend compatibility
    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkJobStatus(@PathVariable Integer id) {
        try {
            Map<String, Boolean> status = new HashMap<>();
            status.put("alreadyApplied", false);
            status.put("alreadySaved", false);

            Users currentUser = usersService.getCurrentUser();
            if (currentUser != null && "Job Seeker".equals(currentUser.getUserTypeId().getUserTypeName())) {
                Object profile = usersService.getCurrentUserProfile();
                if (profile instanceof JobSeekerProfile) {
                    JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;
                    
                    // Check if applied
                    List<JobSeekerApply> applications = jobSeekerApplyService.getCandidatesJobs(seekerProfile);
                    boolean hasApplied = applications.stream()
                        .anyMatch(apply -> Objects.equals(apply.getJob().getJobPostId(), id));
                    
                    // Check if saved
                    List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
                    boolean hasSaved = savedJobs.stream()
                        .anyMatch(save -> Objects.equals(save.getJob().getJobPostId(), id));
                    
                    status.put("alreadyApplied", hasApplied);
                    status.put("alreadySaved", hasSaved);
                }
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Job status retrieved", status));
        } catch (Exception e) {
            logger.error("Error checking job status for id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error checking job status", null));
        }
    }

    // Get candidates for a job - Frontend compatibility
    @GetMapping("/{id}/candidates")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getJobCandidates(@PathVariable Integer id) {
        try {
            JobPostActivity job = jobPostActivityService.getOne(id);
            if (job == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            // Verify the current user owns this job
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null || !Objects.equals(job.getPostedById().getUserId(), currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You don't have permission to view candidates for this job", null));
            }

            List<JobSeekerApply> applications = jobSeekerApplyService.getJobCandidates(job);
            List<Map<String, Object>> candidates = applications.stream()
                .map(apply -> {
                    Map<String, Object> candidate = new HashMap<>();
                    JobSeekerProfile profile = apply.getUserId();
                    Users user = usersService.findById(profile.getUserAccountId());
                    
                    if (user != null) {
                        candidate.put("applicationId", apply.getId()); // Fixed: use getId() instead of getApplyId()
                        candidate.put("userId", user.getUserId());
                        candidate.put("firstName", user.getFirstName());
                        candidate.put("lastName", user.getLastName());
                        candidate.put("email", user.getEmail());
                        candidate.put("appliedDate", apply.getApplyDate());
                        candidate.put("workAuthorization", profile.getWorkAuthorization());
                        candidate.put("employmentType", profile.getEmploymentType());
                        candidate.put("resume", profile.getResume());
                        candidate.put("profilePhoto", profile.getProfilePhoto());
                    }
                    return candidate;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidates retrieved successfully", candidates));

        } catch (Exception e) {
            logger.error("Error retrieving candidates for job id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving candidates", null));
        }
    }

    // Get recruiter's jobs - Frontend compatibility
    @GetMapping("/recruiter")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getRecruiterJobs() {
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            // Get all jobs posted by the current recruiter
            List<JobPostActivity> allJobs = jobPostActivityService.getAll();
            List<JobPostActivity> recruiterJobs = allJobs.stream()
                .filter(job -> job.getPostedById() != null && 
                              Objects.equals(job.getPostedById().getUserId(), currentUser.getUserId()))
                .collect(Collectors.toList());

            List<JobResponse> jobResponses = recruiterJobs.stream()
                .map(this::convertToJobResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Recruiter jobs retrieved successfully", jobResponses));

        } catch (Exception e) {
            logger.error("Error retrieving recruiter jobs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving recruiter jobs", null));
        }
    }

    // Alias endpoint for job creation - Frontend compatibility
    @PostMapping
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<JobResponse>> createJobAlias(@Valid @RequestBody JobCreateRequestDto jobRequest) {
        return createJob(jobRequest);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@Valid @RequestBody JobCreateRequestDto jobRequest) {
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            JobPostActivity job = new JobPostActivity();
            job.setJobTitle(jobRequest.getJobTitle());
            job.setDescriptionOfJob(jobRequest.getDescriptionOfJob());
            job.setJobType(jobRequest.getJobType());
            job.setSalary(jobRequest.getSalary());
            job.setRemote(jobRequest.getRemote());
            job.setPostedById(currentUser);
            job.setPostedDate(new Date());

            // FIXED: Handle location properly
            if (jobRequest.getJobLocationId() != null) {
                try {
                    Optional<JobLocation> location = jobLocationRepository.findById(jobRequest.getJobLocationId());
                    if (location.isPresent()) {
                        job.setJobLocationId(location.get());
                        logger.info("Set job location: {}", location.get().getCity());
                    } else {
                        logger.warn("Invalid job location ID: {}", jobRequest.getJobLocationId());
                    }
                } catch (Exception e) {
                    logger.warn("Error setting job location ID: {}", jobRequest.getJobLocationId(), e);
                }
            }

            // FIXED: Handle company properly
            if (jobRequest.getJobCompanyId() != null) {
                try {
                    Optional<JobCompany> company = jobCompanyRepository.findById(jobRequest.getJobCompanyId());
                    if (company.isPresent()) {
                        job.setJobCompanyId(company.get());
                        logger.info("Set job company: {}", company.get().getName());
                    } else {
                        logger.warn("Invalid job company ID: {}", jobRequest.getJobCompanyId());
                    }
                } catch (Exception e) {
                    logger.warn("Error setting job company ID: {}", jobRequest.getJobCompanyId(), e);
                }
            }

            JobPostActivity savedJob = jobPostActivityService.addNew(job);
            JobResponse jobResponse = convertToJobResponse(savedJob);

            logger.info("Job created successfully with ID: {}", savedJob.getJobPostId());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Job created successfully", jobResponse));

        } catch (Exception e) {
            logger.error("Error creating job", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error creating job: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(@PathVariable Integer id, @Valid @RequestBody JobCreateRequestDto jobRequest) {
        try {
            JobPostActivity existingJob = jobPostActivityService.getOne(id);
            if (existingJob == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null || !Objects.equals(existingJob.getPostedById().getUserId(), currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You don't have permission to edit this job", null));
            }

            // Update job fields
            existingJob.setJobTitle(jobRequest.getJobTitle());
            existingJob.setDescriptionOfJob(jobRequest.getDescriptionOfJob());
            existingJob.setJobType(jobRequest.getJobType());
            existingJob.setSalary(jobRequest.getSalary());
            existingJob.setRemote(jobRequest.getRemote());

            JobPostActivity updatedJob = jobPostActivityService.addNew(existingJob);
            JobResponse jobResponse = convertToJobResponse(updatedJob);

            return ResponseEntity.ok(new ApiResponse<>(true, "Job updated successfully", jobResponse));

        } catch (Exception e) {
            logger.error("Error updating job with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating job", null));
        }
    }

    // Delete job endpoint - Frontend compatibility
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Recruiter')")
    public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Integer id) {
        try {
            JobPostActivity existingJob = jobPostActivityService.getOne(id);
            if (existingJob == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null || !Objects.equals(existingJob.getPostedById().getUserId(), currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You don't have permission to delete this job", null));
            }

            jobPostActivityService.deleteJob(existingJob);

            return ResponseEntity.ok(new ApiResponse<>(true, "Job deleted successfully", null));

        } catch (Exception e) {
            logger.error("Error deleting job with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting job", null));
        }
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasAuthority('Job Seeker')")
    public ResponseEntity<ApiResponse<String>> applyForJob(@PathVariable Integer id) {
        try {
            JobPostActivity job = jobPostActivityService.getOne(id);
            if (job == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            Object profile = usersService.getCurrentUserProfile();
            
            if (!(profile instanceof JobSeekerProfile)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can apply for jobs", null));
            }

            JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;

            // Check if already applied
            List<JobSeekerApply> existingApplications = jobSeekerApplyService.getCandidatesJobs(seekerProfile);
            boolean hasApplied = existingApplications.stream()
                .anyMatch(apply -> Objects.equals(apply.getJob().getJobPostId(), id));

            if (hasApplied) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(false, "You have already applied for this job", null));
            }

            // Create application
            JobSeekerApply application = new JobSeekerApply();
            application.setUserId(seekerProfile);
            application.setJob(job);
            application.setApplyDate(new Date());

            jobSeekerApplyService.addNew(application);

            return ResponseEntity.ok(new ApiResponse<>(true, "Application submitted successfully", null));

        } catch (Exception e) {
            logger.error("Error applying for job with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error submitting application", null));
        }
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('Job Seeker')")
    public ResponseEntity<ApiResponse<String>> saveJob(@PathVariable Integer id) {
        try {
            JobPostActivity job = jobPostActivityService.getOne(id);
            if (job == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Job not found", null));
            }

            Object profile = usersService.getCurrentUserProfile();
            if (!(profile instanceof JobSeekerProfile)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can save jobs", null));
            }

            JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;

            // Check if already saved
            List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
            boolean hasSaved = savedJobs.stream()
                .anyMatch(save -> Objects.equals(save.getJob().getJobPostId(), id));

            if (hasSaved) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(false, "Job is already saved", null));
            }

            // Save job
            JobSeekerSave savedJob = new JobSeekerSave();
            savedJob.setUserId(seekerProfile);
            savedJob.setJob(job);

            jobSeekerSaveService.addNew(savedJob);

            return ResponseEntity.ok(new ApiResponse<>(true, "Job saved successfully", null));

        } catch (Exception e) {
            logger.error("Error saving job with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error saving job", null));
        }
    }

    @DeleteMapping("/{jobId}/unsave")
    @PreAuthorize("hasAuthority('Job Seeker')")
    public ResponseEntity<ApiResponse<String>> unsaveJob(@PathVariable Integer jobId) {
        try {
            Object profile = usersService.getCurrentUserProfile();
            if (!(profile instanceof JobSeekerProfile)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can unsave jobs", null));
            }

            JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;
            List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
            
            Optional<JobSeekerSave> savedJob = savedJobs.stream()
                .filter(save -> Objects.equals(save.getJob().getJobPostId(), jobId))
                .findFirst();

            if (savedJob.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Saved job not found", null));
            }

            jobSeekerSaveService.delete(savedJob.get());

            return ResponseEntity.ok(new ApiResponse<>(true, "Job unsaved successfully", null));

        } catch (Exception e) {
            logger.error("Error unsaving job with id: {}", jobId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error unsaving job", null));
        }
    }

    private JobResponse convertToJobResponse(JobPostActivity job) {
        JobResponse response = new JobResponse();
        response.setJobPostId(job.getJobPostId());
        response.setJobTitle(job.getJobTitle());
        response.setDescriptionOfJob(job.getDescriptionOfJob());
        response.setJobType(job.getJobType());
        response.setSalary(job.getSalary());
        response.setRemote(job.getRemote());
        response.setPostedDate(job.getPostedDate());
        
        // FIXED: Properly set postedBy information using RecruiterInfo class
        if (job.getPostedById() != null) {
            JobResponse.RecruiterInfo recruiterInfo = new JobResponse.RecruiterInfo(
                job.getPostedById().getUserId(),
                job.getPostedById().getFirstName(),
                job.getPostedById().getLastName(),
                job.getPostedById().getEmail()
            );
            response.setPostedBy(recruiterInfo);
            response.setPostedByEmail(job.getPostedById().getEmail());
        }
        
        if (job.getJobLocationId() != null) {
            response.setJobLocation(job.getJobLocationId().getCity() + ", " + job.getJobLocationId().getCountry());
        }
        
        if (job.getJobCompanyId() != null) {
            response.setCompanyName(job.getJobCompanyId().getName());
        }
        
        return response;
    }
}