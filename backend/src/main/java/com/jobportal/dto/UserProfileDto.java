package com.jobportal.dto;

import java.time.LocalDate;
import java.util.Date;

public class UserProfileDto {
    
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String userType;
    private LocalDate registrationDate;
    
    // Personal Information fields
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String city;
    private String state;
    private String country;
    private Boolean willingToRelocate;
    
    // Professional Information fields
    private String currentJobTitle;
    private String experience;
    private String education;
    private String workAuthorization;
    private String employmentType;
    private String expectedSalary;
    private LocalDate availabilityDate;
    private String linkedinProfile;
    private String githubProfile;
    private String portfolioWebsite;
    
    // Documents fields
    private String profilePhoto;
    private String resume;
    private String coverLetter;
    
    // Recruiter specific fields
    private String company;
    
    // Constructors
    public UserProfileDto() {}
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    // Convenience method for int userId
    public void setUserId(int userId) { this.userId = Long.valueOf(userId); }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    
    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }
    
    // Convenience method for Date to LocalDate conversion
    public void setRegistrationDate(Date registrationDate) { 
        if (registrationDate != null) {
            this.registrationDate = new java.sql.Date(registrationDate.getTime()).toLocalDate();
        }
    }
    
    // Personal Information getters/setters
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public Boolean getWillingToRelocate() { return willingToRelocate; }
    public void setWillingToRelocate(Boolean willingToRelocate) { this.willingToRelocate = willingToRelocate; }
    
    // Professional Information getters/setters
    public String getCurrentJobTitle() { return currentJobTitle; }
    public void setCurrentJobTitle(String currentJobTitle) { this.currentJobTitle = currentJobTitle; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getWorkAuthorization() { return workAuthorization; }
    public void setWorkAuthorization(String workAuthorization) { this.workAuthorization = workAuthorization; }
    
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    
    public String getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(String expectedSalary) { this.expectedSalary = expectedSalary; }
    
    public LocalDate getAvailabilityDate() { return availabilityDate; }
    public void setAvailabilityDate(LocalDate availabilityDate) { this.availabilityDate = availabilityDate; }
    
    public String getLinkedinProfile() { return linkedinProfile; }
    public void setLinkedinProfile(String linkedinProfile) { this.linkedinProfile = linkedinProfile; }
    
    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }
    
    public String getPortfolioWebsite() { return portfolioWebsite; }
    public void setPortfolioWebsite(String portfolioWebsite) { this.portfolioWebsite = portfolioWebsite; }
    
    // Documents getters/setters
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    
    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }
    
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    
    // Recruiter specific getters/setters
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}