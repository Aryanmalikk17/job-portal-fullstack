package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyProfileDto {
    private Integer id;
    private String name;
    private String logo;
    private String website;
    private String description;
    private String industry;
    private String size;
    private String type;
    private Integer foundedYear;
    private String city;
    private String state;
    private String country;
    private String officeAddress;
}
