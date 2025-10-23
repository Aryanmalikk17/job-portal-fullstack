package com.jobportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JobCreateRequestDto {
    
    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String jobTitle;
    
    @NotBlank(message = "Job description is required")
    @Size(max = 5000, message = "Job description must not exceed 5000 characters")
    private String descriptionOfJob;
    
    @NotBlank(message = "Job type is required")
    private String jobType;
    
    @NotBlank(message = "Salary is required")
    @Size(max = 100, message = "Salary must not exceed 100 characters")
    private String salary;
    
    @NotBlank(message = "Remote option is required")
    private String remote;
    
    private Integer jobLocationId;
    
    private Integer jobCompanyId;
    
    // Constructors
    public JobCreateRequestDto() {}
    
    // Getters and Setters
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
    
    public Integer getJobLocationId() { return jobLocationId; }
    public void setJobLocationId(Integer jobLocationId) { this.jobLocationId = jobLocationId; }
    
    public Integer getJobCompanyId() { return jobCompanyId; }
    public void setJobCompanyId(Integer jobCompanyId) { this.jobCompanyId = jobCompanyId; }
}