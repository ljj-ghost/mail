package com.mall.common.security;

/**
 * 定义后端服务识别的用户角色枚举。
 */
public enum UserRole {
    USER,
    ADMIN;

    public static String normalize(String roleCode) {
        if (roleCode == null || roleCode.isBlank()) {
            return USER.name();
        }
        for (UserRole role : values()) {
            if (role.name().equalsIgnoreCase(roleCode.trim())) {
                return role.name();
            }
        }
        return USER.name();
    }

    public static boolean isAdmin(String roleCode) {
        return ADMIN.name().equals(normalize(roleCode));
    }
}

