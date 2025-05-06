package com.interiordesign.auth_service.repository;

import com.interiordesign.auth_service.model.PasswordResetToken;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface PasswordResetTokenRepository extends ReactiveCrudRepository<PasswordResetToken, Long> {
    Mono<PasswordResetToken> findByToken(String token);
    Mono<Void> deleteByUserId(Long userId);
}