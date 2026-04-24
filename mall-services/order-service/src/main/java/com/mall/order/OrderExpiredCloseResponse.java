package com.mall.order;

import java.util.List;

public record OrderExpiredCloseResponse(Integer closeAfterMinutes, Integer closedCount, List<String> closedOrderNos) {
}
