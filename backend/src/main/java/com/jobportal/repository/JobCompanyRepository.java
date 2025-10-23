package com.jobportal.repository;

import com.jobportal.entity.JobCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCompanyRepository extends JpaRepository<JobCompany, Integer> {
    
    // Find company by exact name match
    Optional<JobCompany> findByName(String name);
    
    // Search companies by name (for autocomplete/suggestions)
    List<JobCompany> findByNameContainingIgnoreCase(String name);
    
    // Find companies by website
    Optional<JobCompany> findByWebsite(String website);
    
    // Get all companies ordered by name
    List<JobCompany> findAllByOrderByNameAsc();
    
    // Check if company exists by name (case insensitive)
    boolean existsByNameIgnoreCase(String name);
}