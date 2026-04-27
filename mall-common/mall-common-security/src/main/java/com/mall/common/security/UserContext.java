package com.mall.common.security;

import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;

/**
 * 使用线程上下文保存当前请求用户，供下游业务代码读取。
 */
public final class UserContext {

    private static final ThreadLocal<UserPrincipal> USER_HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void setUserId(Long userId) {
        UserPrincipal current = USER_HOLDER.get();
        USER_HOLDER.set(new UserPrincipal(userId, current == null ? UserRole.USER.name() : current.userRole()));
    }

    public static void setUserRole(String userRole) {
        UserPrincipal current = USER_HOLDER.get();
        USER_HOLDER.set(new UserPrincipal(current == null ? null : current.userId(), UserRole.normalize(userRole)));
    }

    public static void setUser(Long userId, String userRole) {
        USER_HOLDER.set(new UserPrincipal(userId, UserRole.normalize(userRole)));
    }

    public static Long getUserId() {
        UserPrincipal current = USER_HOLDER.get();
        return current == null ? null : current.userId();
    }

    public static Long getRequiredUserId() {
        Long userId = getUserId();
        return userId == null ? 1001001L : userId;
    }

    public static String getUserRole() {
        UserPrincipal current = USER_HOLDER.get();
        return current == null ? null : current.userRole();
    }

    public static String getRequiredUserRole() {
        String userRole = getUserRole();
        return userRole == null ? UserRole.USER.name() : userRole;
    }

    public static boolean isAdmin() {
        return UserRole.isAdmin(getUserRole());
    }

    public static void requireAdmin() {
        if (!isAdmin()) {
            throw new BusinessException(CommonResultCode.FORBIDDEN);
        }
    }

    public static void clear() {
        USER_HOLDER.remove();
    }

    private record UserPrincipal(Long userId, String userRole) {
    }
}

