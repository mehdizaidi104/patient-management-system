package com.pm.gatewayservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    // A list of endpoints that do NOT need authentication
    private final List<String> openApiEndpoints = List.of(
            "/auth/register",
            "/auth/login"
    );

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 1. Check if the path is an "open" endpoint (like /auth/login)
            if (isEndpointOpen(path)) {
                return chain.filter(exchange); // If so, let it pass
            }

            // 2. If it's not open, check the 'Authorization' header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return this.onError(exchange, "No authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // 3. Check if it's a "Bearer" token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return this.onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            // 4. Get the token itself
            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // 5. Validate the token
            try {
                if (!jwtUtil.validateToken(token)) {
                    return this.onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
                }
            } catch (Exception e) {
                // This catches any parsing errors (malformed token, etc.)
                return this.onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            }

            // 6. Token is valid! Let the request proceed.
            return chain.filter(exchange);
        };
    }

    // Helper method to send an error response
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // You could add a JSON error body here if you wanted
        return response.setComplete();
    }

    // Helper method to check our whitelist
    private boolean isEndpointOpen(String path) {
        return openApiEndpoints.stream().anyMatch(path::startsWith);
    }

    public static class Config {
        // Empty config class, needed by the abstract factory
    }
}