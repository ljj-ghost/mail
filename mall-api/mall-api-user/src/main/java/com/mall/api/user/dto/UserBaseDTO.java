package com.mall.api.user.dto;

/**
 * 服务间共享的最小用户资料。
 */
public record UserBaseDTO(Long userId, String nickname, String mobile, String email, Integer status, String userRole) {
}

