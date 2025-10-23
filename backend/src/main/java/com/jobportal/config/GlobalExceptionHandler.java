package com.jobportal.config;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.ui.Model;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Handle authentication and authorization errors
    @ExceptionHandler(UsernameNotFoundException.class)
    public String handleUserNotFound(UsernameNotFoundException ex, Model model, HttpServletRequest request) {
        logger.warn("User not found: {}", ex.getMessage());
        model.addAttribute("error", "User not found. Please check your credentials.");
        model.addAttribute("errorCode", "USER_NOT_FOUND");
        
        // Redirect to login page for authentication errors
        if (request.getRequestURI().contains("/login")) {
            return "login";
        }
        return "error/404";
    }

    @ExceptionHandler(AccessDeniedException.class)
    public String handleAccessDenied(AccessDeniedException ex, Model model, HttpServletRequest request) {
        logger.warn("Access denied for user at: {}", request.getRequestURI());
        model.addAttribute("error", "You don't have permission to access this resource.");
        model.addAttribute("errorCode", "ACCESS_DENIED");
        model.addAttribute("requestUri", request.getRequestURI());
        return "error/403";
    }

    // Handle file operation errors
    @ExceptionHandler(IOException.class)
    public String handleIOException(IOException ex, Model model, HttpServletRequest request) {
        logger.error("File operation failed: {}", ex.getMessage(), ex);
        model.addAttribute("error", "File operation failed. Please try again.");
        model.addAttribute("errorCode", "FILE_OPERATION_ERROR");
        model.addAttribute("details", "Unable to process the requested file operation.");
        return "error/500";
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public String handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex, Model model) {
        logger.warn("File upload size exceeded: {}", ex.getMessage());
        model.addAttribute("error", "File size too large. Please upload a smaller file.");
        model.addAttribute("errorCode", "FILE_SIZE_EXCEEDED");
        model.addAttribute("maxSize", "Maximum allowed size is 10MB");
        return "error/400";
    }

    // Handle database errors
    @ExceptionHandler(DataIntegrityViolationException.class)
    public String handleDataIntegrityViolation(DataIntegrityViolationException ex, Model model, HttpServletRequest request) {
        logger.warn("Data integrity violation: {}", ex.getMessage());
        
        String errorMessage = "Data operation failed.";
        String errorCode = "DATA_INTEGRITY_ERROR";
        
        // Provide specific error messages based on the constraint violation
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("email")) {
                errorMessage = "This email address is already registered. Please use a different email or try logging in.";
                errorCode = "DUPLICATE_EMAIL";
            } else if (ex.getMessage().contains("username")) {
                errorMessage = "This username is already taken. Please choose a different username.";
                errorCode = "DUPLICATE_USERNAME";
            } else if (ex.getMessage().contains("Duplicate entry")) {
                errorMessage = "This record already exists. Please check your data and try again.";
                errorCode = "DUPLICATE_ENTRY";
            }
        }
        
        model.addAttribute("error", errorMessage);
        model.addAttribute("errorCode", errorCode);
        
        // Return to the form page for registration errors
        if (request.getRequestURI().contains("/register")) {
            model.addAttribute("user", new com.jobportal.entity.Users());
            return "register";
        }
        
        return "error/400";
    }

    @ExceptionHandler(SQLException.class)
    public String handleSQLException(SQLException ex, Model model) {
        logger.error("Database error: {}", ex.getMessage(), ex);
        model.addAttribute("error", "Database operation failed. Please try again later.");
        model.addAttribute("errorCode", "DATABASE_ERROR");
        model.addAttribute("details", "Our technical team has been notified of this issue.");
        return "error/500";
    }

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public String handleValidationErrors(MethodArgumentNotValidException ex, Model model, HttpServletRequest request) {
        logger.info("Validation failed: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        model.addAttribute("validationErrors", errors);
        model.addAttribute("error", "Please correct the highlighted fields and try again.");
        model.addAttribute("errorCode", "VALIDATION_ERROR");
        
        // Return to the appropriate form based on request URI
        if (request.getRequestURI().contains("/register")) {
            return "register";
        } else if (request.getRequestURI().contains("/job-seeker-profile")) {
            return "job-seeker-profile";
        } else if (request.getRequestURI().contains("/dashboard/add")) {
            return "add-jobs";
        }
        
        return "error/400";
    }

    @ExceptionHandler(BindException.class)
    public String handleBindException(BindException ex, Model model, HttpServletRequest request) {
        logger.info("Binding error: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        model.addAttribute("validationErrors", errors);
        model.addAttribute("error", "Invalid data provided. Please check your input.");
        model.addAttribute("errorCode", "BINDING_ERROR");
        
        return "error/400";
    }

    // Handle 404 errors
    @ExceptionHandler(NoHandlerFoundException.class)
    public String handleNotFound(NoHandlerFoundException ex, Model model, HttpServletRequest request) {
        logger.info("Page not found: {}", request.getRequestURI());
        model.addAttribute("error", "The page you're looking for doesn't exist.");
        model.addAttribute("errorCode", "PAGE_NOT_FOUND");
        model.addAttribute("requestedUrl", request.getRequestURI());
        return "error/404";
    }

    // Handle custom business logic exceptions - unified handler for both web and AJAX
    @ExceptionHandler(RuntimeException.class)
    public Object handleRuntimeException(RuntimeException ex, Model model, HttpServletRequest request) {
        // Check if this is an AJAX request first
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestedWith)) {
            // Handle AJAX requests with JSON response
            logger.error("AJAX request error: {}", ex.getMessage(), ex);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("timestamp", new java.util.Date());
            
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            String message = "An error occurred processing your request";
            
            // Handle specific exception types for AJAX requests
            if (ex instanceof UsernameNotFoundException) {
                status = HttpStatus.NOT_FOUND;
                message = "User not found";
            } else if (ex instanceof AccessDeniedException) {
                status = HttpStatus.FORBIDDEN;
                message = "Access denied";
            } else if (ex.getCause() instanceof DataIntegrityViolationException) {
                status = HttpStatus.BAD_REQUEST;
                message = "Data validation failed";
            } else if (ex.getCause() instanceof MethodArgumentNotValidException) {
                status = HttpStatus.BAD_REQUEST;
                message = "Validation failed";
            }
            
            errorResponse.put("message", message);
            return new ResponseEntity<>(errorResponse, status);
        }
        
        // Handle web requests with HTML response
        logger.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        
        // Handle specific runtime exceptions
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("User not found")) {
                model.addAttribute("error", "User account not found. Please log in again.");
                model.addAttribute("errorCode", "USER_SESSION_ERROR");
                return "login";
            } else if (ex.getMessage().contains("Job not found")) {
                model.addAttribute("error", "The requested job posting is no longer available.");
                model.addAttribute("errorCode", "JOB_NOT_FOUND");
                return "error/404";
            }
        }
        
        model.addAttribute("error", "An unexpected error occurred. Please try again.");
        model.addAttribute("errorCode", "RUNTIME_ERROR");
        model.addAttribute("details", "Our technical team has been notified of this issue.");
        return "error/500";
    }

    // Handle all other exceptions
    @ExceptionHandler(Exception.class)
    public String handleGenericException(Exception ex, Model model, HttpServletRequest request) {
        // Check if this is an AJAX request
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestedWith)) {
            // For AJAX requests, we need to return a different response
            // This will be handled by a separate method
            logger.error("AJAX request error: {}", ex.getMessage(), ex);
            model.addAttribute("error", "An error occurred processing your AJAX request");
            model.addAttribute("errorCode", "AJAX_ERROR");
            return "error/ajax-error"; // You can create a simple JSON response template
        }
        
        logger.error("Unexpected error occurred at: {}", request.getRequestURI(), ex);
        
        model.addAttribute("error", "An unexpected error occurred. Please try again later.");
        model.addAttribute("errorCode", "INTERNAL_SERVER_ERROR");
        model.addAttribute("details", "Our technical team has been notified and is working to resolve this issue.");
        model.addAttribute("requestUri", request.getRequestURI());
        model.addAttribute("timestamp", new java.util.Date());
        
        return "error/500";
    }
}