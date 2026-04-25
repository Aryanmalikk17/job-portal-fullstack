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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.jobportal.entity.Skills;

@RestController
@RequestMapping("/api/profile")
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

    @GetMapping("")
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
                    
                    // Add skills
                    if (profile.getSkills() != null) {
                        profileDto.setSkills(profile.getSkills().stream()
                            .map(Skills::getName)
                            .collect(Collectors.toList()));
                    }
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
                    
                    // New Recruiter Fields
                    profileDto.setJobTitle(profile.getJobTitle());
                    profileDto.setPhone(profile.getPhone());
                    profileDto.setCompanyWebsite(profile.getCompanyWebsite());
                    profileDto.setCompanyDescription(profile.getCompanyDescription());
                    profileDto.setIndustry(profile.getIndustry());
                    profileDto.setCompanySize(profile.getCompanySize());
                    profileDto.setCompanyType(profile.getCompanyType());
                    profileDto.setFoundedYear(profile.getFoundedYear());
                    profileDto.setBusinessPhone(profile.getBusinessPhone());
                    profileDto.setBusinessEmail(profile.getBusinessEmail());
                    profileDto.setOfficeAddress(profile.getOfficeAddress());
                    profileDto.setOfficeCity(profile.getOfficeCity());
                    profileDto.setOfficeState(profile.getOfficeState());
                    profileDto.setOfficeCountry(profile.getOfficeCountry());
                    profileDto.setOfficeZipCode(profile.getOfficeZipCode());
                    profileDto.setCompanyLogo(profile.getCompanyLogo());
                }
            }

            // Sync 'about' field for audit script (uses coverLetter for job seekers)
            if ("Job Seeker".equals(profileDto.getUserType())) {
                profileDto.setAbout(profileDto.getCoverLetter());
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
            @RequestParam(value = "about", required = false) String about,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            
            // Documents
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "skills", required = false) List<String> skills) {
        
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
            usersService.updateUser(currentUser);

            // FIXED: Get existing managed entity or create new one to avoid Duplicate PK insert
            Optional<JobSeekerProfile> existingOpt = jobSeekerProfileService.getOne(currentUser.getUserId());
            JobSeekerProfile profile;
            if (existingOpt.isPresent()) {
                profile = existingOpt.get();
                logger.info("Updating existing JobSeekerProfile for user ID: {}", currentUser.getUserId());
            } else {
                profile = new JobSeekerProfile();
                profile.setUserAccountId(currentUser.getUserId());
                profile.setUserId(currentUser); // CRITICAL: Set association for @MapsId
                logger.info("Creating NEW JobSeekerProfile for user ID: {}", currentUser.getUserId());
            }

            // Update Personal Information
            if (firstName != null) profile.setFirstName(firstName);
            if (lastName != null) profile.setLastName(lastName);
            if (phone != null) profile.setPhone(phone);
            if (StringUtils.hasText(dateOfBirth)) {
                try {
                    profile.setDateOfBirth(LocalDate.parse(dateOfBirth));
                } catch (Exception e) {
                    logger.warn("Invalid date format for dateOfBirth: {}", dateOfBirth);
                }
            }
            if (gender != null) profile.setGender(gender);
            if (city != null) profile.setCity(city);
            if (state != null) profile.setState(state);
            if (country != null) profile.setCountry(country);
            if (willingToRelocate != null) profile.setWillingToRelocate(willingToRelocate);

            // Update Professional Information
            if (currentJobTitle != null) profile.setCurrentJobTitle(currentJobTitle);
            if (experience != null) profile.setExperience(experience);
            if (education != null) profile.setEducation(education);
            if (workAuthorization != null) profile.setWorkAuthorization(workAuthorization);
            if (employmentType != null) profile.setEmploymentType(employmentType);
            if (expectedSalary != null) profile.setExpectedSalary(expectedSalary);
            if (StringUtils.hasText(availabilityDate)) {
                try {
                    profile.setAvailabilityDate(LocalDate.parse(availabilityDate));
                } catch (Exception e) {
                    logger.warn("Invalid date format for availabilityDate: {}", availabilityDate);
                }
            }
            if (linkedinProfile != null) profile.setLinkedinProfile(linkedinProfile);
            if (githubProfile != null) profile.setGithubProfile(githubProfile);
            if (portfolioWebsite != null) profile.setPortfolioWebsite(portfolioWebsite);
            if (about != null) profile.setCoverLetter(about);
            if (coverLetter != null) profile.setCoverLetter(coverLetter);

            // Update Skills
            if (skills != null) {
                // Clear existing skills
                if (profile.getSkills() == null) {
                    profile.setSkills(new ArrayList<>());
                } else {
                    profile.getSkills().clear();
                }
                
                // Add new skills
                for (String skillName : skills) {
                    if (StringUtils.hasText(skillName)) {
                        Skills skill = new Skills();
                        skill.setName(skillName);
                        skill.setJobSeekerProfile(profile);
                        profile.getSkills().add(skill);
                    }
                }
            }

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

            // FIXED: Save the managed entity directly via repository to avoid duplicate PK
            JobSeekerProfile savedProfile = jobSeekerProfileRepository.save(profile);

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
            
            // Add skills to response
            if (savedProfile.getSkills() != null) {
                profileDto.setSkills(savedProfile.getSkills().stream()
                    .map(Skills::getName)
                    .collect(Collectors.toList()));
            }
            logger.info("Successfully saved JobSeekerProfile for user ID: {}", currentUser.getUserId());

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
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @RequestParam(value = "companyWebsite", required = false) String companyWebsite,
            @RequestParam(value = "companyDescription", required = false) String companyDescription,
            @RequestParam(value = "industry", required = false) String industry,
            @RequestParam(value = "companySize", required = false) String companySize,
            @RequestParam(value = "companyType", required = false) String companyType,
            // String instead of Integer: prevents Spring's type-conversion 400 when the frontend
            // sends an empty string to clear this field. Parsed manually below.
            @RequestParam(value = "foundedYear", required = false) String foundedYear,
            @RequestParam(value = "businessPhone", required = false) String businessPhone,
            @RequestParam(value = "businessEmail", required = false) String businessEmail,
            @RequestParam(value = "officeAddress", required = false) String officeAddress,
            @RequestParam(value = "officeCity", required = false) String officeCity,
            @RequestParam(value = "officeState", required = false) String officeState,
            @RequestParam(value = "officeCountry", required = false) String officeCountry,
            @RequestParam(value = "officeZipCode", required = false) String officeZipCode,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "companyLogo", required = false) MultipartFile companyLogo) {
        
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

            // Update user entity — use != null so "" clears the stored display name
            if (firstName != null) {
                currentUser.setFirstName(firstName);
            }
            if (lastName != null) {
                currentUser.setLastName(lastName);
            }
            usersService.updateUser(currentUser);

            // Get or create recruiter profile
            Optional<RecruiterProfile> existingProfile = recruiterProfileService.getOne(currentUser.getUserId());
            RecruiterProfile profile;
            
            if (existingProfile.isPresent()) {
                profile = existingProfile.get();
            } else {
                profile = new RecruiterProfile();
                profile.setUserAccountId(currentUser.getUserId());
                profile.setUserId(currentUser); // CRITICAL: Set association for @MapsId
            }

            // Update profile fields — use != null (not hasText) so "" reaches the DB setter
            // and clears the previously stored value as intended by the user.
            if (company != null) profile.setCompany(company);
            if (city != null) profile.setCity(city);
            if (state != null) profile.setState(state);
            if (country != null) profile.setCountry(country);

            // Sync names to profile entity
            if (firstName != null) profile.setFirstName(firstName);
            if (lastName != null) profile.setLastName(lastName);

            // Extended fields — all using != null for the same reason
            if (phone != null) profile.setPhone(phone);
            if (jobTitle != null) profile.setJobTitle(jobTitle);
            if (companyWebsite != null) profile.setCompanyWebsite(companyWebsite);
            if (companyDescription != null) profile.setCompanyDescription(companyDescription);
            if (industry != null) profile.setIndustry(industry);
            if (companySize != null) profile.setCompanySize(companySize);
            if (companyType != null) profile.setCompanyType(companyType);
            if (businessPhone != null) profile.setBusinessPhone(businessPhone);
            if (businessEmail != null) profile.setBusinessEmail(businessEmail);
            if (officeAddress != null) profile.setOfficeAddress(officeAddress);
            if (officeCity != null) profile.setOfficeCity(officeCity);
            if (officeState != null) profile.setOfficeState(officeState);
            if (officeCountry != null) profile.setOfficeCountry(officeCountry);
            if (officeZipCode != null) profile.setOfficeZipCode(officeZipCode);

            // foundedYear: null → skip, blank ("") → clear to null, numeric → parse
            if (foundedYear != null) {
                if (foundedYear.isBlank()) {
                    profile.setFoundedYear(null);
                } else {
                    try {
                        profile.setFoundedYear(Integer.parseInt(foundedYear.trim()));
                    } catch (NumberFormatException e) {
                        logger.warn("Invalid foundedYear value: '{}', ignoring", foundedYear);
                    }
                }
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

            // Handle company logo upload
            if (companyLogo != null && !companyLogo.isEmpty()) {
                try {
                    String uploadDir = "logos/company/" + currentUser.getUserId();
                    String fileName = companyLogo.getOriginalFilename();
                    FileUploadUtil.saveFile(uploadDir, fileName, companyLogo);
                    profile.setCompanyLogo(fileName);
                } catch (Exception e) {
                    logger.error("Error uploading company logo", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>(false, "Error uploading company logo", null));
                }
            }

            // Save the managed entity directly to avoid duplicate PK insert
            profile = recruiterProfileService.save(profile);

            // Return updated profile with all relevant fields
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
            
            // Populate all other fields for audit verification
            profileDto.setJobTitle(profile.getJobTitle());
            profileDto.setPhone(profile.getPhone());
            profileDto.setCompanyWebsite(profile.getCompanyWebsite());
            profileDto.setCompanyDescription(profile.getCompanyDescription());
            profileDto.setIndustry(profile.getIndustry());
            profileDto.setCompanySize(profile.getCompanySize());
            profileDto.setCompanyType(profile.getCompanyType());
            profileDto.setFoundedYear(profile.getFoundedYear());
            profileDto.setBusinessPhone(profile.getBusinessPhone());
            profileDto.setBusinessEmail(profile.getBusinessEmail());
            profileDto.setOfficeAddress(profile.getOfficeAddress());
            profileDto.setOfficeCity(profile.getOfficeCity());
            profileDto.setOfficeState(profile.getOfficeState());
            profileDto.setOfficeCountry(profile.getOfficeCountry());
            profileDto.setOfficeZipCode(profile.getOfficeZipCode());
            profileDto.setCompanyLogo(profile.getCompanyLogo());

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