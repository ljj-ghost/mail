package com.mall.api.user;

/**
 * 管理员用户看板展示的汇总统计。
 */
public record AdminUserSummaryDTO(
    Integer totalUsers,
    Integer adminUsers,
    Integer memberUsers,
    Integer activeUsers,
    Integer totalAddresses
) {
}

