package com.mall.api.order;

import java.math.BigDecimal;

/**
 * 服务间共享的最小订单投影。
 */
public record OrderBaseDTO(String orderNo, Long userId, Integer orderStatus, Integer payStatus, BigDecimal payAmount) {
}

