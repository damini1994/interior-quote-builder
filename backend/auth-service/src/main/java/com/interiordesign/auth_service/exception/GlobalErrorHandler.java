package com.interiordesign.auth_service.exception;

import com.interiordesign.auth_service.dto.response.MessageResponse;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.bind.support.WebExchangeBindException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@Order(-2)
public class GlobalErrorHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalErrorHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        DataBufferFactory bufferFactory = exchange.getResponse().bufferFactory();
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        if (ex instanceof BadCredentialsException) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            DataBuffer dataBuffer = getDataBuffer(bufferFactory,
                    MessageResponse.builder().success(false).message("Invalid credentials").build());
            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
        } else if (ex instanceof WebExchangeBindException) {
            exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
            WebExchangeBindException bindException = (WebExchangeBindException) ex;
            Map<String, String> errors = bindException.getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .collect(Collectors.toMap(
                            fieldError -> fieldError.getField(),
                            fieldError -> fieldError.getDefaultMessage()
                    ));

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Validation failed");
            response.put("errors", errors);

            DataBuffer dataBuffer = null;
            try {
                dataBuffer = bufferFactory.wrap(objectMapper.writeValueAsBytes(response));
            } catch (JsonProcessingException e) {
                dataBuffer = bufferFactory.wrap("Validation error".getBytes());
            }
            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
        } else if (ex instanceof ResponseStatusException) {
            ResponseStatusException responseStatusException = (ResponseStatusException) ex;
            exchange.getResponse().setRawStatusCode(responseStatusException.getStatusCode().value());
            DataBuffer dataBuffer = getDataBuffer(bufferFactory,
                    MessageResponse.builder().success(false).message(responseStatusException.getReason()).build());
            return exchange.getResponse().writeWith(Mono.just(dataBuffer));
        }

        exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        DataBuffer dataBuffer = getDataBuffer(bufferFactory,
                MessageResponse.builder().success(false).message("Internal server error").build());
        return exchange.getResponse().writeWith(Mono.just(dataBuffer));
    }

    private DataBuffer getDataBuffer(DataBufferFactory bufferFactory, MessageResponse response) {
        try {
            return bufferFactory.wrap(objectMapper.writeValueAsBytes(response));
        } catch (JsonProcessingException e) {
            return bufferFactory.wrap("Error occurred".getBytes());
        }
    }
}