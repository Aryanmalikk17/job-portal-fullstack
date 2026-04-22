package com.jobportal.api;

import com.jobportal.entity.JobCompany;
import com.jobportal.entity.JobPostActivity;
import com.jobportal.repository.JobCompanyRepository;
import com.jobportal.repository.JobPostActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SitemapRestController {

    @Autowired
    private JobPostActivityRepository jobRepository;

    @Autowired
    private JobCompanyRepository companyRepository;

    @GetMapping(value = "/sitemap.xml", produces = "application/xml")
    public String generateSitemap() {
        String baseUrl = "https://www.zplusejobs.com";
        StringBuilder xmlBuilder = new StringBuilder();

        xmlBuilder.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xmlBuilder.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Static routes
        String[] staticRoutes = {"", "/jobs", "/login", "/register"};
        for (String route : staticRoutes) {
            xmlBuilder.append("  <url>\n");
            xmlBuilder.append("    <loc>").append(baseUrl).append(route).append("</loc>\n");
            xmlBuilder.append("    <changefreq>daily</changefreq>\n");
            xmlBuilder.append("    <priority>1.0</priority>\n");
            xmlBuilder.append("  </url>\n");
        }

        // Dynamic Job Routes
        List<JobPostActivity> jobs = jobRepository.findAll();
        for (JobPostActivity job : jobs) {
            xmlBuilder.append("  <url>\n");
            xmlBuilder.append("    <loc>").append(baseUrl).append("/jobs/").append(job.getJobPostId()).append("</loc>\n");
            xmlBuilder.append("    <changefreq>weekly</changefreq>\n");
            xmlBuilder.append("    <priority>0.8</priority>\n");
            xmlBuilder.append("  </url>\n");
        }

        // Dynamic Company Routes
        List<JobCompany> companies = companyRepository.findAllByOrderByNameAsc();
        for (JobCompany company : companies) {
            xmlBuilder.append("  <url>\n");
            xmlBuilder.append("    <loc>").append(baseUrl).append("/companies/").append(company.getId()).append("</loc>\n");
            xmlBuilder.append("    <changefreq>weekly</changefreq>\n");
            xmlBuilder.append("    <priority>0.7</priority>\n");
            xmlBuilder.append("  </url>\n");
        }

        xmlBuilder.append("</urlset>");
        return xmlBuilder.toString();
    }
}
