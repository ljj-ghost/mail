package com.mall.gateway;

import com.mall.common.core.CommonResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class GatewayAuthClient {

    private static final ParameterizedTypeReference<CommonResponse<TokenParseResponse>> TOKEN_PARSE_RESPONSE =
        new ParameterizedTypeReference<>() {
        };

    private final WebClient webClient;

    public GatewayAuthClient(@Value("${services.auth.url}") String authServiceUrl, WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl(authServiceUrl)
            .build();
    }

    public Mono<TokenParseResponse> parseAccessToken(String token) {
        return webClient.post()
            .uri("/internal/v1/auth/tokens/parse")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new TokenParseRequest(token))
            .retrieve()
            .bodyToMono(TOKEN_PARSE_RESPONSE)
            .timeout(Duration.ofSeconds(3))
            .onErrorMap(
                WebClientRequestException.class,
                ex -> new GatewayAuthException("Auth service unavailable", false)
            )
            .map(response -> {
                if (response.code() != 0 || response.data() == null) {
                    throw new GatewayAuthException(
                        response.message() == null || response.message().isBlank() ? "Invalid token" : response.message(),
                        true
                    );
                }
                if (!"ACCESS".equals(response.data().tokenType())) {
                    throw new GatewayAuthException("Access token required", true);
                }
                return response.data();
            })
            .onErrorMap(
                ex -> !(ex instanceof GatewayAuthException),
                ex -> new GatewayAuthException("Auth validation failed", false)
            );
    }
}
