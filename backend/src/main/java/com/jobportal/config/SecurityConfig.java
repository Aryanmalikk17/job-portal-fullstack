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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
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
        // Additional static resource paths to fix frontend layout
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
        return new BCryptPasswordEncoder(12); // Increased strength for security
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF Protection - Disable for API endpoints, enable for web endpoints
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/**") // Disable CSRF for REST APIs
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
                .referrerPolicy(referrerPolicy -> referrerPolicy.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )
            
            // Session Management - STATELESS for React SPA
            .sessionManagement(sessions -> sessions
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // FIXED: Pure JWT, no sessions
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
                .requestMatchers("/api/profile/**", "/api/jobs/*/apply", "/api/jobs/*/save", "/api/saved-jobs/**").authenticated()
                .requestMatchers("/api/jobs/create", "/api/jobs/*/edit", "/api/jobs/*/delete").hasAuthority("Recruiter")
                .anyRequest().authenticated()
            )
            
            // REMOVED: Traditional Form Login - Conflicts with React SPA
            // Using JWT-only authentication for React frontend
            
            // REMOVED: Traditional Logout - Using API-based logout
            // React handles logout via /api/auth/logout
            
            // REMOVED: Remember Me - JWT handles token persistence
            ;

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
}
