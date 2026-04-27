package com.mall.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
/**
 * 协调登录、注册、令牌刷新以及管理员用户操作等认证业务。
 */
public class AuthService {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);
    private static final int ACCOUNT_STATUS_ENABLED = 1;
    private static final int SESSION_STATUS_ACTIVE = 1;
    private static final int SESSION_STATUS_INVALID = 2;
    private static final int SESSION_STATUS_LOGOUT = 3;
    private static final int LOGIN_RESULT_SUCCESS = 1;
    private static final int LOGIN_RESULT_FAIL = 2;

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    public AuthService(
        AuthRepository authRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenService jwtTokenService,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper,
        PlatformTransactionManager transactionManager
    ) {
        this.authRepository = authRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    /**
     * 使用密码完成用户认证，记录登录事件，并签发新的会话令牌。
     */
    public TokenInfoDTO loginByPassword(LoginByPasswordRequest request, String clientIp, String userAgent) {
        AuthRepository.AuthAccountRecord account = authRepository.findAccountByLoginName(request.loginName());
        int deviceType = normalizeDeviceType(request.deviceType());
        if (account == null) {
            authRepository.insertLoginLog(0L, 1, request.loginName(), deviceType, clientIp, userAgent, LOGIN_RESULT_FAIL, "ACCOUNT_NOT_FOUND");
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Account or password incorrect");
        }
        if (account.status() == null || account.status() != ACCOUNT_STATUS_ENABLED) {
            authRepository.insertLoginLog(account.userId(), account.loginType(), account.loginName(), deviceType, clientIp, userAgent, LOGIN_RESULT_FAIL, "ACCOUNT_DISABLED");
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Account disabled");
        }
        if (account.failCount() != null && account.failCount() >= 5) {
            authRepository.insertLoginLog(account.userId(), account.loginType(), account.loginName(), deviceType, clientIp, userAgent, LOGIN_RESULT_FAIL, "TOO_MANY_FAILURES");
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Account locked due to too many failed logins");
        }
        if (!passwordEncoder.matches(request.password(), account.passwordHash())) {
            transactionTemplate.executeWithoutResult(status -> {
                authRepository.incrementFailCount(account.id());
                authRepository.insertLoginLog(account.userId(), account.loginType(), account.loginName(), deviceType, clientIp, userAgent, LOGIN_RESULT_FAIL, "BAD_PASSWORD");
            });
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Account or password incorrect");
        }

        String nickname = resolveNickname(account);
        String userRole = normalizeRole(account.roleCode());
        String sessionNo = "SES-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        JwtTokenService.IssuedTokens tokens = jwtTokenService.issueTokens(account.userId(), sessionNo, account.loginName(), nickname, userRole);
        OffsetDateTime now = OffsetDateTime.now(DEFAULT_OFFSET);
        AuthRepository.AuthSessionRecord session = new AuthRepository.AuthSessionRecord(
            sessionNo,
            account.userId(),
            tokens.accessJti(),
            tokens.refreshJti(),
            deviceType,
            normalizeDeviceId(request.deviceId()),
            clientIp,
            userAgent,
            now,
            tokens.refreshExpireTime(),
            SESSION_STATUS_ACTIVE
        );

        transactionTemplate.executeWithoutResult(status -> {
            authRepository.markLoginSuccess(account.id(), clientIp);
            authRepository.insertSession(session);
            authRepository.insertLoginLog(account.userId(), account.loginType(), account.loginName(), deviceType, clientIp, userAgent, LOGIN_RESULT_SUCCESS, "");
        });
        cacheSession(session);
        return toTokenInfo(tokens, sessionNo, account.userId(), nickname, userRole);
    }

    /**
     * 创建新的会员账号，并立即完成登录。
     */
    public TokenInfoDTO registerByPassword(RegisterByPasswordRequest request, String clientIp, String userAgent) {
        String loginName = normalizeLoginName(request.loginName());
        String nickname = normalizeNickname(request.nickname());
        String mobile = normalizeMobile(request.mobile());
        String email = normalizeEmail(request.email());
        LinkedHashSet<String> aliases = new LinkedHashSet<>();
        aliases.add(loginName);
        aliases.add(mobile);
        aliases.add(email);

        transactionTemplate.executeWithoutResult(status -> {
            if (authRepository.existsAccount(loginName)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Login name already registered");
            }
            if (authRepository.existsUserByMobile(mobile)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Mobile number already registered");
            }
            if (authRepository.existsUserByEmail(email)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Email already registered");
            }
            for (String alias : aliases) {
                if (!alias.equals(loginName) && authRepository.existsAccount(alias)) {
                    throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Login alias already registered");
                }
            }

            Long userId = generateUserId();
            String passwordHash = passwordEncoder.encode(request.password());
            authRepository.insertUser(userId, nickname, mobile, email, "USER");
            for (String alias : aliases) {
                authRepository.insertAccount(userId, 1, alias, passwordHash, ACCOUNT_STATUS_ENABLED, nickname);
            }
        });

        return loginByPassword(
            new LoginByPasswordRequest(loginName, request.password(), request.deviceId(), request.deviceType()),
            clientIp,
            userAgent
        );
    }

    /**
     * 将有效刷新令牌轮换为新的一组访问令牌和刷新令牌。
     */
    public TokenInfoDTO refreshToken(TokenRefreshRequest request, String clientIp, String userAgent) {
        JwtTokenService.ParsedToken parsedToken = jwtTokenService.parseToken(request.refreshToken());
        if (!"REFRESH".equals(parsedToken.tokenType())) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Refresh token required");
        }
        AuthRepository.AuthSessionRecord session = requireSession(parsedToken.sessionNo());
        ensureSessionValid(session, parsedToken, false);
        ensureUserEnabled(session.userId());

        AuthRepository.AuthAccountRecord account = authRepository.findPrimaryAccountByUserId(session.userId());
        String nickname = account == null ? "Mall User" : resolveNickname(account);
        String loginName = account == null ? parsedToken.loginName() : account.loginName();
        String userRole = account == null ? normalizeRole(parsedToken.userRole()) : normalizeRole(account.roleCode());
        JwtTokenService.IssuedTokens tokens = jwtTokenService.issueTokens(session.userId(), session.sessionNo(), loginName, nickname, userRole);
        OffsetDateTime now = OffsetDateTime.now(DEFAULT_OFFSET);
        boolean updated = authRepository.updateSessionTokens(
            session.sessionNo(),
            tokens.accessJti(),
            tokens.refreshJti(),
            clientIp,
            userAgent,
            now,
            tokens.refreshExpireTime()
        );
        if (!updated) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Refresh session failed");
        }

        AuthRepository.AuthSessionRecord refreshed = new AuthRepository.AuthSessionRecord(
            session.sessionNo(),
            session.userId(),
            tokens.accessJti(),
            tokens.refreshJti(),
            session.deviceType(),
            session.deviceId(),
            clientIp,
            userAgent,
            now,
            tokens.refreshExpireTime(),
            SESSION_STATUS_ACTIVE
        );
        cacheSession(refreshed);
        return toTokenInfo(tokens, session.sessionNo(), session.userId(), nickname, userRole);
    }

    /**
     * 使当前会话失效，令其对应令牌不可继续使用。
     */
    public boolean logout(String authorizationHeader) {
        JwtTokenService.ParsedToken parsedToken = parseBearerAccessToken(authorizationHeader);
        AuthRepository.AuthSessionRecord session = requireSession(parsedToken.sessionNo());
        ensureSessionValid(session, parsedToken, true);
        authRepository.updateSessionStatus(session.sessionNo(), SESSION_STATUS_LOGOUT);
        evictSession(session.sessionNo());
        return true;
    }

    /**
     * 在校验旧密码通过后修改当前用户密码。
     */
    public boolean resetCurrentUserPassword(String authorizationHeader, CurrentUserPasswordResetRequest request) {
        JwtTokenService.ParsedToken parsedToken = parseBearerAccessToken(authorizationHeader);
        ensureUserEnabled(parsedToken.userId());
        AuthRepository.AuthAccountRecord account = authRepository.findPrimaryAccountByUserId(parsedToken.userId());
        if (account == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Current user account not found");
        }
        if (!passwordEncoder.matches(request.currentPassword(), account.passwordHash())) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Current password incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), account.passwordHash())) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "New password must be different from the current password");
        }

        transactionTemplate.executeWithoutResult(txStatus -> {
            if (authRepository.updateAccountsPassword(parsedToken.userId(), passwordEncoder.encode(request.newPassword())) <= 0) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reset password failed");
            }
            invalidateUserSessions(parsedToken.userId());
        });
        return true;
    }

    /**
     * 列出当前用户的活动会话和历史会话。
     */
    public List<UserSessionDTO> sessions(String authorizationHeader) {
        JwtTokenService.ParsedToken parsedToken = parseBearerAccessToken(authorizationHeader);
        return authRepository.findSessionsByUserId(parsedToken.userId()).stream()
            .map(session -> new UserSessionDTO(
                session.sessionNo(),
                session.deviceType(),
                session.deviceId(),
                session.clientIp(),
                session.userAgent(),
                session.lastActiveTime(),
                session.expireTime(),
                session.status(),
                session.sessionNo().equals(parsedToken.sessionNo())
            ))
            .toList();
    }

    /**
     * 强制将当前用户的某个会话踢下线。
     */
    public boolean kickout(String authorizationHeader, String sessionNo) {
        JwtTokenService.ParsedToken parsedToken = parseBearerAccessToken(authorizationHeader);
        AuthRepository.AuthSessionRecord targetSession = requireSession(sessionNo);
        if (!parsedToken.userId().equals(targetSession.userId())) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Session does not belong to current user");
        }
        authRepository.updateSessionStatusByUserId(parsedToken.userId(), sessionNo, SESSION_STATUS_INVALID);
        evictSession(sessionNo);
        return true;
    }

    /**
     * 解析令牌并返回网关及其他服务可信赖的身份字段。
     */
    public TokenParseResponse parseToken(String token) {
        JwtTokenService.ParsedToken parsedToken = jwtTokenService.parseToken(token);
        AuthRepository.AuthSessionRecord session = requireSession(parsedToken.sessionNo());
        ensureSessionValid(session, parsedToken, "ACCESS".equals(parsedToken.tokenType()));
        return new TokenParseResponse(
            parsedToken.userId(),
            parsedToken.sessionNo(),
            parsedToken.loginName(),
            parsedToken.nickname(),
            normalizeRole(parsedToken.userRole()),
            parsedToken.tokenType()
        );
    }

    /**
     * 返回指定用户当前是否仍可进行认证。
     */
    public UserAuthStatusDTO userStatus(Long userId) {
        return new UserAuthStatusDTO(userId, authRepository.existsEnabledUser(userId));
    }

    /**
     * 汇总管理员控制台所需的用户统计信息。
     */
    public AdminUserSummaryDTO adminSummary() {
        requireAdmin();
        return authRepository.summarizeAdminUsers();
    }

    /**
     * 返回带角色和状态过滤条件的管理员用户列表。
     */
    public List<AdminUserListItemDTO> adminUsers(String keyword, Integer status, String role, Integer limit) {
        requireAdmin();
        return authRepository.findAdminUsers(
            keyword,
            normalizeUserStatus(status, false),
            normalizeRoleCode(role, false),
            clamp(limit, 20, 100)
        );
    }

    /**
     * 加载单个用户的管理员完整详情。
     */
    public AdminUserDetailDTO adminUser(Long userId) {
        requireAdmin();
        return requireAdminUser(userId);
    }

    /**
     * 通过管理员控制台流程创建用户账号。
     */
    public AdminUserDetailDTO createAdminUser(AdminUserCreateRequest request) {
        requireAdmin();
        String loginName = normalizeLoginName(request.loginName());
        String nickname = normalizeNickname(request.nickname());
        String mobile = normalizeMobile(request.mobile());
        String email = normalizeEmail(request.email());
        String roleCode = normalizeRoleCode(request.userRole(), true);
        int status = normalizeUserStatus(request.status(), true);

        transactionTemplate.executeWithoutResult(txStatus -> {
            if (authRepository.existsAccount(loginName)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Login name already registered");
            }
            if (authRepository.existsUserByMobile(mobile)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Mobile number already registered");
            }
            if (authRepository.existsUserByEmail(email)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Email already registered");
            }

            Long userId = generateUserId();
            authRepository.insertUser(userId, nickname, mobile, email, roleCode);
            authRepository.upsertAccount(
                userId,
                1,
                loginName,
                passwordEncoder.encode(request.password()),
                status,
                roleCode,
                nickname
            );
        });

        AuthRepository.AuthAccountRecord created = authRepository.findAccountByLoginName(loginName);
        if (created == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Create admin user failed");
        }
        return requireAdminUser(created.userId());
    }

    /**
     * 在管理员控制台更新用户基础信息和启用状态。
     */
    public AdminUserDetailDTO updateAdminUser(Long userId, AdminUserUpdateRequest request) {
        requireAdmin();
        AdminUserDetailDTO current = requireAdminUser(userId);
        String loginName = normalizeLoginName(request.loginName());
        String nickname = normalizeNickname(request.nickname());
        String mobile = normalizeMobile(request.mobile());
        String email = normalizeEmail(request.email());
        String roleCode = normalizeRoleCode(request.userRole(), true);
        int status = normalizeUserStatus(request.status(), true);

        Long currentUserId = UserContext.getUserId();
        if (currentUserId != null && currentUserId.equals(userId) && (status != ACCOUNT_STATUS_ENABLED || !"ADMIN".equals(roleCode))) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Cannot disable or demote the current administrator");
        }

        transactionTemplate.executeWithoutResult(txStatus -> {
            if (!loginName.equals(current.loginName()) && authRepository.existsAccountForOtherUser(loginName, userId)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Login name already registered");
            }
            if (!mobile.equals(current.mobile()) && authRepository.existsUserByMobileForOtherUser(mobile, userId)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Mobile number already registered");
            }
            if (!email.equalsIgnoreCase(current.email()) && authRepository.existsUserByEmailForOtherUser(email, userId)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Email already registered");
            }

            boolean updated = authRepository.updateUserProfile(userId, nickname, mobile, email, status, roleCode);
            if (!updated) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update user profile failed");
            }
            if (!loginName.equals(current.loginName()) && !authRepository.updatePrimaryAccountLoginName(userId, loginName)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update login name failed");
            }
            authRepository.updateAccountsMeta(userId, status, roleCode, nickname);
            invalidateUserSessions(userId);
        });

        return requireAdminUser(userId);
    }

    /**
     * 在管理员控制台重置指定用户密码。
     */
    public boolean resetAdminUserPassword(Long userId, AdminUserPasswordResetRequest request) {
        requireAdmin();
        requireAdminUser(userId);
        transactionTemplate.executeWithoutResult(txStatus -> {
            if (authRepository.updateAccountsPassword(userId, passwordEncoder.encode(request.password())) <= 0) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reset password failed");
            }
            invalidateUserSessions(userId);
        });
        return true;
    }

    /**
     * 软删除指定用户，并使其活动会话失效。
     */
    public boolean deleteAdminUser(Long userId) {
        requireAdmin();
        requireAdminUser(userId);
        Long currentUserId = UserContext.getUserId();
        if (currentUserId != null && currentUserId.equals(userId)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Cannot delete the current administrator");
        }

        transactionTemplate.executeWithoutResult(txStatus -> {
            invalidateUserSessions(userId);
            authRepository.markAccountsDeletedByUserId(userId);
            authRepository.deleteUserAddresses(userId);
            if (authRepository.deleteUserProfile(userId) != 1) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Delete user failed");
            }
        });
        return true;
    }

    private JwtTokenService.ParsedToken parseBearerAccessToken(String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        JwtTokenService.ParsedToken parsedToken = jwtTokenService.parseToken(token);
        if (!"ACCESS".equals(parsedToken.tokenType())) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Access token required");
        }
        return parsedToken;
    }

    private void ensureSessionValid(AuthRepository.AuthSessionRecord session, JwtTokenService.ParsedToken parsedToken, boolean accessToken) {
        if (session.status() == SESSION_STATUS_LOGOUT || session.status() == SESSION_STATUS_INVALID) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Session invalid");
        }
        if (session.expireTime() != null && session.expireTime().isBefore(OffsetDateTime.now(DEFAULT_OFFSET))) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Session expired");
        }
        String expectedJti = accessToken ? session.accessJti() : session.refreshJti();
        if (!parsedToken.jti().equals(expectedJti)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Token has been rotated or revoked");
        }
    }

    private void ensureUserEnabled(Long userId) {
        if (!authRepository.existsEnabledUser(userId)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "User disabled");
        }
    }

    private AuthRepository.AuthSessionRecord requireSession(String sessionNo) {
        AuthRepository.AuthSessionRecord cached = getCachedSession(sessionNo);
        if (cached != null) {
            return cached;
        }
        AuthRepository.AuthSessionRecord session = authRepository.findSessionBySessionNo(sessionNo);
        if (session == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Session not found");
        }
        cacheSession(session);
        return session;
    }

    private TokenInfoDTO toTokenInfo(JwtTokenService.IssuedTokens tokens, String sessionNo, Long userId, String nickname, String userRole) {
        return new TokenInfoDTO(
            tokens.accessToken(),
            tokens.refreshToken(),
            userId,
            nickname,
            userRole,
            sessionNo,
            tokens.accessExpireTime(),
            tokens.refreshExpireTime()
        );
    }

    private String resolveNickname(AuthRepository.AuthAccountRecord account) {
        return account.remark() == null || account.remark().isBlank() ? "Mall User" : account.remark();
    }

    private String normalizeRole(String roleCode) {
        return roleCode == null || roleCode.isBlank() ? "USER" : roleCode.trim().toUpperCase();
    }

    private String normalizeRoleCode(String roleCode, boolean required) {
        String normalized = normalizeRole(roleCode);
        if (required && !("USER".equals(normalized) || "ADMIN".equals(normalized))) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported user role");
        }
        if (!required && !("USER".equals(normalized) || "ADMIN".equals(normalized))) {
            return null;
        }
        return normalized;
    }

    private Integer normalizeUserStatus(Integer status, boolean defaultEnabled) {
        if (status == null) {
            return defaultEnabled ? ACCOUNT_STATUS_ENABLED : null;
        }
        if (status == 0 || status == ACCOUNT_STATUS_ENABLED) {
            return status;
        }
        throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported user status");
    }

    private String normalizeLoginName(String loginName) {
        return loginName == null ? "" : loginName.trim();
    }

    private String normalizeNickname(String nickname) {
        return nickname == null ? "" : nickname.trim();
    }

    private String normalizeMobile(String mobile) {
        return mobile == null ? "" : mobile.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private int normalizeDeviceType(Integer deviceType) {
        return deviceType == null ? 1 : deviceType;
    }

    private String normalizeDeviceId(String deviceId) {
        return deviceId == null ? "" : deviceId;
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Authorization bearer token required");
        }
        return authorizationHeader.substring(7).trim();
    }

    private AdminUserDetailDTO requireAdminUser(Long userId) {
        AdminUserDetailDTO user = authRepository.findAdminUser(userId);
        if (user == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "User not found");
        }
        return user;
    }

    private void requireAdmin() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(CommonResultCode.UNAUTHORIZED);
        }
        if (!UserContext.isAdmin()) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Administrator access required");
        }
    }

    private void invalidateUserSessions(Long userId) {
        List<AuthRepository.AuthSessionRecord> sessions = authRepository.findSessionsByUserId(userId);
        authRepository.updateSessionsStatusByUserId(userId, SESSION_STATUS_INVALID);
        sessions.forEach(session -> evictSession(session.sessionNo()));
    }

    private int clamp(Integer value, int defaultValue, int maxValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value < 1) {
            return 1;
        }
        return Math.min(value, maxValue);
    }

    private AuthRepository.AuthSessionRecord getCachedSession(String sessionNo) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(sessionCacheKey(sessionNo));
            return payload == null ? null : objectMapper.readValue(payload, AuthRepository.AuthSessionRecord.class);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheSession(AuthRepository.AuthSessionRecord session) {
        try {
            Duration ttl = session.expireTime() == null
                ? Duration.ofHours(1)
                : Duration.between(OffsetDateTime.now(DEFAULT_OFFSET), session.expireTime());
            if (ttl.isNegative() || ttl.isZero()) {
                ttl = Duration.ofMinutes(1);
            }
            stringRedisTemplate.opsForValue().set(sessionCacheKey(session.sessionNo()), objectMapper.writeValueAsString(session), ttl);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void evictSession(String sessionNo) {
        try {
            stringRedisTemplate.delete(sessionCacheKey(sessionNo));
        } catch (DataAccessException ignored) {
        }
    }

    private String sessionCacheKey(String sessionNo) {
        return "mall:auth:session:" + sessionNo;
    }

    private Long generateUserId() {
        for (int attempt = 0; attempt < 8; attempt++) {
            long candidate = System.currentTimeMillis() * 1000L + ThreadLocalRandom.current().nextInt(100, 1000);
            if (!authRepository.existsUserId(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Unable to allocate user id");
    }
}

