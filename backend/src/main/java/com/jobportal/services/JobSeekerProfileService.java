package com.jobportal.services;

import java.util.Optional;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.jobportal.entity.JobSeekerProfile;
import com.jobportal.entity.Users;
import com.jobportal.repository.JobSeekerProfileRepository;
import com.jobportal.repository.UsersRepository;

@Service
public class JobSeekerProfileService {

    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final UsersRepository usersRepository;

    public JobSeekerProfileService(JobSeekerProfileRepository jobSeekerProfileRepository, UsersRepository usersRepository) {
        this.jobSeekerProfileRepository = jobSeekerProfileRepository;
        this.usersRepository = usersRepository;
    }

    public Optional<JobSeekerProfile> getOne(Integer id) {
        return jobSeekerProfileRepository.findById(id);
    }

    /**
     * Creates a new profile for first-time users (registration flow)
     * Throws exception if profile already exists
     */
    public JobSeekerProfile createProfile(JobSeekerProfile jobSeekerProfile) {
        Integer userAccountId = jobSeekerProfile.getUserAccountId();
        Optional<JobSeekerProfile> existingProfile = jobSeekerProfileRepository.findByUserAccountId(userAccountId);
        
        if (existingProfile.isPresent()) {
            throw new IllegalStateException("Profile already exists for user: " + userAccountId);
        }
        
        return jobSeekerProfileRepository.save(jobSeekerProfile);
    }

    /**
     * Updates existing profile for logged-in users (profile management)
     * Throws exception if profile doesn't exist
     */
    public JobSeekerProfile updateProfile(Integer userAccountId, JobSeekerProfile updates) {
        JobSeekerProfile existingProfile = jobSeekerProfileRepository
            .findByUserAccountId(userAccountId)
            .orElseThrow(() -> new IllegalStateException("No profile found for user: " + userAccountId));
        
        // Apply selective updates - only update non-null fields
        applyProfileUpdates(existingProfile, updates);
        
        return jobSeekerProfileRepository.save(existingProfile);
    }

    /**
     * Helper method to apply selective field updates
     */
    private void applyProfileUpdates(JobSeekerProfile existing, JobSeekerProfile updates) {
        // Personal Information
        if (updates.getFirstName() != null) existing.setFirstName(updates.getFirstName());
        if (updates.getLastName() != null) existing.setLastName(updates.getLastName());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getDateOfBirth() != null) existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) existing.setGender(updates.getGender());
        if (updates.getCity() != null) existing.setCity(updates.getCity());
        if (updates.getState() != null) existing.setState(updates.getState());
        if (updates.getCountry() != null) existing.setCountry(updates.getCountry());
        if (updates.getWillingToRelocate() != null) existing.setWillingToRelocate(updates.getWillingToRelocate());
        
        // Professional Information
        if (updates.getCurrentJobTitle() != null) existing.setCurrentJobTitle(updates.getCurrentJobTitle());
        if (updates.getExperience() != null) existing.setExperience(updates.getExperience());
        if (updates.getEducation() != null) existing.setEducation(updates.getEducation());
        if (updates.getWorkAuthorization() != null) existing.setWorkAuthorization(updates.getWorkAuthorization());
        if (updates.getEmploymentType() != null) existing.setEmploymentType(updates.getEmploymentType());
        if (updates.getExpectedSalary() != null) existing.setExpectedSalary(updates.getExpectedSalary());
        if (updates.getAvailabilityDate() != null) existing.setAvailabilityDate(updates.getAvailabilityDate());
        if (updates.getLinkedinProfile() != null) existing.setLinkedinProfile(updates.getLinkedinProfile());
        if (updates.getGithubProfile() != null) existing.setGithubProfile(updates.getGithubProfile());
        if (updates.getPortfolioWebsite() != null) existing.setPortfolioWebsite(updates.getPortfolioWebsite());
        if (updates.getCoverLetter() != null) existing.setCoverLetter(updates.getCoverLetter());
        
        // Documents
        if (updates.getProfilePhoto() != null) existing.setProfilePhoto(updates.getProfilePhoto());
        if (updates.getResume() != null) existing.setResume(updates.getResume());
        if (updates.getResumeOriginalName() != null) existing.setResumeOriginalName(updates.getResumeOriginalName());
        if (updates.getResumeUploadDate() != null) existing.setResumeUploadDate(updates.getResumeUploadDate());
        if (updates.getResumeFileSize() != null) existing.setResumeFileSize(updates.getResumeFileSize());
    }

    /**
     * Legacy method for backward compatibility with existing MVC controllers
     * @deprecated Use createProfile() or updateProfile() instead
     */
    @Deprecated
    public JobSeekerProfile addNew(JobSeekerProfile jobSeekerProfile) {
        // Check if profile already exists for this user_account_id
        Integer userAccountId = jobSeekerProfile.getUserAccountId();
        Optional<JobSeekerProfile> existingProfile = jobSeekerProfileRepository.findByUserAccountId(userAccountId);
        
        if (existingProfile.isPresent()) {
            // Update existing profile using the new method
            return updateProfile(userAccountId, jobSeekerProfile);
        } else {
            // Create new profile using the new method
            return createProfile(jobSeekerProfile);
        }
    }

    public JobSeekerProfile getCurrentSeekerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            String currentUsername = authentication.getName();
            Users users = usersRepository.findByEmail(currentUsername).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Optional<JobSeekerProfile> seekerProfile = getOne(users.getUserId());
            return seekerProfile.orElse(null);
        } else return null;
    }
}
