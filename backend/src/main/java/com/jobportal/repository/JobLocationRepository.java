package com.jobportal.repository;

import com.jobportal.entity.JobLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobLocationRepository extends JpaRepository<JobLocation, Integer> {
    
    // Find location by exact match
    Optional<JobLocation> findByCityAndStateAndCountry(String city, String state, String country);
    
    // Search methods for autocomplete/suggestions
    List<JobLocation> findByCityContainingIgnoreCase(String city);
    List<JobLocation> findByStateContainingIgnoreCase(String state);
    List<JobLocation> findByCountryContainingIgnoreCase(String country);
    
    // Find all locations by country (useful for dropdowns)
    List<JobLocation> findByCountryOrderByCityAsc(String country);
    
    // Find all locations by state (useful for regional searches)
    List<JobLocation> findByStateOrderByCityAsc(String state);
}