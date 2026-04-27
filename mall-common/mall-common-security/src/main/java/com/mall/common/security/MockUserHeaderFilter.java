package com.mall.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
/**
 * 在本地开发绕过网关鉴权时注入模拟用户请求头。
 */
public class MockUserHeaderFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String USER_ROLE_HEADER = "X-User-Role";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            String userId = request.getHeader(USER_ID_HEADER);
            String userRole = request.getHeader(USER_ROLE_HEADER);
            if (userId != null && !userId.isBlank()) {
                UserContext.setUser(Long.parseLong(userId), userRole);
            } else if (userRole != null && !userRole.isBlank()) {
                UserContext.setUserRole(userRole);
            }
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }
}

