package com.jobportal.api;

import com.jobportal.dto.ApiResponse;
import com.jobportal.entity.JobCompany;
import com.jobportal.entity.JobLocation;
import com.jobportal.repository.JobCompanyRepository;
import com.jobportal.repository.JobLocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class JobDataRestController {

    private static final Logger logger = LoggerFactory.getLogger(JobDataRestController.class);

    @Autowired
    private JobLocationRepository jobLocationRepository;

    @Autowired
    private JobCompanyRepository jobCompanyRepository;

    // ===== LOCATION ENDPOINTS =====

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<JobLocation>>> getAllLocations() {
        try {
            List<JobLocation> locations = jobLocationRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Locations retrieved successfully", locations));
        } catch (Exception e) {
            logger.error("Error retrieving locations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving locations", null));
        }
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<JobLocation>> createOrGetLocation(@RequestBody JobLocation locationRequest) {
        try {
            // Check if location already exists
            Optional<JobLocation> existingLocation = jobLocationRepository
                .findByCityAndStateAndCountry(
                    locationRequest.getCity().trim(),
                    locationRequest.getState().trim(),
                    locationRequest.getCountry().trim()
                );

            if (existingLocation.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Location found", existingLocation.get()));
            }

            // Create new location
            JobLocation newLocation = new JobLocation();
            newLocation.setCity(locationRequest.getCity().trim());
            newLocation.setState(locationRequest.getState().trim());
            newLocation.setCountry(locationRequest.getCountry().trim());

            JobLocation savedLocation = jobLocationRepository.save(newLocation);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Location created successfully", savedLocation));

        } catch (Exception e) {
            logger.error("Error creating location", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error creating location", null));
        }
    }

    // ===== COMPANY ENDPOINTS =====

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<JobCompany>>> getAllCompanies() {
        try {
            List<JobCompany> companies = jobCompanyRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Companies retrieved successfully", companies));
        } catch (Exception e) {
            logger.error("Error retrieving companies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving companies", null));
        }
    }

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<JobCompany>> createOrGetCompany(@RequestBody JobCompany companyRequest) {
        try {
            // Check if company already exists
            Optional<JobCompany> existingCompany = jobCompanyRepository
                .findByName(companyRequest.getName().trim());

            if (existingCompany.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Company found", existingCompany.get()));
            }

            // Create new company
            JobCompany newCompany = new JobCompany();
            newCompany.setName(companyRequest.getName().trim());
            newCompany.setWebsite(companyRequest.getWebsite());
            newCompany.setLogo(companyRequest.getLogo());

            JobCompany savedCompany = jobCompanyRepository.save(newCompany);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Company created successfully", savedCompany));

        } catch (Exception e) {
            logger.error("Error creating company", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error creating company", null));
        }
    }

    // ===== SEARCH ENDPOINTS =====

    @GetMapping("/locations/search")
    public ResponseEntity<ApiResponse<List<JobLocation>>> searchLocations(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country) {
        try {
            List<JobLocation> locations;
            
            if (city != null && !city.trim().isEmpty()) {
                locations = jobLocationRepository.findByCityContainingIgnoreCase(city.trim());
            } else if (state != null && !state.trim().isEmpty()) {
                locations = jobLocationRepository.findByStateContainingIgnoreCase(state.trim());
            } else if (country != null && !country.trim().isEmpty()) {
                locations = jobLocationRepository.findByCountryContainingIgnoreCase(country.trim());
            } else {
                locations = jobLocationRepository.findAll();
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Location search completed", locations));
        } catch (Exception e) {
            logger.error("Error searching locations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error searching locations", null));
        }
    }

    @GetMapping("/companies/search")
    public ResponseEntity<ApiResponse<List<JobCompany>>> searchCompanies(@RequestParam String name) {
        try {
            List<JobCompany> companies = jobCompanyRepository.findByNameContainingIgnoreCase(name.trim());
            return ResponseEntity.ok(new ApiResponse<>(true, "Company search completed", companies));
        } catch (Exception e) {
            logger.error("Error searching companies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error searching companies", null));
        }
    }
}