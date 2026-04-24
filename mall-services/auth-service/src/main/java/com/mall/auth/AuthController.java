package com.mall.auth;

import com.mall.common.core.CommonResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/api/v1/auth/login/password")
    public CommonResponse<TokenInfoDTO> login(@Valid @RequestBody LoginByPasswordRequest request, HttpServletRequest servletRequest) {
        return CommonResponse.success(authService.loginByPassword(request, clientIp(servletRequest), userAgent(servletRequest)));
    }

    @PostMapping("/api/v1/auth/register")
    public CommonResponse<TokenInfoDTO> register(@Valid @RequestBody RegisterByPasswordRequest request, HttpServletRequest servletRequest) {
        return CommonResponse.success(authService.registerByPassword(request, clientIp(servletRequest), userAgent(servletRequest)));
    }

    @PostMapping("/api/v1/auth/token/refresh")
    public CommonResponse<TokenInfoDTO> refresh(@Valid @RequestBody TokenRefreshRequest request, HttpServletRequest servletRequest) {
        return CommonResponse.success(authService.refreshToken(request, clientIp(servletRequest), userAgent(servletRequest)));
    }

    @PutMapping("/api/v1/auth/password")
    public CommonResponse<Boolean> resetCurrentUserPassword(
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
        @Valid @RequestBody CurrentUserPasswordResetRequest request
    ) {
        return CommonResponse.success(authService.resetCurrentUserPassword(authorizationHeader, request));
    }

    @PostMapping("/api/v1/auth/logout")
    public CommonResponse<Boolean> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return CommonResponse.success(authService.logout(authorizationHeader));
    }

    @GetMapping("/api/v1/auth/sessions")
    public CommonResponse<List<UserSessionDTO>> sessions(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return CommonResponse.success(authService.sessions(authorizationHeader));
    }

    @DeleteMapping("/api/v1/auth/sessions/{sessionNo}")
    public CommonResponse<Boolean> kickout(
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
        @PathVariable("sessionNo") String sessionNo
    ) {
        return CommonResponse.success(authService.kickout(authorizationHeader, sessionNo));
    }

    @GetMapping("/internal/v1/auth/users/{userId}/status")
    public CommonResponse<UserAuthStatusDTO> userStatus(@PathVariable("userId") Long userId) {
        return CommonResponse.success(authService.userStatus(userId));
    }

    @GetMapping("/api/v1/admin/users/summary")
    public CommonResponse<AdminUserSummaryDTO> adminSummary() {
        return CommonResponse.success(authService.adminSummary());
    }

    @GetMapping("/api/v1/admin/users")
    public CommonResponse<List<AdminUserListItemDTO>> adminUsers(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "status", required = false) Integer status,
        @RequestParam(name = "role", required = false) String role,
        @RequestParam(name = "limit", defaultValue = "20") Integer limit
    ) {
        return CommonResponse.success(authService.adminUsers(keyword, status, role, limit));
    }

    @GetMapping("/api/v1/admin/users/{userId}")
    public CommonResponse<AdminUserDetailDTO> adminUser(@PathVariable("userId") Long userId) {
        return CommonResponse.success(authService.adminUser(userId));
    }

    @PostMapping("/api/v1/admin/users")
    public CommonResponse<AdminUserDetailDTO> createAdminUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return CommonResponse.success(authService.createAdminUser(request));
    }

    @PutMapping("/api/v1/admin/users/{userId}")
    public CommonResponse<AdminUserDetailDTO> updateAdminUser(
        @PathVariable("userId") Long userId,
        @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        return CommonResponse.success(authService.updateAdminUser(userId, request));
    }

    @PostMapping("/api/v1/admin/users/{userId}/password")
    public CommonResponse<Boolean> resetAdminUserPassword(
        @PathVariable("userId") Long userId,
        @Valid @RequestBody AdminUserPasswordResetRequest request
    ) {
        return CommonResponse.success(authService.resetAdminUserPassword(userId, request));
    }

    @DeleteMapping("/api/v1/admin/users/{userId}")
    public CommonResponse<Boolean> deleteAdminUser(@PathVariable("userId") Long userId) {
        return CommonResponse.success(authService.deleteAdminUser(userId));
    }

    @PostMapping("/internal/v1/auth/tokens/parse")
    public CommonResponse<TokenParseResponse> parseToken(@Valid @RequestBody TokenParseRequest request) {
        return CommonResponse.success(authService.parseToken(request.token()));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "" : request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent == null ? "" : userAgent;
    }
}
