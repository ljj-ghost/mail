package com.mall.api.user;

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
