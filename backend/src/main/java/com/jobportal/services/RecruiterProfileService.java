package com.jobportal.services;

import com.jobportal.entity.RecruiterProfile;
import com.jobportal.entity.Users;
import com.jobportal.repository.RecruiterProfileRepository;
import com.jobportal.repository.UsersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterRepository;
    private final UsersRepository usersRepository;

    @Autowired
    public RecruiterProfileService(RecruiterProfileRepository recruiterRepository, UsersRepository usersRepository) {
        this.recruiterRepository = recruiterRepository;
        this.usersRepository = usersRepository;
    }

    public Optional<RecruiterProfile> getOne(Integer id) {
        return recruiterRepository.findById(id);
    }

    public RecruiterProfile addNew(RecruiterProfile recruiterProfile) {
        // Check if profile already exists for this user_account_id
        Integer userAccountId = recruiterProfile.getUserAccountId();
        Optional<RecruiterProfile> existingProfile = recruiterRepository.findByUserAccountId(userAccountId);
        
        if (existingProfile.isPresent()) {
            // Update existing profile
            RecruiterProfile profileToUpdate = existingProfile.get();
            
            // Update only non-null fields
            if (recruiterProfile.getFirstName() != null) {
                profileToUpdate.setFirstName(recruiterProfile.getFirstName());
            }
            if (recruiterProfile.getLastName() != null) {
                profileToUpdate.setLastName(recruiterProfile.getLastName());
            }
            if (recruiterProfile.getCity() != null) {
                profileToUpdate.setCity(recruiterProfile.getCity());
            }
            if (recruiterProfile.getState() != null) {
                profileToUpdate.setState(recruiterProfile.getState());
            }
            if (recruiterProfile.getCountry() != null) {
                profileToUpdate.setCountry(recruiterProfile.getCountry());
            }
            if (recruiterProfile.getCompany() != null) {
                profileToUpdate.setCompany(recruiterProfile.getCompany());
            }
            if (recruiterProfile.getProfilePhoto() != null) {
                profileToUpdate.setProfilePhoto(recruiterProfile.getProfilePhoto());
            }
            
            return recruiterRepository.save(profileToUpdate);
        } else {
            // Create new profile
            return recruiterRepository.save(recruiterProfile);
        }
    }

    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            String currentUsername = authentication.getName();
            Users users = usersRepository.findByEmail(currentUsername).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Optional<RecruiterProfile> recruiterProfile = getOne(users.getUserId());
            return recruiterProfile.orElse(null);
        } else return null;
    }
}
