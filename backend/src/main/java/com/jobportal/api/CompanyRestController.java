package com.jobportal.api;

import com.jobportal.dto.CompanyProfileDto;
import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.RecruiterProfile;
import com.jobportal.services.JobPostActivityService;
import com.jobportal.services.RecruiterProfileService;
import com.jobportal.util.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyRestController {

    private final Logger logger = LoggerFactory.getLogger(CompanyRestController.class);

    private final RecruiterProfileService recruiterProfileService;
    private final JobPostActivityService jobPostActivityService;

    @Autowired
    public CompanyRestController(RecruiterProfileService recruiterProfileService, JobPostActivityService jobPostActivityService) {
        this.recruiterProfileService = recruiterProfileService;
        this.jobPostActivityService = jobPostActivityService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyProfileDto>> getCompanyDetails(@PathVariable Integer id) {
        try {
            Optional<RecruiterProfile> recruiterProfile = recruiterProfileService.getOne(id);
            if (recruiterProfile.isPresent()) {
                RecruiterProfile profile = recruiterProfile.get();
                CompanyProfileDto dto = CompanyProfileDto.builder()
                        .id(profile.getUserAccountId())
                        .name(profile.getCompany())
                        .logo(profile.getCompanyLogo())
                        .website(profile.getCompanyWebsite())
                        .description(profile.getCompanyDescription())
                        .industry(profile.getIndustry())
                        .size(profile.getCompanySize())
                        .type(profile.getCompanyType())
                        .foundedYear(profile.getFoundedYear())
                        .city(profile.getCity())
                        .state(profile.getState())
                        .country(profile.getCountry())
                        .officeAddress(profile.getOfficeAddress())
                        .build();
                return ResponseEntity.ok(new ApiResponse<>(true, "Company details retrieved successfully", dto));
            }
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Company not found", null));
        } catch (Exception e) {
            logger.error("Error fetching company details", e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error fetching company details", null));
        }
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<ApiResponse<List<JobPostActivity>>> getCompanyJobs(@PathVariable Integer id) {
        try {
            List<JobPostActivity> jobs = jobPostActivityService.getActiveJobsByRecruiter(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Company jobs retrieved successfully", jobs));
        } catch (Exception e) {
            logger.error("Error fetching company jobs", e);
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Error fetching company jobs", null));
        }
    }
}
