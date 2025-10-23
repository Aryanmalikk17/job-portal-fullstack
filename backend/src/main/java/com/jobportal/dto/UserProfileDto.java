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
    
    // Job Seeker specific fields
    private String workAuthorization;
    private String employmentType;
    private String resume;
    private String profilePhoto;
    
    // Recruiter specific fields
    private String company;
    private String city;
    private String state;
    private String country;
    
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
    
    public String getWorkAuthorization() { return workAuthorization; }
    public void setWorkAuthorization(String workAuthorization) { this.workAuthorization = workAuthorization; }
    
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    
    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }
    
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}