package com.jobportal.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.Skills;
import com.jobportal.entity.Users;
import com.jobportal.repository.UsersRepository;
import com.jobportal.services.JobSeekerProfileService;
import com.jobportal.util.FileDownloadUtil;
import com.jobportal.util.FileUploadUtil;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/job-seeker-profile")
public class JobSeekerProfileController {

    private static final Logger logger = LoggerFactory.getLogger(JobSeekerProfileController.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif"};

    private JobSeekerProfileService jobSeekerProfileService;
    private UsersRepository usersRepository;

    @Autowired
    public JobSeekerProfileController(JobSeekerProfileService jobSeekerProfileService, UsersRepository usersRepository) {
        this.jobSeekerProfileService = jobSeekerProfileService;
        this.usersRepository = usersRepository;
    }

    @GetMapping("/")
    public String jobSeekerProfile(Model model) {
        try {
            JobSeekerProfile jobSeekerProfile = new JobSeekerProfile();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            List<Skills> skills = new ArrayList<>();

            if (!(authentication instanceof AnonymousAuthenticationToken)) {
                Users user = usersRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found."));
                
                Optional<JobSeekerProfile> seekerProfile = jobSeekerProfileService.getOne(user.getUserId());
                if (seekerProfile.isPresent()) {
                    jobSeekerProfile = seekerProfile.get();
                    if (jobSeekerProfile.getSkills().isEmpty()) {
                        skills.add(new Skills());
                        jobSeekerProfile.setSkills(skills);
                    }
                }

                model.addAttribute("skills", skills);
                model.addAttribute("profile", jobSeekerProfile);
            }

            return "job-seeker-profile";
            
        } catch (Exception e) {
            logger.error("Error loading job seeker profile: {}", e.getMessage(), e);
            model.addAttribute("error", "Unable to load profile. Please try again.");
            return "error/500";
        }
    }

    @PostMapping("/addNew")
    public String addNew(@Valid JobSeekerProfile jobSeekerProfile,
                         BindingResult bindingResult,
                         @RequestParam("image") MultipartFile image,
                         @RequestParam("pdf") MultipartFile pdf,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        
        logger.info("Attempting to save job seeker profile");
        
        // Handle validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> validationErrors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                validationErrors.put(error.getField(), error.getDefaultMessage());
            }
            model.addAttribute("validationErrors", validationErrors);
            model.addAttribute("error", "Please correct the highlighted fields and try again.");
            model.addAttribute("profile", jobSeekerProfile);
            return "job-seeker-profile";
        }
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof AnonymousAuthenticationToken) {
                redirectAttributes.addFlashAttribute("error", "Please log in to save your profile.");
                return "redirect:/login";
            }

            Users user = usersRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
            
            jobSeekerProfile.setUserId(user);
            jobSeekerProfile.setUserAccountId(user.getUserId());

            // Validate and process files
            String imageName = "";
            String resumeName = "";
            
            // Validate image file
            if (!image.isEmpty()) {
                String validationError = validateImageFile(image);
                if (validationError != null) {
                    model.addAttribute("error", validationError);
                    model.addAttribute("profile", jobSeekerProfile);
                    return "job-seeker-profile";
                }
                imageName = StringUtils.cleanPath(Objects.requireNonNull(image.getOriginalFilename()));
                jobSeekerProfile.setProfilePhoto(imageName);
            }

            // Validate PDF file
            if (!pdf.isEmpty()) {
                String validationError = validatePdfFile(pdf);
                if (validationError != null) {
                    model.addAttribute("error", validationError);
                    model.addAttribute("profile", jobSeekerProfile);
                    return "job-seeker-profile";
                }
                resumeName = StringUtils.cleanPath(Objects.requireNonNull(pdf.getOriginalFilename()));
                jobSeekerProfile.setResume(resumeName);
            }

            // Set job seeker profile for skills
            List<Skills> skillsList = new ArrayList<>();
            model.addAttribute("profile", jobSeekerProfile);
            model.addAttribute("skills", skillsList);

            for (Skills skills : jobSeekerProfile.getSkills()) {
                skills.setJobSeekerProfile(jobSeekerProfile);
            }

            jobSeekerProfileService.addNew(jobSeekerProfile);
            logger.info("Successfully saved job seeker profile for user: {}", user.getEmail());

            // Save files
            String uploadDir = "photos/candidate/" + jobSeekerProfile.getUserAccountId();
            
            if (!image.isEmpty()) {
                FileUploadUtil.saveFile(uploadDir, imageName, image);
                logger.info("Successfully saved profile image: {}", imageName);
            }
            
            if (!pdf.isEmpty()) {
                FileUploadUtil.saveFile(uploadDir, resumeName, pdf);
                logger.info("Successfully saved resume: {}", resumeName);
            }

            redirectAttributes.addFlashAttribute("success", "Profile saved successfully!");
            return "redirect:/dashboard/";
            
        } catch (UsernameNotFoundException e) {
            logger.warn("User not found during profile save: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", "User session expired. Please log in again.");
            return "redirect:/login";
            
        } catch (IOException e) {
            logger.error("File upload error: {}", e.getMessage(), e);
            model.addAttribute("error", "File upload failed. Please try again.");
            model.addAttribute("profile", jobSeekerProfile);
            return "job-seeker-profile";
            
        } catch (Exception e) {
            logger.error("Error saving job seeker profile: {}", e.getMessage(), e);
            model.addAttribute("error", "Failed to save profile. Please try again.");
            model.addAttribute("profile", jobSeekerProfile);
            return "job-seeker-profile";
        }
    }

    @GetMapping("/{id}")
    public String candidateProfile(@PathVariable("id") int id, Model model) {
        try {
            Optional<JobSeekerProfile> seekerProfile = jobSeekerProfileService.getOne(id);
            if (seekerProfile.isEmpty()) {
                logger.warn("Attempted to view non-existent profile with ID: {}", id);
                model.addAttribute("error", "Profile not found.");
                return "error/404";
            }
            
            model.addAttribute("profile", seekerProfile.get());
            return "job-seeker-profile";
            
        } catch (Exception e) {
            logger.error("Error loading candidate profile with ID: {}", id, e);
            model.addAttribute("error", "Unable to load profile.");
            return "error/500";
        }
    }

    @GetMapping("/downloadResume")
    public ResponseEntity<?> downloadResume(@RequestParam(value = "fileName") String fileName, 
                                          @RequestParam(value = "userID") String userId) {
        try {
            // Validate parameters
            if (!StringUtils.hasText(fileName) || !StringUtils.hasText(userId)) {
                logger.warn("Invalid parameters for resume download - fileName: {}, userID: {}", fileName, userId);
                return ResponseEntity.badRequest().body("Invalid parameters");
            }

            FileDownloadUtil downloadUtil = new FileDownloadUtil();
            Resource resource = downloadUtil.getFileAsResourse("photos/candidate/" + userId, fileName);

            if (resource == null || !resource.exists()) {
                logger.warn("Resume file not found - fileName: {}, userID: {}", fileName, userId);
                return new ResponseEntity<>("File not found", HttpStatus.NOT_FOUND);
            }

            String contentType = "application/octet-stream";
            String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";

            logger.info("Successfully serving resume download - fileName: {}, userID: {}", fileName, userId);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                    .body(resource);

        } catch (IOException e) {
            logger.error("Error downloading resume - fileName: {}, userID: {}", fileName, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file");
        } catch (Exception e) {
            logger.error("Unexpected error during resume download: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred");
        }
    }

    // Helper methods for file validation
    private String validateImageFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            return "Image file size must not exceed 10MB";
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            return "Invalid image file";
        }
        
        boolean isValidType = false;
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (contentType.equalsIgnoreCase(allowedType)) {
                isValidType = true;
                break;
            }
        }
        
        if (!isValidType) {
            return "Only JPEG, PNG, and GIF images are allowed";
        }
        
        return null; // No validation errors
    }
    
    private String validatePdfFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            return "PDF file size must not exceed 10MB";
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            return "Only PDF files are allowed for resume upload";
        }
        
        return null; // No validation errors
    }
}