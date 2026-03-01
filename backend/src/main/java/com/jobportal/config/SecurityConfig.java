package com.jobportal.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.jobportal.services.CustomUserDetailsService;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private final String[] PUBLIC_URLS = {
        "/", "/global-search/**", "/register", "/register/**", "/webjars/**", 
        "/resources/**", "/assets/**", "/css/**", "/summernote/**", "/js/**", 
        "/*.css", "/*.js", "/*.js.map", "/fonts/**", "/images/**", "/favicon.ico",
        "/api/public/**", "/actuator/health", "/actuator/info",
        // Additional static resource paths
        "/static/**", "/public/**", "/img/**", 
        "/font-awesome/**", "/bootstrap/**", "/jquery/**",
        // REST API endpoints that don't require authentication
        "/api/auth/login", "/api/auth/register", "/api/auth/logout", 
        "/api/jobs", "/api/jobs/search", "/api/jobs/{id}",
        // Swagger/OpenAPI documentation
        "/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Single source of truth for CORS configuration.
     * Do NOT add CORS in WebMvcConfig, RestApiConfig, or @CrossOrigin annotations.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:3000", 
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "https://zplusejobs.com",
            "https://www.zplusejobs.com",
            "http://zplusejobs.com",
            "http://www.zplusejobs.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With",
            "Accept", "Origin", "Access-Control-Request-Method",
            "Access-Control-Request-Headers", "Cache-Control"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Register for ALL paths, not just /api/** — preflight requests need CORS on any path
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS Configuration — single source of truth
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF Protection — Disable for REST API endpoints
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
                .ignoringRequestMatchers("/actuator/**")
            )
            
            // Security Headers
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .contentTypeOptions(contentTypeOptions -> {})
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                    .preload(true)
                )
                .referrerPolicy(referrerPolicy -> referrerPolicy
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                // Content-Security-Policy
                .addHeaderWriter(new StaticHeadersWriter(
                    "Content-Security-Policy",
                    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com data:; " +
                    "img-src 'self' data: https:; " +
                    "connect-src 'self' https://zplusejobs.com https://www.zplusejobs.com; " +
                    "frame-ancestors 'none'"
                ))
                // Permissions-Policy
                .addHeaderWriter(new StaticHeadersWriter(
                    "Permissions-Policy",
                    "camera=(), microphone=(), geolocation=(), payment=()"
                ))
            )
            
            // Session Management — STATELESS for React SPA + JWT
            .sessionManagement(sessions -> sessions
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Exception Handling for JWT
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            
            // Authorization Rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_URLS).permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/recruiter/**", "/dashboard/add", "/dashboard/edit/**").hasAuthority("Recruiter")
                .requestMatchers("/job-seeker-profile/**", "/job-seeker-apply/**", "/job-seeker-save/**").hasAuthority("Job Seeker")
                .requestMatchers("/dashboard/", "/dashboard").authenticated()
                // API Authorization Rules
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/jobs", "/api/jobs/search", "/api/jobs/*").permitAll()
                .requestMatchers("/api/profile/**", "/api/applications/**", "/api/jobs/*/apply", "/api/jobs/*/save", "/api/saved-jobs/**").authenticated()
                .requestMatchers("/api/jobs/create", "/api/jobs/*/edit", "/api/jobs/*/delete").hasAuthority("Recruiter")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
