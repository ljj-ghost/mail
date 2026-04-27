package com.mall.api.user;

/**
 * 描述受管用户账号的管理员列表项。
 */
public record AdminUserListItemDTO(
    Long userId,
    String nickname,
    String mobile,
    String email,
    Integer status,
    String userRole,
    Integer addressCount
) {
}

