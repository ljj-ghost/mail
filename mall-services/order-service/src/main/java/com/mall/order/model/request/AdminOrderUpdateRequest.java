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
 * 管理员调整可变订单字段时使用的请求参数。
 */
public record AdminOrderUpdateRequest (
    String buyerRemark,
    Integer orderStatus,
    Integer payStatus,
    @Min(1) Integer payChannel,
    String deliveryCompany,
    String deliveryNo
) {
}
