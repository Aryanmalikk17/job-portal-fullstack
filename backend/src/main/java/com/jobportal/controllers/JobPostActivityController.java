package com.jobportal.controllers;

import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.JobSeekerApply;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.JobSeekerSave;
import com.jobportal.entity.RecruiterJobsDto;
import com.jobportal.entity.RecruiterProfile;
import com.jobportal.entity.Users;
import com.jobportal.services.JobPostActivityService;
import com.jobportal.services.JobSeekerApplyService;
import com.jobportal.services.JobSeekerSaveService;
import com.jobportal.services.UsersService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Controller
public class JobPostActivityController {

    private static final Logger logger = LoggerFactory.getLogger(JobPostActivityController.class);

    private final UsersService usersService;
    private final JobPostActivityService jobPostActivityService;
    private final JobSeekerApplyService jobSeekerApplyService;
    private final JobSeekerSaveService jobSeekerSaveService;

    @Autowired
    public JobPostActivityController(UsersService usersService, JobPostActivityService jobPostActivityService, JobSeekerApplyService jobSeekerApplyService, JobSeekerSaveService jobSeekerSaveService) {
        this.usersService = usersService;
        this.jobPostActivityService = jobPostActivityService;
        this.jobSeekerApplyService = jobSeekerApplyService;
        this.jobSeekerSaveService = jobSeekerSaveService;
    }

    @GetMapping("/dashboard/")
    public String searchJobs(Model model,
                             @RequestParam(value = "job", required = false) String job,
                             @RequestParam(value = "location", required = false) String location,
                             @RequestParam(value = "internShip", required = false) String internShip,
                             @RequestParam(value = "partTime", required = false) String partTime,
                             @RequestParam(value = "fullTime", required = false) String fullTime,
                             @RequestParam(value = "freelance", required = false) String freelance,
                             @RequestParam(value = "remoteOnly", required = false) String remoteOnly,
                             @RequestParam(value = "officeOnly", required = false) String officeOnly,
                             @RequestParam(value = "partialRemote", required = false) String partialRemote,
                             @RequestParam(value = "today", required = false) boolean today,
                             @RequestParam(value = "days7", required = false) boolean days7,
                             @RequestParam(value = "days30", required = false) boolean days30

    ) {

    	model.addAttribute("internShip", Objects.equals(partTime, "InternShip"));
        model.addAttribute("partTime", Objects.equals(partTime, "Part-Time"));
        model.addAttribute("fullTime", Objects.equals(partTime, "Full-Time"));
        model.addAttribute("freelance", Objects.equals(partTime, "Freelance"));

        model.addAttribute("remoteOnly", Objects.equals(partTime, "Remote-Only"));
        model.addAttribute("officeOnly", Objects.equals(partTime, "Office-Only"));
        model.addAttribute("partialRemote", Objects.equals(partTime, "Partial-Remote"));

        model.addAttribute("today", today);
        model.addAttribute("days7", days7);
        model.addAttribute("days30", days30);

        model.addAttribute("job", job);
        model.addAttribute("location", location);

        LocalDate searchDate = null;
        List<JobPostActivity> jobPost = null;
        boolean dateSearchFlag = true;
        boolean remote = true;
        boolean type = true;

        if (days30) {
            searchDate = LocalDate.now().minusDays(30);
        } else if (days7) {
            searchDate = LocalDate.now().minusDays(7);
        } else if (today) {
            searchDate = LocalDate.now();
        } else {
            dateSearchFlag = false;
        }

        if (partTime == null && fullTime == null && freelance == null && internShip == null) {
            partTime = "Part-Time";
            fullTime = "Full-Time";
            freelance = "Freelance";
            internShip = "InternShip";
            remote = false;
        }

        if (officeOnly == null && remoteOnly == null && partialRemote == null) {
            officeOnly = "Office-Only";
            remoteOnly = "Remote-Only";
            partialRemote = "Partial-Remote";
            type = false;
        }

        if (!dateSearchFlag && !remote && !type && !StringUtils.hasText(job) && !StringUtils.hasText(location)) {
            jobPost = jobPostActivityService.getAll();
        } else {
            jobPost = jobPostActivityService.search(job, location, Arrays.asList(partTime, fullTime, freelance),
                    Arrays.asList(remoteOnly, officeOnly, partialRemote), searchDate);
        }

        Object currentUserProfile = usersService.getCurrentUserProfile();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            String currentUsername = authentication.getName();
            model.addAttribute("username", currentUsername);
            if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("Recruiter"))) {
                List<RecruiterJobsDto> recruiterJobs = jobPostActivityService.getRecruiterJobs(((RecruiterProfile) currentUserProfile).getUserAccountId());
                model.addAttribute("jobPost", recruiterJobs);
            } else {
                List<JobSeekerApply> jobSeekerApplyList = jobSeekerApplyService.getCandidatesJobs((JobSeekerProfile) currentUserProfile);
                List<JobSeekerSave> jobSeekerSaveList = jobSeekerSaveService.getCandidatesJob((JobSeekerProfile) currentUserProfile);

                boolean exist;
                boolean saved;

                for (JobPostActivity jobActivity : jobPost) {
                    exist = false;
                    saved = false;
                    for (JobSeekerApply jobSeekerApply : jobSeekerApplyList) {
                        if (Objects.equals(jobActivity.getJobPostId(), jobSeekerApply.getJob().getJobPostId())) {
                            jobActivity.setIsActive(true);
                            exist = true;
                            break;
                        }
                    }

                    for (JobSeekerSave jobSeekerSave : jobSeekerSaveList) {
                        if (Objects.equals(jobActivity.getJobPostId(), jobSeekerSave.getJob().getJobPostId())) {
                            jobActivity.setIsSaved(true);
                            saved = true;
                            break;
                        }
                    }

                    if (!exist) {
                        jobActivity.setIsActive(false);
                    }
                    if (!saved) {
                        jobActivity.setIsSaved(false);
                    }

                    model.addAttribute("jobPost", jobPost);

                }
            }
        }

        model.addAttribute("user", currentUserProfile);

        return "dashboard";
    }

    @GetMapping("global-search/")
    public String globalSearch(Model model,
                               @RequestParam(value = "job", required = false) String job,
                               @RequestParam(value = "location", required = false) String location,
                               @RequestParam(value = "internShip", required = false) String internShip,
                               @RequestParam(value = "partTime", required = false) String partTime,
                               @RequestParam(value = "fullTime", required = false) String fullTime,
                               @RequestParam(value = "freelance", required = false) String freelance,
                               @RequestParam(value = "remoteOnly", required = false) String remoteOnly,
                               @RequestParam(value = "officeOnly", required = false) String officeOnly,
                               @RequestParam(value = "partialRemote", required = false) String partialRemote,
                               @RequestParam(value = "today", required = false) boolean today,
                               @RequestParam(value = "days7", required = false) boolean days7,
                               @RequestParam(value = "days30", required = false) boolean days30) {

    	model.addAttribute("internShip", Objects.equals(partTime, "InternShip"));
        model.addAttribute("partTime", Objects.equals(partTime, "Part-Time"));
        model.addAttribute("fullTime", Objects.equals(partTime, "Full-Time"));
        model.addAttribute("freelance", Objects.equals(partTime, "Freelance"));

        model.addAttribute("remoteOnly", Objects.equals(partTime, "Remote-Only"));
        model.addAttribute("officeOnly", Objects.equals(partTime, "Office-Only"));
        model.addAttribute("partialRemote", Objects.equals(partTime, "Partial-Remote"));

        model.addAttribute("today", today);
        model.addAttribute("days7", days7);
        model.addAttribute("days30", days30);

        model.addAttribute("job", job);
        model.addAttribute("location", location);

        LocalDate searchDate = null;
        List<JobPostActivity> jobPost = null;
        boolean dateSearchFlag = true;
        boolean remote = true;
        boolean type = true;

        if (days30) {
            searchDate = LocalDate.now().minusDays(30);
        } else if (days7) {
            searchDate = LocalDate.now().minusDays(7);
        } else if (today) {
            searchDate = LocalDate.now();
        } else {
            dateSearchFlag = false;
        }

        if (partTime == null && fullTime == null && freelance == null && internShip == null) {
            partTime = "Part-Time";
            fullTime = "Full-Time";
            freelance = "Freelance";
            internShip = "InternShip";
            remote = false;
        }

        if (officeOnly == null && remoteOnly == null && partialRemote == null) {
            officeOnly = "Office-Only";
            remoteOnly = "Remote-Only";
            partialRemote = "Partial-Remote";
            type = false;
        }

        if (!dateSearchFlag && !remote && !type && !StringUtils.hasText(job) && !StringUtils.hasText(location)) {
            jobPost = jobPostActivityService.getAll();
        } else {
            jobPost = jobPostActivityService.search(job, location, Arrays.asList(partTime, fullTime, freelance),
                    Arrays.asList(remoteOnly, officeOnly, partialRemote), searchDate);
        }

        model.addAttribute("jobPost", jobPost);
        return "global-search";
    }

    @GetMapping("/dashboard/add")
    public String addJobs(Model model) {
        try {
            model.addAttribute("jobPostActivity", new JobPostActivity());
            model.addAttribute("user", usersService.getCurrentUserProfile());
            return "add-jobs";
        } catch (Exception e) {
            logger.error("Error loading add job page: {}", e.getMessage(), e);
            model.addAttribute("error", "Unable to load the job posting form. Please try again.");
            return "error/500";
        }
    }

    @PostMapping("/dashboard/addNew")
    public String addNew(@Valid JobPostActivity jobPostActivity, BindingResult bindingResult, 
                        Model model, RedirectAttributes redirectAttributes) {
        
        logger.info("Attempting to create new job posting");
        
        // Handle validation errors
        if (bindingResult.hasErrors()) {
            logger.warn("Job posting validation failed: {}", bindingResult.getAllErrors());
            model.addAttribute("jobPostActivity", jobPostActivity);
            model.addAttribute("user", usersService.getCurrentUserProfile());
            model.addAttribute("error", "Please correct the highlighted fields and try again.");
            return "add-jobs";
        }
        
        try {
            Users user = usersService.getCurrentUser();
            if (user == null) {
                logger.warn("Attempted to create job posting without valid user session");
                redirectAttributes.addFlashAttribute("error", "User session expired. Please log in again.");
                return "redirect:/login";
            }
            
            // Validate required fields that might not be covered by @Valid
            if (!StringUtils.hasText(jobPostActivity.getJobTitle())) {
                throw new IllegalArgumentException("Job title is required");
            }
            
            if (!StringUtils.hasText(jobPostActivity.getDescriptionOfJob())) {
                throw new IllegalArgumentException("Job description is required");
            }
            
            jobPostActivity.setPostedById(user);
            jobPostActivity.setPostedDate(new Date());
            
            JobPostActivity saved = jobPostActivityService.addNew(jobPostActivity);
            logger.info("Successfully created job posting with ID: {}", saved.getJobPostId());
            
            redirectAttributes.addFlashAttribute("success", "Job posted successfully!");
            return "redirect:/dashboard/";
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid job posting data: {}", e.getMessage());
            model.addAttribute("jobPostActivity", jobPostActivity);
            model.addAttribute("user", usersService.getCurrentUserProfile());
            model.addAttribute("error", e.getMessage());
            return "add-jobs";
            
        } catch (Exception e) {
            logger.error("Error creating job posting: {}", e.getMessage(), e);
            model.addAttribute("jobPostActivity", jobPostActivity);
            model.addAttribute("user", usersService.getCurrentUserProfile());
            model.addAttribute("error", "Failed to create job posting. Please try again.");
            return "add-jobs";
        }
    }

    @PostMapping("dashboard/edit/{id}")
    public String editJob(@PathVariable("id") int id, Model model) {
        try {
            JobPostActivity jobPostActivity = jobPostActivityService.getOne(id);
            if (jobPostActivity == null) {
                logger.warn("Attempted to edit non-existent job posting with ID: {}", id);
                model.addAttribute("error", "Job posting not found.");
                return "error/404";
            }
            
            // Verify the current user owns this job posting
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null || !Objects.equals(jobPostActivity.getPostedById().getUserId(), currentUser.getUserId())) {
                logger.warn("Unauthorized attempt to edit job posting ID: {} by user: {}", 
                           id, currentUser != null ? currentUser.getEmail() : "unknown");
                model.addAttribute("error", "You don't have permission to edit this job posting.");
                return "error/403";
            }
            
            model.addAttribute("jobPostActivity", jobPostActivity);
            model.addAttribute("user", usersService.getCurrentUserProfile());
            return "add-jobs";
            
        } catch (Exception e) {
            logger.error("Error loading job posting for edit, ID: {}", id, e);
            model.addAttribute("error", "Unable to load job posting for editing.");
            return "error/500";
        }
    }

    @GetMapping("/job-details/{id}")
    public String getDescriptionOfJob(@PathVariable("id") int id, Model model) {
        try {
            JobPostActivity jobPostActivity = jobPostActivityService.getOne(id);
            if (jobPostActivity == null) {
                logger.warn("Attempted to view non-existent job posting with ID: {}", id);
                model.addAttribute("error", "Job posting not found.");
                return "error/404";
            }
            
            Object currentUserProfile = usersService.getCurrentUserProfile();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (!(authentication instanceof AnonymousAuthenticationToken)) {
                String currentUsername = authentication.getName();
                model.addAttribute("username", currentUsername);
                
                if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("Job Seeker"))) {
                    JobSeekerProfile jobSeekerProfile = (JobSeekerProfile) currentUserProfile;
                    
                    // Check if user has applied for this job
                    List<JobSeekerApply> jobSeekerApplyList = jobSeekerApplyService.getCandidatesJobs(jobSeekerProfile);
                    boolean hasApplied = jobSeekerApplyList.stream()
                        .anyMatch(apply -> Objects.equals(apply.getJob().getJobPostId(), id));
                    
                    // Check if user has saved this job
                    List<JobSeekerSave> jobSeekerSaveList = jobSeekerSaveService.getCandidatesJob(jobSeekerProfile);
                    boolean hasSaved = jobSeekerSaveList.stream()
                        .anyMatch(save -> Objects.equals(save.getJob().getJobPostId(), id));
                    
                    jobPostActivity.setIsActive(hasApplied);
                    jobPostActivity.setIsSaved(hasSaved);
                }
            }
            
            model.addAttribute("jobPostActivity", jobPostActivity);
            model.addAttribute("user", currentUserProfile);
            
            return "job-details";
            
        } catch (Exception e) {
            logger.error("Error loading job details for ID: {}", id, e);
            model.addAttribute("error", "Unable to load job details.");
            return "error/500";
        }
    }
}
