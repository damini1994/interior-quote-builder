package com.interiordesign.auth_service.service;

import com.interiordesign.auth_service.model.RefreshToken;
import com.interiordesign.auth_service.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private Long refreshTokenDurationMs;

    public Mono<RefreshToken> createRefreshToken(Long userId, String token) {
        // First revoke any existing refresh tokens for this user
        return revokeAllUserTokens(userId)
                .then(Mono.defer(() -> {
                    RefreshToken refreshToken = RefreshToken.builder()
                            .userId(userId)
                            .token(token)
                            .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                            .revoked(false)
                            .createdAt(Instant.now())
                            .build();

                    return refreshTokenRepository.save(refreshToken);
                }));
    }

    public Mono<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public Mono<Void> deleteByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .flatMap(refreshToken -> {
                    refreshToken.setRevoked(true);
                    return refreshTokenRepository.save(refreshToken);
                })
                .then();
    }

    public Mono<Void> revokeAllUserTokens(Long userId) {
        return refreshTokenRepository.findByUserId(userId)
                .flatMap(token -> {
                    token.setRevoked(true);
                    return refreshTokenRepository.save(token);
                })
                .then();
    }

    public Mono<Void> deleteAllUserTokens(Long userId) {
        return refreshTokenRepository.deleteByUserId(userId);
    }
}
