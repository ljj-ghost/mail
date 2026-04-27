package com.mall.order;

import java.util.List;

/**
 * 返回批量关闭过期订单操作的结果。
 */
public record OrderExpiredCloseResponse(Integer closeAfterMinutes, Integer closedCount, List<String> closedOrderNos) {
}

