package com.jobportal.api;

import com.jobportal.config.JwtTokenProvider;
import com.jobportal.dto.ApiResponse;
import com.jobportal.dto.JwtResponse;
import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.RegisterRequestDto;
import com.jobportal.dto.UserProfileDto;
import com.jobportal.entity.Users;
import com.jobportal.entity.UsersType;
import com.jobportal.services.UsersService;
import com.jobportal.services.UsersTypeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthRestController {

    private static final Logger logger = LoggerFactory.getLogger(AuthRestController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UsersService usersService;

    @Autowired
    private UsersTypeService usersTypeService;

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for email: {}", loginRequest.getEmail());

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Users user = usersService.findByEmail(userDetails.getUsername());
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not found", null));
            }

            String jwt = tokenProvider.generateToken(
                userDetails.getUsername(), 
                user.getUserTypeId().getUserTypeName(), 
                Long.valueOf(user.getUserId())
            );

            // Return direct JwtResponse for frontend compatibility
            JwtResponse jwtResponse = new JwtResponse(
                jwt,
                Long.valueOf(user.getUserId()),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getUserTypeId().getUserTypeName(),
                tokenProvider.getExpirationTime()
            );

            logger.info("Login successful for user: {}", user.getEmail());
            return ResponseEntity.ok(jwtResponse);

        } catch (BadCredentialsException e) {
            logger.warn("Invalid credentials for email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, "Invalid email or password", null));
        } catch (Exception e) {
            logger.error("Login error for email: {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Login failed. Please try again.", null));
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto registerRequest) {
        return processRegistration(registerRequest);
    }

    // Alias endpoint for frontend compatibility
    @PostMapping("/register/new")
    public ResponseEntity<?> registerAlias(@Valid @RequestBody RegisterRequestDto registerRequest) {
        return processRegistration(registerRequest);
    }

    private ResponseEntity<?> processRegistration(RegisterRequestDto registerRequest) {
        try {
            logger.info("Registration attempt for email: {}", registerRequest.getEmail());

            // Check if user already exists
            Optional<Users> existingUser = usersService.getUserByEmail(registerRequest.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(false, "Email already registered", null));
            }

            // Get user type
            Optional<UsersType> userType = usersTypeService.findById(registerRequest.getUserTypeId());
            if (userType.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Invalid user type", null));
            }

            // Create new user
            Users newUser = new Users();
            newUser.setFirstName(registerRequest.getFirstName());
            newUser.setLastName(registerRequest.getLastName());
            newUser.setEmail(registerRequest.getEmail());
            newUser.setPassword(registerRequest.getPassword()); // Will be encoded by service
            newUser.setUserTypeId(userType.get());

            Users savedUser = usersService.addNew(newUser);

            // Generate JWT token and return direct response for frontend compatibility
            String jwt = tokenProvider.generateToken(
                savedUser.getEmail(),
                savedUser.getUserTypeId().getUserTypeName(),
                Long.valueOf(savedUser.getUserId())
            );

            JwtResponse jwtResponse = new JwtResponse(
                jwt,
                Long.valueOf(savedUser.getUserId()),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getUserTypeId().getUserTypeName(),
                tokenProvider.getExpirationTime()
            );

            logger.info("Registration successful for user: {}", savedUser.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(jwtResponse);

        } catch (Exception e) {
            logger.error("Registration error for email: {}", registerRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Registration failed. Please try again.", null));
        }
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        try {
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful", null));
        } catch (Exception e) {
            logger.error("Logout error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Logout failed", null));
        }
    }

    @GetMapping("/auth/user")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser() {
        try {
            Users currentUser = usersService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "User not authenticated", null));
            }

            UserProfileDto userProfile = new UserProfileDto();
            userProfile.setUserId(currentUser.getUserId());
            userProfile.setFirstName(currentUser.getFirstName());
            userProfile.setLastName(currentUser.getLastName());
            userProfile.setEmail(currentUser.getEmail());
            userProfile.setUserType(currentUser.getUserTypeId().getUserTypeName());
            userProfile.setRegistrationDate(currentUser.getRegistrationDate());

            return ResponseEntity.ok(new ApiResponse<>(true, "User profile retrieved", userProfile));

        } catch (Exception e) {
            logger.error("Error getting current user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving user profile", null));
        }
    }

    // Change from POST to GET for frontend compatibility
    @GetMapping("/auth/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyTokenGet(@RequestHeader(value = "Authorization", required = false) String token) {
        return processTokenVerification(token);
    }

    // Keep POST version for backward compatibility
    @PostMapping("/auth/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyTokenPost(@RequestHeader(value = "Authorization", required = false) String token) {
        return processTokenVerification(token);
    }

    private ResponseEntity<ApiResponse<Boolean>> processTokenVerification(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                boolean isValid = tokenProvider.validateToken(jwt);
                return ResponseEntity.ok(new ApiResponse<>(true, "Token validation result", isValid));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Token validation result", false));
        } catch (Exception e) {
            logger.error("Token verification error", e);
            return ResponseEntity.ok(new ApiResponse<>(true, "Token validation result", false));
        }
    }
}