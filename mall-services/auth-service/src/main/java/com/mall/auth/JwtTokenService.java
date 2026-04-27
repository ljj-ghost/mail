package com.mall.auth;

import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.UUID;

@Service
/**
 * 为认证服务签发并解析 JWT 访问令牌和刷新令牌。
 */
public class JwtTokenService {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);

    private final SecretKey secretKey;
    private final long accessTokenTtlSeconds;
    private final long refreshTokenTtlSeconds;

    public JwtTokenService(
        @Value("${mall.auth.jwt-secret}") String jwtSecret,
        @Value("${mall.auth.access-token-ttl-seconds}") long accessTokenTtlSeconds,
        @Value("${mall.auth.refresh-token-ttl-seconds}") long refreshTokenTtlSeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtlSeconds = accessTokenTtlSeconds;
        this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
    }

    /**
     * 为一次认证会话生成配套的访问令牌和刷新令牌。
     */
    public IssuedTokens issueTokens(Long userId, String sessionNo, String loginName, String nickname, String userRole) {
        OffsetDateTime now = OffsetDateTime.now(DEFAULT_OFFSET);
        OffsetDateTime accessExpireTime = now.plusSeconds(accessTokenTtlSeconds);
        OffsetDateTime refreshExpireTime = now.plusSeconds(refreshTokenTtlSeconds);
        String accessJti = UUID.randomUUID().toString().replace("-", "");
        String refreshJti = UUID.randomUUID().toString().replace("-", "");
        String accessToken = buildToken(userId, sessionNo, loginName, nickname, userRole, "ACCESS", accessJti, accessExpireTime);
        String refreshToken = buildToken(userId, sessionNo, loginName, nickname, userRole, "REFRESH", refreshJti, refreshExpireTime);
        return new IssuedTokens(accessToken, refreshToken, accessJti, refreshJti, accessExpireTime, refreshExpireTime);
    }

    /**
     * 解析并校验签名后的 JWT 令牌。
     */
    public ParsedToken parseToken(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
            return new ParsedToken(
                claims.get("uid", Long.class),
                claims.get("sid", String.class),
                claims.getSubject(),
                claims.get("nick", String.class),
                claims.get("role", String.class),
                claims.get("tt", String.class),
                claims.getId(),
                claims.getExpiration().toInstant().atOffset(DEFAULT_OFFSET)
            );
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Invalid token");
        }
    }

    private String buildToken(
        Long userId,
        String sessionNo,
        String loginName,
        String nickname,
        String userRole,
        String tokenType,
        String jti,
        OffsetDateTime expireTime
    ) {
        Date now = new Date();
        return Jwts.builder()
            .subject(loginName)
            .claim("uid", userId)
            .claim("sid", sessionNo)
            .claim("nick", nickname)
            .claim("role", userRole)
            .claim("tt", tokenType)
            .id(jti)
            .issuedAt(now)
            .expiration(Date.from(expireTime.toInstant()))
            .signWith(secretKey)
            .compact();
    }

    public record IssuedTokens(
        String accessToken,
        String refreshToken,
        String accessJti,
        String refreshJti,
        OffsetDateTime accessExpireTime,
        OffsetDateTime refreshExpireTime
    ) {
    }

    public record ParsedToken(
        Long userId,
        String sessionNo,
        String loginName,
        String nickname,
        String userRole,
        String tokenType,
        String jti,
        OffsetDateTime expireTime
    ) {
    }
}

