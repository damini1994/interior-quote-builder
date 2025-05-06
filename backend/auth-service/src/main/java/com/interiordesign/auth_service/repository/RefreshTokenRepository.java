package com.interiordesign.auth_service.repository;

import com.interiordesign.auth_service.model.RefreshToken;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface RefreshTokenRepository extends ReactiveCrudRepository<RefreshToken, Long> {
    Mono<RefreshToken> findByToken(String token);
    Flux<RefreshToken> findByUserId(Long userId);
    Mono<Void> deleteByUserId(Long userId);
}