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
            // Update existing profile — copy ALL non-null fields
            RecruiterProfile profileToUpdate = existingProfile.get();
            
            if (recruiterProfile.getFirstName() != null) profileToUpdate.setFirstName(recruiterProfile.getFirstName());
            if (recruiterProfile.getLastName() != null) profileToUpdate.setLastName(recruiterProfile.getLastName());
            if (recruiterProfile.getCity() != null) profileToUpdate.setCity(recruiterProfile.getCity());
            if (recruiterProfile.getState() != null) profileToUpdate.setState(recruiterProfile.getState());
            if (recruiterProfile.getCountry() != null) profileToUpdate.setCountry(recruiterProfile.getCountry());
            if (recruiterProfile.getCompany() != null) profileToUpdate.setCompany(recruiterProfile.getCompany());
            if (recruiterProfile.getProfilePhoto() != null) profileToUpdate.setProfilePhoto(recruiterProfile.getProfilePhoto());

            // New fields — previously missing, causing silent data loss on update
            if (recruiterProfile.getPhone() != null) profileToUpdate.setPhone(recruiterProfile.getPhone());
            if (recruiterProfile.getJobTitle() != null) profileToUpdate.setJobTitle(recruiterProfile.getJobTitle());
            if (recruiterProfile.getCompanyWebsite() != null) profileToUpdate.setCompanyWebsite(recruiterProfile.getCompanyWebsite());
            if (recruiterProfile.getCompanyDescription() != null) profileToUpdate.setCompanyDescription(recruiterProfile.getCompanyDescription());
            if (recruiterProfile.getIndustry() != null) profileToUpdate.setIndustry(recruiterProfile.getIndustry());
            if (recruiterProfile.getCompanySize() != null) profileToUpdate.setCompanySize(recruiterProfile.getCompanySize());
            if (recruiterProfile.getCompanyType() != null) profileToUpdate.setCompanyType(recruiterProfile.getCompanyType());
            if (recruiterProfile.getFoundedYear() != null) profileToUpdate.setFoundedYear(recruiterProfile.getFoundedYear());
            if (recruiterProfile.getBusinessPhone() != null) profileToUpdate.setBusinessPhone(recruiterProfile.getBusinessPhone());
            if (recruiterProfile.getBusinessEmail() != null) profileToUpdate.setBusinessEmail(recruiterProfile.getBusinessEmail());
            if (recruiterProfile.getOfficeAddress() != null) profileToUpdate.setOfficeAddress(recruiterProfile.getOfficeAddress());
            if (recruiterProfile.getOfficeCity() != null) profileToUpdate.setOfficeCity(recruiterProfile.getOfficeCity());
            if (recruiterProfile.getOfficeState() != null) profileToUpdate.setOfficeState(recruiterProfile.getOfficeState());
            if (recruiterProfile.getOfficeCountry() != null) profileToUpdate.setOfficeCountry(recruiterProfile.getOfficeCountry());
            if (recruiterProfile.getCompanyLogo() != null) profileToUpdate.setCompanyLogo(recruiterProfile.getCompanyLogo());
            
            return recruiterRepository.save(profileToUpdate);
        } else {
            // Create new profile
            return recruiterRepository.save(recruiterProfile);
        }
    }

    /**
     * Save a managed profile entity directly (avoids re-fetching in addNew)
     */
    public RecruiterProfile save(RecruiterProfile profile) {
        return recruiterRepository.save(profile);
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
