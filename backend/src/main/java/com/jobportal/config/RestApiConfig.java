package com.jobportal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * REST API configuration.
 * CORS is handled centrally by SecurityConfig.corsConfigurationSource().
 * Do NOT add addCorsMappings here — it conflicts with the Security filter chain.
 */
@Configuration
public class RestApiConfig implements WebMvcConfigurer {
    // Intentionally empty — CORS managed by SecurityConfig
}