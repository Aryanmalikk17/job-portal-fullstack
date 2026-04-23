package com.jobportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "recruiter_profile")
public class RecruiterProfile implements Persistable<Integer> {

    @Id
    private int userAccountId;

    @OneToOne
    @JoinColumn(name = "user_account_id")
    @MapsId
    private Users userId;

    private String firstName;
    private String lastName;
    private String city;

    private String state;

    private String country;

    private String company;

    @Column(nullable = true, length = 64)
    private String profilePhoto;

    // New Fields
    private String jobTitle;
    private String phone;
    private String companyWebsite;
    
    @Column(columnDefinition = "TEXT")
    private String companyDescription;
    
    private String industry;
    private String companySize;
    private String companyType;
    private Integer foundedYear;
    private String businessPhone;
    private String businessEmail;
    private String officeAddress;
    private String officeCity;
    private String officeState;
    private String officeCountry;
    private String officeZipCode;
    private String companyLogo;

    @Transient
    private boolean isNew = true;

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    @Override
    public Integer getId() {
        return userAccountId;
    }

    @Override
    public boolean isNew() {
        return isNew && userAccountId == 0;
    }

    public RecruiterProfile() {
    }

    public RecruiterProfile(int userAccountId, Users userId, String firstName, String lastName, String city, String state, String country, String company, String profilePhoto) {
        this.userAccountId = userAccountId;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.city = city;
        this.state = state;
        this.country = country;
        this.company = company;
        this.profilePhoto = profilePhoto;
    }

    public RecruiterProfile(Users users) {
        this.userId = users;
    }

    public int getUserAccountId() {
        return userAccountId;
    }

    public void setUserAccountId(int userAccountId) {
        this.userAccountId = userAccountId;
    }

    public Users getUserId() {
        return userId;
    }

    public void setUserId(Users userId) {
        this.userId = userId;
    }

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

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }

    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }

    public Integer getFoundedYear() { return foundedYear; }
    public void setFoundedYear(Integer foundedYear) { this.foundedYear = foundedYear; }

    public String getBusinessPhone() { return businessPhone; }
    public void setBusinessPhone(String businessPhone) { this.businessPhone = businessPhone; }

    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }

    public String getOfficeAddress() { return officeAddress; }
    public void setOfficeAddress(String officeAddress) { this.officeAddress = officeAddress; }

    public String getOfficeCity() { return officeCity; }
    public void setOfficeCity(String officeCity) { this.officeCity = officeCity; }

    public String getOfficeState() { return officeState; }
    public void setOfficeState(String officeState) { this.officeState = officeState; }

    public String getOfficeCountry() { return officeCountry; }
    public void setOfficeCountry(String officeCountry) { this.officeCountry = officeCountry; }

    public String getOfficeZipCode() { return officeZipCode; }
    public void setOfficeZipCode(String officeZipCode) { this.officeZipCode = officeZipCode; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    @Transient
    public String getPhotosImagePath() {
        if (profilePhoto == null) return null;
        return "/photos/recruiter/" + userAccountId + "/" + profilePhoto;
    }

    @Override
    public String toString() {
        return "RecruiterProfile{" +
                "userAccountId=" + userAccountId +
                ", userId=" + userId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", country='" + country + '\'' +
                ", company='" + company + '\'' +
                ", profilePhoto='" + profilePhoto + '\'' +
                ", jobTitle='" + jobTitle + '\'' +
                ", phone='" + phone + '\'' +
                ", companyWebsite='" + companyWebsite + '\'' +
                ", industry='" + industry + '\'' +
                '}';
    }
}
