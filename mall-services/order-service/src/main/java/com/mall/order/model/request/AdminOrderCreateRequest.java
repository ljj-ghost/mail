package com.mall.order.model.request;

import com.mall.api.order.request.OrderSubmitSkuItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 管理员代用户创建订单时使用的请求参数。
 */
public record AdminOrderCreateRequest (
    @NotNull Long userId,
    String buyerRemark,
    @NotEmpty List<@Valid OrderSubmitSkuItem> items
) {
}
