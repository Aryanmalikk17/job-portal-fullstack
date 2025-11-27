package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_seeker_profile")
public class JobSeekerProfile {

    @Id
    private Integer userAccountId;

    @OneToOne
    @JoinColumn(name = "user_account_id")
    @MapsId
    private Users userId;

    // Personal Information
    private String firstName;
    private String lastName;
    private String phone;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    private String gender;
    private String city;
    private String state;
    private String country;
    
    @Column(name = "willing_to_relocate")
    private Boolean willingToRelocate;

    // Professional Information
    @Column(name = "current_job_title")
    private String currentJobTitle;
    
    private String experience;
    
    @Column(columnDefinition = "TEXT")
    private String education;
    
    @Column(name = "work_authorization")
    private String workAuthorization;
    
    @Column(name = "employment_type")
    private String employmentType;
    
    @Column(name = "expected_salary")
    private String expectedSalary;
    
    @Column(name = "availability_date")
    private LocalDate availabilityDate;
    
    @Column(name = "linkedin_profile")
    private String linkedinProfile;
    
    @Column(name = "github_profile")
    private String githubProfile;
    
    @Column(name = "portfolio_website")
    private String portfolioWebsite;

    // Documents
    @Column(nullable = true, length = 64)
    private String profilePhoto;
    
    private String resume;
    
    @Column(name = "resume_original_name")
    private String resumeOriginalName;
    
    @Column(name = "resume_upload_date")
    private LocalDateTime resumeUploadDate;
    
    @Column(name = "resume_file_size")
    private Long resumeFileSize;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    // Skills relationship
    @OneToMany(targetEntity = Skills.class, cascade = CascadeType.ALL, mappedBy = "jobSeekerProfile")
    private List<Skills> skills;

    // Constructors
    public JobSeekerProfile() {
    }

    public JobSeekerProfile(Users userId) {
        this.userId = userId;
    }

    // All getters and setters
    public Integer getUserAccountId() {
        return userAccountId;
    }

    public void setUserAccountId(Integer userAccountId) {
        this.userAccountId = userAccountId;
    }

    public Users getUserId() {
        return userId;
    }

    public void setUserId(Users userId) {
        this.userId = userId;
    }

    // Personal Information getters/setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getWillingToRelocate() {
        return willingToRelocate;
    }

    public void setWillingToRelocate(Boolean willingToRelocate) {
        this.willingToRelocate = willingToRelocate;
    }

    // Professional Information getters/setters
    public String getCurrentJobTitle() {
        return currentJobTitle;
    }

    public void setCurrentJobTitle(String currentJobTitle) {
        this.currentJobTitle = currentJobTitle;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getWorkAuthorization() {
        return workAuthorization;
    }

    public void setWorkAuthorization(String workAuthorization) {
        this.workAuthorization = workAuthorization;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getExpectedSalary() {
        return expectedSalary;
    }

    public void setExpectedSalary(String expectedSalary) {
        this.expectedSalary = expectedSalary;
    }

    public LocalDate getAvailabilityDate() {
        return availabilityDate;
    }

    public void setAvailabilityDate(LocalDate availabilityDate) {
        this.availabilityDate = availabilityDate;
    }

    public String getLinkedinProfile() {
        return linkedinProfile;
    }

    public void setLinkedinProfile(String linkedinProfile) {
        this.linkedinProfile = linkedinProfile;
    }

    public String getGithubProfile() {
        return githubProfile;
    }

    public void setGithubProfile(String githubProfile) {
        this.githubProfile = githubProfile;
    }

    public String getPortfolioWebsite() {
        return portfolioWebsite;
    }

    public void setPortfolioWebsite(String portfolioWebsite) {
        this.portfolioWebsite = portfolioWebsite;
    }

    // Documents getters/setters
    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

    public String getResumeOriginalName() {
        return resumeOriginalName;
    }

    public void setResumeOriginalName(String resumeOriginalName) {
        this.resumeOriginalName = resumeOriginalName;
    }

    public LocalDateTime getResumeUploadDate() {
        return resumeUploadDate;
    }

    public void setResumeUploadDate(LocalDateTime resumeUploadDate) {
        this.resumeUploadDate = resumeUploadDate;
    }

    public Long getResumeFileSize() {
        return resumeFileSize;
    }

    public void setResumeFileSize(Long resumeFileSize) {
        this.resumeFileSize = resumeFileSize;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public List<Skills> getSkills() {
        return skills;
    }

    public void setSkills(List<Skills> skills) {
        this.skills = skills;
    }

    @Transient
    public String getPhotosImagePath() {
        if (profilePhoto == null || userAccountId == null) return null;
        return "photos/candidate/" + userAccountId + "/" + profilePhoto;
    }

    @Override
    public String toString() {
        return "JobSeekerProfile{" +
                "userAccountId=" + userAccountId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", currentJobTitle='" + currentJobTitle + '\'' +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                ", workAuthorization='" + workAuthorization + '\'' +
                ", employmentType='" + employmentType + '\'' +
                '}';
    }
}
