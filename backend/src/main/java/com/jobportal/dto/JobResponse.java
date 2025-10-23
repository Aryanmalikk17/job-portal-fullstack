package com.jobportal.dto;

import java.util.Date;

public class JobResponse {
    
    private Integer jobPostId;
    private String jobTitle;
    private String descriptionOfJob;
    private String jobType;
    private String salary;
    private String remote;
    private Date postedDate;
    private String jobLocation;
    private String companyName;
    private String companyWebsite;
    private Boolean isActive;
    private Boolean isSaved;
    private RecruiterInfo postedBy;
    
    // Additional fields for compatibility
    private Boolean applied;
    private Boolean saved;
    private String postedByEmail;
    
    // Nested class for recruiter information
    public static class RecruiterInfo {
        private Integer userId;
        private String firstName;
        private String lastName;
        private String email;
        
        // Constructors
        public RecruiterInfo() {}
        
        public RecruiterInfo(Integer userId, String firstName, String lastName, String email) {
            this.userId = userId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
        }
        
        // Getters and Setters
        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    // Constructors
    public JobResponse() {}
    
    // Getters and Setters
    public Integer getJobPostId() { return jobPostId; }
    public void setJobPostId(Integer jobPostId) { this.jobPostId = jobPostId; }
    
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    
    public String getDescriptionOfJob() { return descriptionOfJob; }
    public void setDescriptionOfJob(String descriptionOfJob) { this.descriptionOfJob = descriptionOfJob; }
    
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    
    public String getRemote() { return remote; }
    public void setRemote(String remote) { this.remote = remote; }
    
    public Date getPostedDate() { return postedDate; }
    public void setPostedDate(Date postedDate) { this.postedDate = postedDate; }
    
    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Boolean getIsSaved() { return isSaved; }
    public void setIsSaved(Boolean isSaved) { this.isSaved = isSaved; }
    
    public RecruiterInfo getPostedBy() { return postedBy; }
    public void setPostedBy(RecruiterInfo postedBy) { this.postedBy = postedBy; }
    
    // Additional setters for compatibility
    public Boolean getApplied() { return applied; }
    public void setApplied(Boolean applied) { this.applied = applied; }
    
    public Boolean getSaved() { return saved; }
    public void setSaved(Boolean saved) { this.saved = saved; }
    
    public String getPostedByEmail() { return postedByEmail; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }
    
    // Convenience method to set recruiter info from string
    public void setPostedBy(String fullName) {
        if (this.postedBy == null) {
            this.postedBy = new RecruiterInfo();
        }
        // Split the full name if needed - this is a simplified approach
        String[] parts = fullName.split(" ", 2);
        if (parts.length >= 1) {
            this.postedBy.setFirstName(parts[0]);
        }
        if (parts.length >= 2) {
            this.postedBy.setLastName(parts[1]);
        }
    }
}