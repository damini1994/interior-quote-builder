package com.interiordesign.auth_service.service;

import com.interiordesign.auth_service.model.PasswordResetToken;
import com.interiordesign.auth_service.model.User;
import com.interiordesign.auth_service.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${password.reset.expiration:86400000}") // 24 hours in milliseconds by default
    private Long tokenExpirationMs;

    public Mono<String> createToken(User user) {
        // First, delete any existing tokens for this user
        return passwordResetTokenRepository.deleteByUserId(user.getId())
                .then(Mono.defer(() -> {
                    String token = UUID.randomUUID().toString();
                    PasswordResetToken resetToken = PasswordResetToken.builder()
                            .userId(user.getId())
                            .token(token)
                            .expiryDate(Instant.now().plusMillis(tokenExpirationMs))
                            .used(false)
                            .createdAt(Instant.now())
                            .build();

                    return passwordResetTokenRepository.save(resetToken)
                            .map(saved -> token);
                }));
    }

    public Mono<PasswordResetToken> validateToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .filter(resetToken -> !resetToken.isUsed() && resetToken.getExpiryDate().isAfter(Instant.now()));
    }

    public Mono<PasswordResetToken> markTokenUsed(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .flatMap(resetToken -> {
                    resetToken.setUsed(true);
                    return passwordResetTokenRepository.save(resetToken);
                });
    }
}
