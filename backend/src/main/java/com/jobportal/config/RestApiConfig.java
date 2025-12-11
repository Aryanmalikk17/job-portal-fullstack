package com.jobportal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class RestApiConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",  // React dev server
                    "http://localhost:3001",  // Alternative React port
                    "http://127.0.0.1:3000",  // Alternative localhost
                    "https://zplusejobs.com", // Production HTTPS
                    "https://www.zplusejobs.com", // Production HTTPS (www)
                    "http://zplusejobs.com",  // Production HTTP
                    "http://www.zplusejobs.com" // Production HTTP (www)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}