package com.jobportal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "https://zplusejobs.com", // Production HTTPS
                    "https://www.zplusejobs.com", // Production HTTPS (www)
                    "http://zplusejobs.com",  // Production HTTP
                    "http://www.zplusejobs.com" // Production HTTP (www)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        // Specific mapping for API endpoints
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "https://zplusejobs.com", // Production HTTPS
                    "https://www.zplusejobs.com", // Production HTTPS (www)
                    "http://zplusejobs.com",  // Production HTTP
                    "http://www.zplusejobs.com" // Production HTTP (www)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure static resource handling to fix frontend layout
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(3600);
        
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/")
                .setCachePeriod(3600);
        
        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("classpath:/static/fonts/")
                .setCachePeriod(86400);
        
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(3600);
        
        registry.addResourceHandler("/summernote/**")
                .addResourceLocations("classpath:/static/summernote/")
                .setCachePeriod(3600);
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/assets/", "classpath:/static/images/")
                .setCachePeriod(86400);
        
        // Handle favicon
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/assets/favicon.ico")
                .setCachePeriod(86400);
        
        // Handle webjars for Bootstrap, jQuery, etc. - FIXED PATHS
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .setCachePeriod(86400);
                
        // Add explicit mapping for Bootstrap and jQuery to ensure they work
        registry.addResourceHandler("/bootstrap/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/bootstrap/5.3.3/")
                .setCachePeriod(86400);
                
        registry.addResourceHandler("/jquery/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/jquery/3.7.1/")
                .setCachePeriod(86400);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Add view controllers for simple page mappings
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/login").setViewName("login");
    }
}