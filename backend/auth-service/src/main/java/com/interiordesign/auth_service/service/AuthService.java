package com.interiordesign.auth_service.service;

import com.interiordesign.auth_service.dto.request.LoginRequest;
import com.interiordesign.auth_service.dto.request.RegisterRequest;
import com.interiordesign.auth_service.dto.response.TokenResponse;
import com.interiordesign.auth_service.dto.response.UserResponse;
import com.interiordesign.auth_service.model.User;
import com.interiordesign.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public Mono<TokenResponse> login(LoginRequest request) {
        return userService.findByUsername(request.getEmail())
                .cast(User.class)
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .flatMap(this::generateTokenResponse)
                .switchIfEmpty(Mono.error(new BadCredentialsException("Invalid credentials")));
    }

    public Mono<TokenResponse> register(RegisterRequest request) {
        return userService.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.empty();
                    }

                    User user = User.builder()
                            .email(request.getEmail())
                            .password(request.getPassword())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .role(request.getRole())
                            .build();

                    return userService.createUser(user)
                            .flatMap(this::generateTokenResponse);
                });
    }

    public Mono<TokenResponse> refreshToken(String refreshToken) {
        return refreshTokenService.findByToken(refreshToken)
                .filter(token -> !token.isRevoked() && token.getExpiryDate().isAfter(Instant.now()))
                .flatMap(token -> userService.findById(token.getUserId()))
                .flatMap(this::generateTokenResponse);
    }

    public Mono<Void> initiatePasswordReset(String email) {
        return userService.findByUsername(email)
                .cast(User.class)
                .flatMap(user -> passwordResetService.createToken(user)
                        .flatMap(token -> emailService.sendPasswordResetEmail(user.getEmail(), token)))
                .then();
    }

    public Mono<Void> completePasswordReset(String token, String newPassword) {
        return passwordResetService.validateToken(token)
                .flatMap(resetToken -> userService.changePassword(resetToken.getUserId(), newPassword)
                        .then(passwordResetService.markTokenUsed(resetToken.getToken())))
                .then();
    }

    private Mono<TokenResponse> generateTokenResponse(User user) {
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return refreshTokenService.createRefreshToken(user.getId(), refreshToken)
                .map(token -> TokenResponse.builder()
                        .token(accessToken)
                        .refreshToken(refreshToken)
                        .user(mapUserToResponse(user))
                        .build());
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