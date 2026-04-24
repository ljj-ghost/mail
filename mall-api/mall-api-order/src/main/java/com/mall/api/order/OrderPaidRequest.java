package com.mall.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OrderPaidRequest(String paymentNo, Integer payChannel, BigDecimal payAmount, OffsetDateTime payTime) {
}
