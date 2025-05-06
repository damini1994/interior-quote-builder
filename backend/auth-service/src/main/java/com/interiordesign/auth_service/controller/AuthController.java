package com.interiordesign.auth_service.controller;

import com.interiordesign.auth_service.dto.request.*;
import com.interiordesign.auth_service.dto.response.MessageResponse;
import com.interiordesign.auth_service.dto.response.TokenResponse;
import com.interiordesign.auth_service.dto.response.UserResponse;
import com.interiordesign.auth_service.model.User;
import com.interiordesign.auth_service.service.AuthService;
import com.interiordesign.auth_service.service.RefreshTokenService;
import com.interiordesign.auth_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public Mono<ResponseEntity<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<MessageResponse>> logout(@RequestBody RefreshTokenRequest request) {
        return refreshTokenService.deleteByToken(request.getRefreshToken())
                .then(Mono.just(ResponseEntity.ok(
                        MessageResponse.builder()
                                .success(true)
                                .message("Logged out successfully")
                                .build()
                )));
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @GetMapping("/user")
    public Mono<ResponseEntity<UserResponse>> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return Mono.just(ResponseEntity.ok(mapUserToResponse(user)));
    }

    @PutMapping("/user")
    public Mono<ResponseEntity<UserResponse>> updateUser(
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return userService.updateUser(user.getId(), request)
                .map(this::mapUserToResponse)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/reset-password")
    public Mono<ResponseEntity<MessageResponse>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        return authService.initiatePasswordReset(request.getEmail())
                .then(Mono.just(ResponseEntity.ok(
                        MessageResponse.builder()
                                .success(true)
                                .message("Password reset request has been sent to your email")
                                .build()
                )))
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @PutMapping("/reset-password/{token}")
    public Mono<ResponseEntity<MessageResponse>> resetPassword(
            @PathVariable String token,
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return Mono.just(ResponseEntity.badRequest().body(
                    MessageResponse.builder()
                            .success(false)
                            .message("Passwords do not match")
                            .build()
            ));
        }

        return authService.completePasswordReset(token, request.getPassword())
                .then(Mono.just(ResponseEntity.ok(
                        MessageResponse.builder()
                                .success(true)
                                .message("Password has been reset successfully")
                                .build()
                )))
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }

    @PostMapping("/refresh-token")
    public Mono<ResponseEntity<TokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request.getRefreshToken())
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}