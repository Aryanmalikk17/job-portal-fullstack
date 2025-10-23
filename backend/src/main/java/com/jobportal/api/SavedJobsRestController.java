package com.jobportal.api;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.JobSeekerSave;
import com.jobportal.entity.Users;
import com.jobportal.services.JobSeekerSaveService;
import com.jobportal.services.UsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SavedJobsRestController {

    private static final Logger logger = LoggerFactory.getLogger(SavedJobsRestController.class);

    @Autowired
    private UsersService usersService;

    @Autowired
    private JobSeekerSaveService jobSeekerSaveService;

    @GetMapping
    @PreAuthorize("hasAuthority('Job Seeker')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSavedJobs(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "remote", required = false) String remote,
            @RequestParam(value = "applied", required = false) String applied,
            @RequestParam(value = "sortBy", defaultValue = "savedAt") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {
        
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            Object profile = usersService.getCurrentUserProfile();
            if (!(profile instanceof JobSeekerProfile)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can access saved jobs", null));
            }

            JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;
            
            // Get all saved jobs for this job seeker
            List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
            
            // Convert to JobResponse format - ensure we return empty list if no jobs
            List<Map<String, Object>> jobResponses = savedJobs != null ? 
                savedJobs.stream()
                    .map(this::convertSavedJobToResponse)
                    .collect(Collectors.toList()) :
                new ArrayList<>();

            // Apply filters
            if (search != null && !search.trim().isEmpty()) {
                String searchTerm = search.toLowerCase().trim();
                jobResponses = jobResponses.stream()
                    .filter(job -> {
                        String title = (String) job.get("jobTitle");
                        String company = (String) job.get("companyName");
                        String location = (String) job.get("jobLocation");
                        return (title != null && title.toLowerCase().contains(searchTerm)) ||
                               (company != null && company.toLowerCase().contains(searchTerm)) ||
                               (location != null && location.toLowerCase().contains(searchTerm));
                    })
                    .collect(Collectors.toList());
            }

            if (type != null && !type.trim().isEmpty()) {
                jobResponses = jobResponses.stream()
                    .filter(job -> type.equals(job.get("jobType")))
                    .collect(Collectors.toList());
            }

            if (remote != null && !remote.trim().isEmpty()) {
                jobResponses = jobResponses.stream()
                    .filter(job -> {
                        String remoteValue = (String) job.get("remote");
                        if ("true".equals(remote)) {
                            return "Remote-Only".equals(remoteValue) || "Partial-Remote".equals(remoteValue);
                        } else {
                            return "Office-Only".equals(remoteValue);
                        }
                    })
                    .collect(Collectors.toList());
            }

            // Return the jobs list directly (frontend expects data to be the array)
            return ResponseEntity.ok(new ApiResponse<>(true, "Saved jobs retrieved successfully", jobResponses));

        } catch (Exception e) {
            logger.error("Error retrieving saved jobs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving saved jobs", new ArrayList<>()));
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('Job Seeker')")
    public ResponseEntity<ApiResponse<Integer>> getSavedJobsCount() {
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            Object profile = usersService.getCurrentUserProfile();
            if (!(profile instanceof JobSeekerProfile)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can access saved jobs count", null));
            }

            JobSeekerProfile seekerProfile = (JobSeekerProfile) profile;
            List<JobSeekerSave> savedJobs = jobSeekerSaveService.getCandidatesJob(seekerProfile);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Saved jobs count retrieved", savedJobs.size()));

        } catch (Exception e) {
            logger.error("Error retrieving saved jobs count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving saved jobs count", null));
        }
    }

    private Map<String, Object> convertSavedJobToResponse(JobSeekerSave savedJob) {
        Map<String, Object> response = new HashMap<>();
        
        if (savedJob.getJob() != null) {
            response.put("id", savedJob.getJob().getJobPostId());
            response.put("jobPostId", savedJob.getJob().getJobPostId());
            response.put("jobTitle", savedJob.getJob().getJobTitle());
            response.put("descriptionOfJob", savedJob.getJob().getDescriptionOfJob());
            response.put("jobType", savedJob.getJob().getJobType());
            response.put("salary", savedJob.getJob().getSalary());
            response.put("remote", savedJob.getJob().getRemote());
            response.put("postedDate", savedJob.getJob().getPostedDate());
            
            // Add location information
            if (savedJob.getJob().getJobLocationId() != null) {
                response.put("jobLocation", savedJob.getJob().getJobLocationId().getCity() + ", " + 
                           savedJob.getJob().getJobLocationId().getCountry());
                response.put("location", response.get("jobLocation"));
            }
            
            // Add company information
            if (savedJob.getJob().getJobCompanyId() != null) {
                response.put("companyName", savedJob.getJob().getJobCompanyId().getName());
                response.put("company", savedJob.getJob().getJobCompanyId().getName());
            }
            
            // Add poster information
            if (savedJob.getJob().getPostedById() != null) {
                Map<String, Object> postedBy = new HashMap<>();
                postedBy.put("userId", savedJob.getJob().getPostedById().getUserId());
                postedBy.put("firstName", savedJob.getJob().getPostedById().getFirstName());
                postedBy.put("lastName", savedJob.getJob().getPostedById().getLastName());
                postedBy.put("email", savedJob.getJob().getPostedById().getEmail());
                response.put("postedBy", postedBy);
                response.put("postedByEmail", savedJob.getJob().getPostedById().getEmail());
            }
        }
        
        // Add saved job specific info
        response.put("savedAt", savedJob.getId()); // Using save ID as savedAt placeholder
        response.put("isSaved", true);
        response.put("isApplied", false); // TODO: Check if user has applied to this job
        
        return response;
    }
}