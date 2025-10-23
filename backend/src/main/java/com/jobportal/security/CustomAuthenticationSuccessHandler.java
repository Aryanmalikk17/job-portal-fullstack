package com.jobportal.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class CustomAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws ServletException, IOException {
        
        logger.info("User {} logged in successfully", authentication.getName());
        
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        // Redirect based on user role
        String redirectURL = determineTargetUrl(authorities);
        
        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + redirectURL);
            return;
        }
        
        getRedirectStrategy().sendRedirect(request, response, redirectURL);
    }

    private String determineTargetUrl(Collection<? extends GrantedAuthority> authorities) {
        for (GrantedAuthority authority : authorities) {
            String role = authority.getAuthority();
            if ("ROLE_ADMIN".equals(role)) {
                return "/admin/dashboard";
            } else if ("Recruiter".equals(role)) {
                return "/dashboard/";
            } else if ("Job Seeker".equals(role)) {
                return "/dashboard/";
            }
        }
        return "/dashboard/";
    }
}