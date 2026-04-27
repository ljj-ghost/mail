package com.mall.gateway;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.common.core.CommonResponse;
import com.mall.common.core.CommonResultCode;
import com.mall.common.core.TraceIds;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.PathContainer;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
/**
 * 在网关层执行鉴权校验，并将解析出的用户信息透传给下游服务。
 */
public class GatewayAuthenticationFilter implements WebFilter, Ordered {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String SESSION_NO_HEADER = "X-Session-No";
    private static final String LOGIN_NAME_HEADER = "X-Login-Name";
    private static final String NICKNAME_HEADER = "X-Nickname";
    private static final String USER_ROLE_HEADER = "X-User-Role";
    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    private static final PathPatternParser PATH_PATTERN_PARSER = new PathPatternParser();
    private static final List<PathPattern> PUBLIC_PATTERNS = List.of(
        PATH_PATTERN_PARSER.parse("/actuator"),
        PATH_PATTERN_PARSER.parse("/actuator/{*path}"),
        PATH_PATTERN_PARSER.parse("/api/v1/auth/login/password"),
        PATH_PATTERN_PARSER.parse("/api/v1/auth/register"),
        PATH_PATTERN_PARSER.parse("/api/v1/auth/token/refresh"),
        PATH_PATTERN_PARSER.parse("/api/v1/products"),
        PATH_PATTERN_PARSER.parse("/api/v1/products/categories"),
        PATH_PATTERN_PARSER.parse("/api/v1/products/recommend"),
        PATH_PATTERN_PARSER.parse("/api/v1/products/assets/{*path}"),
        PATH_PATTERN_PARSER.parse("/api/v1/products/spu/{*path}"),
        PATH_PATTERN_PARSER.parse("/api/v1/products/sku/{*path}")
    );

    private final GatewayAuthClient gatewayAuthClient;
    private final ObjectMapper objectMapper;

    public GatewayAuthenticationFilter(GatewayAuthClient gatewayAuthClient, ObjectMapper objectMapper) {
        this.gatewayAuthClient = gatewayAuthClient;
        this.objectMapper = objectMapper;
    }

    @Override
    /**
     * 放行公开请求，并对受保护接口强制执行 Bearer Token 校验。
     */
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }
        if ("/error".equals(path)) {
            return chain.filter(exchange);
        }
        if (path.startsWith("/internal/")) {
            return writeFailure(exchange, HttpStatus.FORBIDDEN, CommonResultCode.FORBIDDEN.code(), "Internal API is not exposed through gateway");
        }
        if (isPublicPath(path)) {
            return chain.filter(mutateExchange(exchange, null));
        }
        if (!path.startsWith("/api/")) {
            return chain.filter(exchange);
        }

        String bearerToken = extractBearerToken(exchange.getRequest().getHeaders());
        if (bearerToken == null) {
            return writeFailure(exchange, HttpStatus.UNAUTHORIZED, CommonResultCode.UNAUTHORIZED.code(), "Authorization bearer token required");
        }

        return gatewayAuthClient.parseAccessToken(bearerToken)
            .flatMap(parsed -> chain.filter(mutateExchange(exchange, parsed)))
            .onErrorResume(GatewayAuthException.class, ex -> writeFailure(
                exchange,
                ex.unauthorized() ? HttpStatus.UNAUTHORIZED : HttpStatus.INTERNAL_SERVER_ERROR,
                ex.unauthorized() ? CommonResultCode.UNAUTHORIZED.code() : CommonResultCode.SYSTEM_ERROR.code(),
                ex.getMessage()
            ));
    }

    private boolean isPublicPath(String path) {
        PathContainer pathContainer = PathContainer.parsePath(path);
        return PUBLIC_PATTERNS.stream().anyMatch(pattern -> pattern.matches(pathContainer));
    }

    private ServerWebExchange mutateExchange(ServerWebExchange exchange, TokenParseResponse parsed) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
            .headers(headers -> {
                headers.remove(USER_ID_HEADER);
                headers.remove(SESSION_NO_HEADER);
                headers.remove(LOGIN_NAME_HEADER);
                headers.remove(NICKNAME_HEADER);
                headers.remove(USER_ROLE_HEADER);
                if (parsed != null) {
                    headers.set(USER_ID_HEADER, String.valueOf(parsed.userId()));
                    headers.set(SESSION_NO_HEADER, parsed.sessionNo());
                    headers.set(LOGIN_NAME_HEADER, parsed.loginName());
                    headers.set(NICKNAME_HEADER, parsed.nickname());
                    headers.set(USER_ROLE_HEADER, parsed.userRole());
                }
            })
            .build();
        return exchange.mutate().request(mutatedRequest).build();
    }

    private String extractBearerToken(HttpHeaders headers) {
        String authorization = headers.getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        String token = authorization.substring(7).trim();
        return token.isBlank() ? null : token;
    }

    private Mono<Void> writeFailure(ServerWebExchange exchange, HttpStatus status, int code, String message) {
        String traceId = TraceIds.newTraceId();
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set(TRACE_ID_HEADER, traceId);
        try {
            byte[] body = objectMapper.writeValueAsBytes(CommonResponse.failure(code, message, traceId));
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
        } catch (JsonProcessingException ex) {
            byte[] fallback = ("{\"code\":" + code + ",\"message\":\"" + message + "\",\"traceId\":\"" + traceId + "\"}")
                .getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(fallback)));
        }
    }

    @Override
    /**
     * 在大多数网关过滤器之前执行，确保下游路由始终能拿到鉴权后的请求头。
     */
    public int getOrder() {
        return -100;
    }
}

