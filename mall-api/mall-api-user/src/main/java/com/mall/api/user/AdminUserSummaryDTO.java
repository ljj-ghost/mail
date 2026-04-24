package com.mall.api.user;

public record AdminUserSummaryDTO(
    Integer totalUsers,
    Integer adminUsers,
    Integer memberUsers,
    Integer activeUsers,
    Integer totalAddresses
) {
}
