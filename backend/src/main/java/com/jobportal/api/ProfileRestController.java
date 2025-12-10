package com.jobportal.api;

import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.UserProfileDto;
import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.RecruiterProfile;
import com.jobportal.entity.Users;
import com.jobportal.services.JobSeekerProfileService;
import com.jobportal.services.RecruiterProfileService;
import com.jobportal.services.UsersService;
import com.jobportal.util.FileUploadUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://zplusejobs.com",
    "https://www.zplusejobs.com",
    "http://zplusejobs.com",
    "http://www.zplusejobs.com"
})
public class ProfileRestController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileRestController.class);

    @Autowired
    private UsersService usersService;

    @Autowired
    private JobSeekerProfileService jobSeekerProfileService;

    @Autowired
    private RecruiterProfileService recruiterProfileService;

    @Autowired
    private com.jobportal.repository.JobSeekerProfileRepository jobSeekerProfileRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile() {
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            UserProfileDto profileDto = new UserProfileDto();
            profileDto.setUserId(currentUser.getUserId());
            profileDto.setFirstName(currentUser.getFirstName());
            profileDto.setLastName(currentUser.getLastName());
            profileDto.setEmail(currentUser.getEmail());
            profileDto.setUserType(currentUser.getUserTypeId().getUserTypeName());
            profileDto.setRegistrationDate(currentUser.getRegistrationDate());

            // Add specific profile data based on user type
            if ("Job Seeker".equals(currentUser.getUserTypeId().getUserTypeName())) {
                Optional<JobSeekerProfile> seekerProfile = jobSeekerProfileService.getOne(currentUser.getUserId());
                if (seekerProfile.isPresent()) {
                    JobSeekerProfile profile = seekerProfile.get();
                    
                    // Personal Information
                    profileDto.setPhone(profile.getPhone());
                    profileDto.setDateOfBirth(profile.getDateOfBirth());
                    profileDto.setGender(profile.getGender());
                    profileDto.setCity(profile.getCity());
                    profileDto.setState(profile.getState());
                    profileDto.setCountry(profile.getCountry());
                    profileDto.setWillingToRelocate(profile.getWillingToRelocate());
                    
                    // Professional Information
                    profileDto.setCurrentJobTitle(profile.getCurrentJobTitle());
                    profileDto.setExperience(profile.getExperience());
                    profileDto.setEducation(profile.getEducation());
                    profileDto.setWorkAuthorization(profile.getWorkAuthorization());
                    profileDto.setEmploymentType(profile.getEmploymentType());
                    profileDto.setExpectedSalary(profile.getExpectedSalary());
                    profileDto.setAvailabilityDate(profile.getAvailabilityDate());
                    profileDto.setLinkedinProfile(profile.getLinkedinProfile());
                    profileDto.setGithubProfile(profile.getGithubProfile());
                    profileDto.setPortfolioWebsite(profile.getPortfolioWebsite());
                    
                    // Documents
                    profileDto.setProfilePhoto(profile.getProfilePhoto());
                    profileDto.setResume(profile.getResume());
                    profileDto.setCoverLetter(profile.getCoverLetter());
                }
            } else if ("Recruiter".equals(currentUser.getUserTypeId().getUserTypeName())) {
                Optional<RecruiterProfile> recruiterProfile = recruiterProfileService.getOne(currentUser.getUserId());
                if (recruiterProfile.isPresent()) {
                    RecruiterProfile profile = recruiterProfile.get();
                    profileDto.setCompany(profile.getCompany());
                    profileDto.setCity(profile.getCity());
                    profileDto.setState(profile.getState());
                    profileDto.setCountry(profile.getCountry());
                    profileDto.setProfilePhoto(profile.getProfilePhoto());
                }
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved successfully", profileDto));

        } catch (Exception e) {
            logger.error("Error retrieving user profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving profile", null));
        }
    }

    @PutMapping("/job-seeker")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateJobSeekerProfile(
            // Personal Information
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "willingToRelocate", required = false) Boolean willingToRelocate,
            
            // Professional Information
            @RequestParam(value = "currentJobTitle", required = false) String currentJobTitle,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "education", required = false) String education,
            @RequestParam(value = "workAuthorization", required = false) String workAuthorization,
            @RequestParam(value = "employmentType", required = false) String employmentType,
            @RequestParam(value = "expectedSalary", required = false) String expectedSalary,
            @RequestParam(value = "availabilityDate", required = false) String availabilityDate,
            @RequestParam(value = "linkedinProfile", required = false) String linkedinProfile,
            @RequestParam(value = "githubProfile", required = false) String githubProfile,
            @RequestParam(value = "portfolioWebsite", required = false) String portfolioWebsite,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            
            // Documents
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "resume", required = false) MultipartFile resume) {
        
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            if (!"Job Seeker".equals(currentUser.getUserTypeId().getUserTypeName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only job seekers can update job seeker profile", null));
            }

            // Update user basic info
            if (StringUtils.hasText(firstName)) {
                currentUser.setFirstName(firstName);
            }
            if (StringUtils.hasText(lastName)) {
                currentUser.setLastName(lastName);
            }
            usersService.addNew(currentUser);

            // Check if profile exists - create profile object with updates
            JobSeekerProfile profile = new JobSeekerProfile();
            profile.setUserAccountId(currentUser.getUserId());

            // Update Personal Information
            if (StringUtils.hasText(firstName)) profile.setFirstName(firstName);
            if (StringUtils.hasText(lastName)) profile.setLastName(lastName);
            if (StringUtils.hasText(phone)) profile.setPhone(phone);
            if (StringUtils.hasText(dateOfBirth)) {
                try {
                    profile.setDateOfBirth(LocalDate.parse(dateOfBirth));
                } catch (Exception e) {
                    logger.warn("Invalid date format for dateOfBirth: {}", dateOfBirth);
                }
            }
            if (StringUtils.hasText(gender)) profile.setGender(gender);
            if (StringUtils.hasText(city)) profile.setCity(city);
            if (StringUtils.hasText(state)) profile.setState(state);
            if (StringUtils.hasText(country)) profile.setCountry(country);
            if (willingToRelocate != null) profile.setWillingToRelocate(willingToRelocate);

            // Update Professional Information
            if (StringUtils.hasText(currentJobTitle)) profile.setCurrentJobTitle(currentJobTitle);
            if (StringUtils.hasText(experience)) profile.setExperience(experience);
            if (StringUtils.hasText(education)) profile.setEducation(education);
            if (StringUtils.hasText(workAuthorization)) profile.setWorkAuthorization(workAuthorization);
            if (StringUtils.hasText(employmentType)) profile.setEmploymentType(employmentType);
            if (StringUtils.hasText(expectedSalary)) profile.setExpectedSalary(expectedSalary);
            if (StringUtils.hasText(availabilityDate)) {
                try {
                    profile.setAvailabilityDate(LocalDate.parse(availabilityDate));
                } catch (Exception e) {
                    logger.warn("Invalid date format for availabilityDate: {}", availabilityDate);
                }
            }
            if (StringUtils.hasText(linkedinProfile)) profile.setLinkedinProfile(linkedinProfile);
            if (StringUtils.hasText(githubProfile)) profile.setGithubProfile(githubProfile);
            if (StringUtils.hasText(portfolioWebsite)) profile.setPortfolioWebsite(portfolioWebsite);
            if (StringUtils.hasText(coverLetter)) profile.setCoverLetter(coverLetter);

            // Handle file uploads
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                try {
                    String uploadDir = "photos/candidate/" + currentUser.getUserId();
                    String fileName = profilePhoto.getOriginalFilename();
                    FileUploadUtil.saveFile(uploadDir, fileName, profilePhoto);
                    profile.setProfilePhoto(fileName);
                } catch (Exception e) {
                    logger.error("Error uploading profile photo", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Error uploading profile photo", null));
                }
            }

            if (resume != null && !resume.isEmpty()) {
                try {
                    String uploadDir = "photos/candidate/" + currentUser.getUserId();
                    String fileName = resume.getOriginalFilename();
                    FileUploadUtil.saveFile(uploadDir, fileName, resume);
                    profile.setResume(fileName);
                    profile.setResumeOriginalName(resume.getOriginalFilename());
                    profile.setResumeUploadDate(LocalDateTime.now());
                    profile.setResumeFileSize(resume.getSize());
                } catch (Exception e) {
                    logger.error("Error uploading resume", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Error uploading resume", null));
                }
            }

            // Smart profile save: Use existing addNew method which now handles update vs insert properly
            JobSeekerProfile savedProfile = jobSeekerProfileService.addNew(profile);

            // Return updated profile with ALL fields
            UserProfileDto profileDto = new UserProfileDto();
            profileDto.setUserId(currentUser.getUserId());
            profileDto.setFirstName(currentUser.getFirstName());
            profileDto.setLastName(currentUser.getLastName());
            profileDto.setEmail(currentUser.getEmail());
            profileDto.setUserType(currentUser.getUserTypeId().getUserTypeName());
            
            // Add all profile fields to response
            profileDto.setPhone(savedProfile.getPhone());
            profileDto.setDateOfBirth(savedProfile.getDateOfBirth());
            profileDto.setGender(savedProfile.getGender());
            profileDto.setCity(savedProfile.getCity());
            profileDto.setState(savedProfile.getState());
            profileDto.setCountry(savedProfile.getCountry());
            profileDto.setWillingToRelocate(savedProfile.getWillingToRelocate());
            profileDto.setCurrentJobTitle(savedProfile.getCurrentJobTitle());
            profileDto.setExperience(savedProfile.getExperience());
            profileDto.setEducation(savedProfile.getEducation());
            profileDto.setWorkAuthorization(savedProfile.getWorkAuthorization());
            profileDto.setEmploymentType(savedProfile.getEmploymentType());
            profileDto.setExpectedSalary(savedProfile.getExpectedSalary());
            profileDto.setAvailabilityDate(savedProfile.getAvailabilityDate());
            profileDto.setLinkedinProfile(savedProfile.getLinkedinProfile());
            profileDto.setGithubProfile(savedProfile.getGithubProfile());
            profileDto.setPortfolioWebsite(savedProfile.getPortfolioWebsite());
            profileDto.setCoverLetter(savedProfile.getCoverLetter());
            profileDto.setProfilePhoto(savedProfile.getProfilePhoto());
            profileDto.setResume(savedProfile.getResume());

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", profileDto));

        } catch (Exception e) {
            logger.error("Error updating job seeker profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating profile", null));
        }
    }

    @PutMapping("/recruiter")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateRecruiterProfile(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            if (!"Recruiter".equals(currentUser.getUserTypeId().getUserTypeName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Only recruiters can update recruiter profile", null));
            }

            // Update user basic info
            if (StringUtils.hasText(firstName)) {
                currentUser.setFirstName(firstName);
            }
            if (StringUtils.hasText(lastName)) {
                currentUser.setLastName(lastName);
            }
            usersService.addNew(currentUser);

            // Get or create recruiter profile
            Optional<RecruiterProfile> existingProfile = recruiterProfileService.getOne(currentUser.getUserId());
            RecruiterProfile profile;
            
            if (existingProfile.isPresent()) {
                profile = existingProfile.get();
            } else {
                profile = new RecruiterProfile();
                profile.setUserAccountId(currentUser.getUserId());
            }

            // Update profile fields
            if (StringUtils.hasText(company)) {
                profile.setCompany(company);
            }
            if (StringUtils.hasText(city)) {
                profile.setCity(city);
            }
            if (StringUtils.hasText(state)) {
                profile.setState(state);
            }
            if (StringUtils.hasText(country)) {
                profile.setCountry(country);
            }

            // Handle profile photo upload
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                try {
                    String uploadDir = "photos/recruiter/" + currentUser.getUserId();
                    String fileName = profilePhoto.getOriginalFilename();
                    FileUploadUtil.saveFile(uploadDir, fileName, profilePhoto);
                    profile.setProfilePhoto(fileName);
                } catch (Exception e) {
                    logger.error("Error uploading profile photo", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Error uploading profile photo", null));
                }
            }

            recruiterProfileService.addNew(profile);

            // Return updated profile
            UserProfileDto profileDto = new UserProfileDto();
            profileDto.setUserId(currentUser.getUserId());
            profileDto.setFirstName(currentUser.getFirstName());
            profileDto.setLastName(currentUser.getLastName());
            profileDto.setEmail(currentUser.getEmail());
            profileDto.setUserType(currentUser.getUserTypeId().getUserTypeName());
            profileDto.setCompany(profile.getCompany());
            profileDto.setCity(profile.getCity());
            profileDto.setState(profile.getState());
            profileDto.setCountry(profile.getCountry());
            profileDto.setProfilePhoto(profile.getProfilePhoto());

            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", profileDto));

        } catch (Exception e) {
            logger.error("Error updating recruiter profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating profile", null));
        }
    }

    @GetMapping("/download/{fileType}/{fileName}")
    public ResponseEntity<ApiResponse<String>> getFileUrl(
            @PathVariable String fileType, 
            @PathVariable String fileName) {
        
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            String userType = currentUser.getUserTypeId().getUserTypeName().toLowerCase().replace(" ", "");
            String filePath = "/photos/" + userType + "/" + currentUser.getUserId() + "/" + fileName;
            
            return ResponseEntity.ok(new ApiResponse<>(true, "File URL generated", filePath));

        } catch (Exception e) {
            logger.error("Error generating file URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error generating file URL", null));
        }
    }
}