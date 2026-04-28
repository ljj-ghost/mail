package com.mall.auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

/**
 * 管理员用户看板使用的汇总统计信息。
 */
public record AdminUserSummaryDTO (
    Integer totalUsers,
    Integer adminUsers,
    Integer memberUsers,
    Integer activeUsers,
    Integer totalAddresses
) {
}
