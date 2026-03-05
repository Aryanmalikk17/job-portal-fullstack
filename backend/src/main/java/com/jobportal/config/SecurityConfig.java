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

    // Strictly public endpoints — no authentication required
    private final String[] PUBLIC_URLS = {
        "/", "/global-search/**", "/register", "/register/**", "/webjars/**",
        "/resources/**", "/assets/**", "/css/**", "/summernote/**", "/js/**",
        "/*.css", "/*.js", "/*.js.map", "/fonts/**", "/images/**", "/favicon.ico",
        "/api/public/**", "/actuator/health", "/actuator/info",
        "/static/**", "/public/**", "/img/**",
        "/font-awesome/**", "/bootstrap/**", "/jquery/**",
        // Auth endpoints — always public
        "/api/auth/login", "/api/auth/register", "/api/auth/logout",
        // Swagger/OpenAPI
        "/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**"
    };

    // Public job-browsing endpoints — GET only, no auth needed.
    // DO NOT add /api/jobs/* here — that would match apply/save/candidates!
    private final String[] PUBLIC_JOBS_URLS = {
        "/api/jobs",
        "/api/jobs/search"
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
            
            // Authorization Rules — Order matters: most specific first
            .authorizeHttpRequests(auth -> auth
                // ── Public: no auth needed ──
                .requestMatchers(PUBLIC_URLS).permitAll()
                .requestMatchers(PUBLIC_JOBS_URLS).permitAll()

                // ── Public job browsing: individual job view (GET only) ──
                // IMPORTANT: use GET method matcher so POST /api/jobs (create) still requires auth
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/jobs/{id}").permitAll()

                // ── Auth endpoints ──
                .requestMatchers("/api/auth/**").permitAll()

                // ── Recruiter-only endpoints ──
                .requestMatchers("/recruiter/**", "/dashboard/add", "/dashboard/edit/**").hasAuthority("Recruiter")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/jobs").hasAuthority("Recruiter")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/jobs/create").hasAuthority("Recruiter")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/jobs/{id}").hasAuthority("Recruiter")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/jobs/{id}").hasAuthority("Recruiter")
                .requestMatchers("/api/jobs/recruiter").hasAuthority("Recruiter")

                // ── Job Seeker-only endpoints ──
                .requestMatchers("/job-seeker-profile/**", "/job-seeker-apply/**", "/job-seeker-save/**").hasAuthority("Job Seeker")
                .requestMatchers("/api/saved-jobs/**").hasAuthority("Job Seeker")
                .requestMatchers("/api/applications/my-applications").hasAuthority("Job Seeker")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/jobs/{id}/apply").hasAuthority("Job Seeker")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/jobs/{id}/save").hasAuthority("Job Seeker")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/jobs/{id}/unsave").hasAuthority("Job Seeker")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/applications/{id}/withdraw").hasAuthority("Job Seeker")

                // ── Authenticated: any logged-in user ──
                .requestMatchers("/dashboard/", "/dashboard").authenticated()
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/applications/**").authenticated()
                .requestMatchers("/api/jobs/{id}/candidates").authenticated()
                .requestMatchers("/api/jobs/{id}/status").authenticated()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
