package com.mall.order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.inventory.InventoryCheckRequest;
import com.mall.api.inventory.InventoryDeductRequest;
import com.mall.api.inventory.InventoryItemRequest;
import com.mall.api.inventory.InventoryReleaseRequest;
import com.mall.api.inventory.InventoryReserveRequest;
import com.mall.api.inventory.InventoryReserveResponse;
import com.mall.api.order.OrderBaseDTO;
import com.mall.api.order.OrderDetailDTO;
import com.mall.api.order.OrderItemDTO;
import com.mall.api.order.OrderPaidRequest;
import com.mall.api.order.OrderSubmitRequest;
import com.mall.api.order.OrderSubmitResponse;
import com.mall.api.order.OrderSubmitSkuItem;
import com.mall.api.order.OrderSummaryDTO;
import com.mall.api.product.SkuBaseDTO;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
/**
 * 协调下单、订单生命周期变更、幂等处理以及详情缓存逻辑。
 */
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private static final int ORDER_PENDING_PAYMENT = 10;
    private static final int ORDER_PENDING_DELIVERY = 20;
    private static final int ORDER_SHIPPED = 30;
    private static final int ORDER_COMPLETED = 40;
    private static final int ORDER_CANCELLED = 50;
    private static final int PAY_PENDING = 0;
    private static final int PAY_SUCCESS = 2;
    private static final int PAY_CLOSED = 4;
    private static final String IDEMPOTENCY_IN_PROGRESS = "IN_PROGRESS";
    private static final Duration IDEMPOTENCY_LOCK_TTL = Duration.ofMinutes(10);
    private static final Duration IDEMPOTENCY_RESULT_TTL = Duration.ofDays(1);
    private static final Duration DETAIL_CACHE_TTL = Duration.ofMinutes(10);
    private static final int DEFAULT_ORDER_LIST_LIMIT = 10;
    private static final int MAX_ORDER_LIST_LIMIT = 50;
    private static final int DEFAULT_EXPIRE_MINUTES = 30;
    private static final int MAX_EXPIRE_CLOSE_LIMIT = 200;

    private final InventoryClient inventoryClient;
    private final ProductClient productClient;
    private final CartClient cartClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;
    private final TransactionTemplate transactionTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public OrderService(
        InventoryClient inventoryClient,
        ProductClient productClient,
        CartClient cartClient,
        PaymentClient paymentClient,
        OrderRepository orderRepository,
        PlatformTransactionManager transactionManager,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.inventoryClient = inventoryClient;
        this.productClient = productClient;
        this.cartClient = cartClient;
        this.paymentClient = paymentClient;
        this.orderRepository = orderRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 创建订单时同时处理幂等保护、库存预占和购物车清理。
     */
    public OrderSubmitResponse submit(OrderSubmitRequest request) {
        Long userId = requireCurrentUserId();
        String idempotencyKey = request.idempotencyKey();
        String idempotencyRedisKey = idempotencyCacheKey(userId, idempotencyKey);

        String cachedOrderNo = getRedisValue(idempotencyRedisKey);
        if (cachedOrderNo != null && !IDEMPOTENCY_IN_PROGRESS.equals(cachedOrderNo)) {
            return buildSubmitResponse(cachedOrderNo);
        }

        Boolean lockAcquired = trySetIfAbsent(idempotencyRedisKey, IDEMPOTENCY_IN_PROGRESS, IDEMPOTENCY_LOCK_TTL);
        if (Boolean.FALSE.equals(lockAcquired)) {
            String persistedOrderNo = orderRepository.findOrderNoByIdempotency(userId, idempotencyKey);
            if (persistedOrderNo != null) {
                cacheIdempotencyResult(idempotencyRedisKey, persistedOrderNo);
                return buildSubmitResponse(persistedOrderNo);
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Duplicate order submit request");
        }

        String persistedOrderNo = orderRepository.findOrderNoByIdempotency(userId, idempotencyKey);
        if (persistedOrderNo != null) {
            cacheIdempotencyResult(idempotencyRedisKey, persistedOrderNo);
            return buildSubmitResponse(persistedOrderNo);
        }

        List<OrderItemDTO> items = buildOrderItems(request.items());
        List<InventoryItemRequest> inventoryItems = request.items().stream()
            .map(item -> new InventoryItemRequest(item.skuId(), item.quantity()))
            .toList();
        boolean passed = inventoryClient.check(new InventoryCheckRequest(inventoryItems)).data().passed();
        if (!passed) {
            deleteRedisKey(idempotencyRedisKey);
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Inventory check failed");
        }

        String orderNo = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        InventoryReserveResponse reserveResponse = inventoryClient.reserve(
            new InventoryReserveRequest(orderNo, OffsetDateTime.now().plusMinutes(30), inventoryItems)
        ).data();
        if (!reserveResponse.success()) {
            deleteRedisKey(idempotencyRedisKey);
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), reserveResponse.message());
        }

        BigDecimal payAmount = items.stream().map(OrderItemDTO::itemAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        OrderRepository.OrderRecord orderRecord = new OrderRepository.OrderRecord(
            orderNo,
            userId,
            ORDER_PENDING_PAYMENT,
            PAY_PENDING,
            false,
            request.buyerRemark() == null ? "" : request.buyerRemark(),
            reserveResponse.reserveNo(),
            null,
            null,
            payAmount,
            null,
            OffsetDateTime.now(),
            "",
            "",
            null,
            null
        );

        try {
            OrderSubmitResponse response = transactionTemplate.execute(status -> {
                orderRepository.insertOrder(orderRecord, items, idempotencyKey);
                return new OrderSubmitResponse(orderNo, ORDER_PENDING_PAYMENT, PAY_PENDING);
            });
            if (response == null) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Create order failed");
            }
            cacheIdempotencyResult(idempotencyRedisKey, orderNo);
            cacheDetail(loadDetail(orderNo));
            clearSubmittedCart(userId, request.items());
            return response;
        } catch (RuntimeException ex) {
            try {
                inventoryClient.release(new InventoryReleaseRequest(orderNo, "CREATE_ORDER_FAILED"));
            } catch (RuntimeException ignored) {
            }

            String existingOrderNo = orderRepository.findOrderNoByIdempotency(userId, idempotencyKey);
            if (existingOrderNo != null) {
                cacheIdempotencyResult(idempotencyRedisKey, existingOrderNo);
                return buildSubmitResponse(existingOrderNo);
            }

            deleteRedisKey(idempotencyRedisKey);
            throw ex;
        }
    }

    /**
     * 按可选状态条件列出当前用户订单。
     */
    public List<OrderSummaryDTO> list(Integer status, Integer limit) {
        return orderRepository.findOrdersByUserId(
            requireCurrentUserId(),
            normalizeOrderStatusFilter(status),
            clamp(limit, DEFAULT_ORDER_LIST_LIMIT, MAX_ORDER_LIST_LIMIT)
        );
    }

    /**
     * 返回管理员管理页面使用的订单筛选列表。
     */
    public List<AdminOrderSummaryDTO> adminList(
        String keyword,
        Integer orderStatus,
        Integer payStatus,
        Long userId,
        Integer limit
    ) {
        requireAdmin();
        return orderRepository.findAdminOrders(
            keyword,
            normalizeAdminOrderStatus(orderStatus),
            normalizePayStatus(payStatus),
            userId,
            clamp(limit, 20, MAX_ORDER_LIST_LIMIT)
        );
    }

    /**
     * 加载当前用户订单的缓存详情或实时详情。
     */
    public OrderDetailDTO detail(String orderNo) {
        Long userId = requireCurrentUserId();
        OrderDetailDTO cached = getCachedDetail(orderNo);
        if (cached != null) {
            ensureCurrentUserOwns(userId, cached.userId());
            return cached;
        }
        OrderDetailDTO detail = loadDetail(orderNo);
        ensureCurrentUserOwns(userId, detail.userId());
        cacheDetail(detail);
        return detail;
    }

    /**
     * 返回任意订单的管理员详情视图。
     */
    public OrderDetailDTO adminDetail(String orderNo) {
        requireAdmin();
        OrderDetailDTO detail = loadDetail(orderNo);
        cacheDetail(detail);
        return detail;
    }

    /**
     * 返回服务间支付协调用的最小订单基础投影。
     */
    public OrderBaseDTO base(String orderNo) {
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        return new OrderBaseDTO(order.orderNo(), order.userId(), order.orderStatus(), order.payStatus(), order.payAmount());
    }

    /**
     * 取消当前用户订单，并释放对应预占库存。
     */
    public boolean cancel(String orderNo, String reason) {
        OrderRepository.OrderRecord order = requireOwnedOrder(orderNo);
        return cancelPendingOrder(order, reason);
    }

    /**
     * 将已取消订单从当前用户可见列表中软删除。
     */
    public boolean delete(String orderNo) {
        Long userId = requireCurrentUserId();
        OrderRepository.OrderRecord order = requireOwnedOrder(orderNo);
        if (Boolean.TRUE.equals(order.deleted())) {
            return true;
        }

        if (order.orderStatus() == ORDER_PENDING_PAYMENT && order.payStatus() == PAY_PENDING) {
            cancelPendingOrder(order, "USER_DELETE");
        }

        Boolean deleted = transactionTemplate.execute(status -> orderRepository.markDeleted(orderNo, userId));
        if (!Boolean.TRUE.equals(deleted)) {
            OrderRepository.OrderRecord latest = requireOrder(orderNo);
            if (Boolean.TRUE.equals(latest.deleted())) {
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Delete order failed");
        }

        deleteRedisKey(detailCacheKey(orderNo));
        return true;
    }

    /**
     * 将已发货订单标记为已收货并完成。
     */
    public boolean confirmReceipt(String orderNo) {
        OrderRepository.OrderRecord order = requireOwnedOrder(orderNo);
        if (order.orderStatus() == ORDER_COMPLETED) {
            return true;
        }
        if (order.orderStatus() != ORDER_SHIPPED || order.payStatus() != PAY_SUCCESS) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Only shipped orders can be confirmed");
        }

        Boolean updated = transactionTemplate.execute(status -> orderRepository.markCompleted(orderNo, OffsetDateTime.now()));
        if (!Boolean.TRUE.equals(updated)) {
            OrderRepository.OrderRecord latest = requireOrder(orderNo);
            if (latest.orderStatus() == ORDER_COMPLETED) {
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Confirm receipt failed");
        }

        deleteRedisKey(detailCacheKey(orderNo));
        return true;
    }

    /**
     * 直接通过管理员控制台创建订单。
     */
    public OrderDetailDTO adminCreate(AdminOrderCreateRequest request) {
        requireAdmin();
        List<OrderItemDTO> items = buildOrderItems(request.items());
        List<InventoryItemRequest> inventoryItems = request.items().stream()
            .map(item -> new InventoryItemRequest(item.skuId(), item.quantity()))
            .toList();
        boolean passed = inventoryClient.check(new InventoryCheckRequest(inventoryItems)).data().passed();
        if (!passed) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Inventory check failed");
        }

        String orderNo = "ORD-ADM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        InventoryReserveResponse reserveResponse = inventoryClient.reserve(
            new InventoryReserveRequest(orderNo, OffsetDateTime.now().plusMinutes(30), inventoryItems)
        ).data();
        if (!reserveResponse.success()) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), reserveResponse.message());
        }

        BigDecimal payAmount = items.stream().map(OrderItemDTO::itemAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        OrderRepository.OrderRecord orderRecord = new OrderRepository.OrderRecord(
            orderNo,
            request.userId(),
            ORDER_PENDING_PAYMENT,
            PAY_PENDING,
            false,
            request.buyerRemark() == null ? "" : request.buyerRemark(),
            reserveResponse.reserveNo(),
            null,
            null,
            payAmount,
            null,
            OffsetDateTime.now(),
            "",
            "",
            null,
            null
        );

        try {
            transactionTemplate.executeWithoutResult(
                status -> orderRepository.insertOrder(orderRecord, items, "admin-create-" + orderNo)
            );
            OrderDetailDTO detail = loadDetail(orderNo);
            cacheDetail(detail);
            return detail;
        } catch (RuntimeException ex) {
            try {
                inventoryClient.release(new InventoryReleaseRequest(orderNo, "ADMIN_CREATE_FAILED"));
            } catch (RuntimeException ignored) {
            }
            throw ex;
        }
    }

    /**
     * 通过管理员控制台流程更新订单可变字段。
     */
    public OrderDetailDTO adminUpdate(String orderNo, AdminOrderUpdateRequest request) {
        requireAdmin();
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        boolean shouldReload = false;
        String nextRemark = request.buyerRemark() == null ? order.buyerRemark() : request.buyerRemark().trim();
        if (!nextRemark.equals(order.buyerRemark())) {
            if (!orderRepository.updateBuyerRemark(orderNo, nextRemark)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update order remark failed");
            }
            shouldReload = true;
        }

        Integer targetOrderStatus = request.orderStatus() == null ? order.orderStatus() : request.orderStatus();
        Integer targetPayStatus = request.payStatus() == null ? order.payStatus() : request.payStatus();

        if (targetOrderStatus == ORDER_CANCELLED && order.orderStatus() != ORDER_CANCELLED) {
            cancelPendingOrder(order, "ADMIN_CANCEL");
            shouldReload = true;
        } else if ((targetOrderStatus == ORDER_PENDING_DELIVERY || targetPayStatus == PAY_SUCCESS)
            && !(order.orderStatus() == ORDER_PENDING_DELIVERY && order.payStatus() == PAY_SUCCESS)) {
            if (order.orderStatus() != ORDER_PENDING_PAYMENT || order.payStatus() != PAY_PENDING) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Only pending payment orders can be marked as paid");
            }
            markPaid(
                orderNo,
                new OrderPaidRequest(
                    "ADMINPAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
                    request.payChannel() == null ? 1 : request.payChannel(),
                    order.payAmount(),
                    OffsetDateTime.now()
                )
            );
            shouldReload = true;
        } else if (targetOrderStatus == ORDER_SHIPPED) {
            if (order.payStatus() != PAY_SUCCESS || (order.orderStatus() != ORDER_PENDING_DELIVERY && order.orderStatus() != ORDER_SHIPPED)) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Only paid orders waiting for shipment can be shipped");
            }
            String deliveryCompany = normalizeText(request.deliveryCompany());
            String deliveryNo = normalizeText(request.deliveryNo());
            if (deliveryCompany.isEmpty() || deliveryNo.isEmpty()) {
                throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Delivery company and tracking number are required");
            }
            if (!orderRepository.markShipped(orderNo, deliveryCompany, deliveryNo, OffsetDateTime.now())) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Mark order shipped failed");
            }
            shouldReload = true;
        } else if (targetOrderStatus == ORDER_COMPLETED) {
            if (order.payStatus() != PAY_SUCCESS || order.orderStatus() != ORDER_SHIPPED) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Only shipped orders can be completed");
            }
            if (!orderRepository.markCompleted(orderNo, OffsetDateTime.now())) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Complete order failed");
            }
            shouldReload = true;
        } else if (!targetOrderStatus.equals(order.orderStatus()) || !targetPayStatus.equals(order.payStatus())) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported order update");
        }

        if (shouldReload) {
            deleteRedisKey(detailCacheKey(orderNo));
        }
        OrderDetailDTO detail = loadDetail(orderNo);
        cacheDetail(detail);
        return detail;
    }

    /**
     * 管理员侧在需要清理时删除订单。
     */
    public boolean adminDelete(String orderNo) {
        requireAdmin();
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        if (Boolean.TRUE.equals(order.deleted())) {
            return true;
        }
        if (order.orderStatus() == ORDER_PENDING_PAYMENT && order.payStatus() == PAY_PENDING) {
            cancelPendingOrder(order, "ADMIN_DELETE");
        }
        Boolean deleted = transactionTemplate.execute(status -> orderRepository.markDeletedByAdmin(orderNo));
        if (!Boolean.TRUE.equals(deleted)) {
            OrderRepository.OrderRecord latest = requireOrder(orderNo);
            if (Boolean.TRUE.equals(latest.deleted())) {
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Delete order failed");
        }
        deleteRedisKey(detailCacheKey(orderNo));
        return true;
    }

    /**
     * 批量关闭超时未支付订单，并释放对应预占库存。
     */
    public OrderExpiredCloseResponse closeExpired(Integer minutes, Integer limit) {
        int closeMinutes = clamp(minutes, DEFAULT_EXPIRE_MINUTES, 24 * 60);
        int closeLimit = clamp(limit, 100, MAX_EXPIRE_CLOSE_LIMIT);
        List<String> candidates = orderRepository.findExpiredPendingPaymentOrderNos(
            OffsetDateTime.now().minusMinutes(closeMinutes),
            closeLimit
        );
        List<String> closedOrderNos = new ArrayList<>();
        for (String orderNo : candidates) {
            try {
                if (cancelPendingOrder(requireOrder(orderNo), "PAY_TIMEOUT")) {
                    closedOrderNos.add(orderNo);
                }
            } catch (RuntimeException ex) {
                log.warn("Failed to close expired order {}", orderNo, ex);
            }
        }
        return new OrderExpiredCloseResponse(closeMinutes, closedOrderNos.size(), closedOrderNos);
    }

    private boolean cancelPendingOrder(OrderRepository.OrderRecord order, String reason) {
        if (order.orderStatus() != ORDER_PENDING_PAYMENT) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Only pending payment order can be cancelled");
        }

        inventoryClient.release(new InventoryReleaseRequest(order.orderNo(), reason));
        Boolean updated = transactionTemplate.execute(status -> orderRepository.markCancelled(order.orderNo()));
        if (!Boolean.TRUE.equals(updated)) {
            OrderRepository.OrderRecord latest = requireOrder(order.orderNo());
            if (latest.orderStatus() == ORDER_CANCELLED) {
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Cancel order failed");
        }

        deleteRedisKey(detailCacheKey(order.orderNo()));
        closeLinkedPayment(order.orderNo(), reason);
        return true;
    }

    /**
     * 应用支付成功回调，并将订单推进到已支付状态。
     */
    public boolean markPaid(String orderNo, OrderPaidRequest request) {
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        if (order.payStatus() == PAY_SUCCESS) {
            return true;
        }
        if (order.orderStatus() == ORDER_CANCELLED) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Order already cancelled");
        }

        inventoryClient.deduct(new InventoryDeductRequest(orderNo));
        Boolean updated = transactionTemplate.execute(
            status -> orderRepository.markPaid(orderNo, request.paymentNo(), request.payChannel(), request.payTime())
        );
        if (!Boolean.TRUE.equals(updated)) {
            OrderRepository.OrderRecord latest = requireOrder(orderNo);
            if (latest.payStatus() == PAY_SUCCESS) {
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Mark order paid failed");
        }

        deleteRedisKey(detailCacheKey(orderNo));
        return true;
    }

    private OrderSubmitResponse buildSubmitResponse(String orderNo) {
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        return new OrderSubmitResponse(order.orderNo(), order.orderStatus(), order.payStatus());
    }

    private OrderDetailDTO loadDetail(String orderNo) {
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        return new OrderDetailDTO(
            order.orderNo(),
            order.userId(),
            order.orderStatus(),
            order.payStatus(),
            order.payAmount(),
            order.buyerRemark(),
            order.createTime(),
            order.deliveryCompany(),
            order.deliveryNo(),
            order.deliveryTime(),
            order.finishTime(),
            orderRepository.findOrderItems(orderNo)
        );
    }

    private OrderRepository.OrderRecord requireOrder(String orderNo) {
        OrderRepository.OrderRecord order = orderRepository.findOrder(orderNo);
        if (order == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Order not found");
        }
        return order;
    }

    private OrderRepository.OrderRecord requireOwnedOrder(String orderNo) {
        OrderRepository.OrderRecord order = requireOrder(orderNo);
        ensureCurrentUserOwns(requireCurrentUserId(), order.userId());
        return order;
    }

    private List<OrderItemDTO> buildOrderItems(List<OrderSubmitSkuItem> requestItems) {
        List<Long> skuIds = requestItems.stream()
            .map(OrderSubmitSkuItem::skuId)
            .distinct()
            .toList();
        List<SkuBaseDTO> skuBases = productClient.batchSku(skuIds).data();
        Map<Long, SkuBaseDTO> skuMap = new LinkedHashMap<>();
        for (SkuBaseDTO skuBase : skuBases) {
            skuMap.put(skuBase.skuId(), skuBase);
        }

        return requestItems.stream().map(item -> {
            SkuBaseDTO sku = skuMap.get(item.skuId());
            if (sku == null) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU not found: " + item.skuId());
            }
            if (sku.status() == null || sku.status() != 1) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU is unavailable: " + item.skuId());
            }

            BigDecimal salePrice = sku.salePrice() == null ? BigDecimal.ZERO : sku.salePrice();
            return new OrderItemDTO(
                item.skuId(),
                sku.skuName(),
                item.quantity(),
                salePrice,
                salePrice.multiply(BigDecimal.valueOf(item.quantity()))
            );
        }).toList();
    }

    private void clearSubmittedCart(Long userId, List<OrderSubmitSkuItem> items) {
        try {
            cartClient.clearItems(new ClearCartItemsRequest(
                userId,
                items.stream().map(OrderSubmitSkuItem::skuId).distinct().toList()
            ));
        } catch (RuntimeException ex) {
            log.warn("Failed to clear cart items after order submit for user {}", userId, ex);
        }
    }

    private void closeLinkedPayment(String orderNo, String reason) {
        try {
            paymentClient.closeByOrder(orderNo, reason);
        } catch (RuntimeException ex) {
            log.warn("Failed to close linked payment for order {}", orderNo, ex);
        }
    }

    private OrderDetailDTO getCachedDetail(String orderNo) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(detailCacheKey(orderNo));
            return payload == null ? null : objectMapper.readValue(payload, OrderDetailDTO.class);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheDetail(OrderDetailDTO detail) {
        try {
            stringRedisTemplate.opsForValue().set(detailCacheKey(detail.orderNo()), objectMapper.writeValueAsString(detail), DETAIL_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private Boolean trySetIfAbsent(String key, String value, Duration ttl) {
        try {
            return stringRedisTemplate.opsForValue().setIfAbsent(key, value, ttl);
        } catch (DataAccessException ex) {
            return true;
        }
    }

    private String getRedisValue(String key) {
        try {
            return stringRedisTemplate.opsForValue().get(key);
        } catch (DataAccessException ex) {
            return null;
        }
    }

    private void cacheIdempotencyResult(String key, String orderNo) {
        try {
            stringRedisTemplate.opsForValue().set(key, orderNo, IDEMPOTENCY_RESULT_TTL);
        } catch (DataAccessException ignored) {
        }
    }

    private void deleteRedisKey(String key) {
        try {
            stringRedisTemplate.delete(key);
        } catch (DataAccessException ignored) {
        }
    }

    private String idempotencyCacheKey(Long userId, String idempotencyKey) {
        return "mall:order:submit:idempotency:" + userId + ":" + idempotencyKey;
    }

    private String detailCacheKey(String orderNo) {
        return "mall:order:detail:" + orderNo;
    }

    private Long requireCurrentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(CommonResultCode.UNAUTHORIZED);
        }
        return userId;
    }

    private void requireAdmin() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(CommonResultCode.UNAUTHORIZED);
        }
        if (!UserContext.isAdmin()) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Administrator access required");
        }
    }

    private void ensureCurrentUserOwns(Long currentUserId, Long ownerUserId) {
        if (!currentUserId.equals(ownerUserId)) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Order does not belong to current user");
        }
    }

    private Integer normalizeOrderStatusFilter(Integer status) {
        if (status == null) {
            return null;
        }
        if (status == ORDER_PENDING_PAYMENT || status == ORDER_PENDING_DELIVERY || status == ORDER_SHIPPED
            || status == ORDER_COMPLETED || status == ORDER_CANCELLED) {
            return status;
        }
        throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported order status filter");
    }

    private Integer normalizeAdminOrderStatus(Integer status) {
        return normalizeOrderStatusFilter(status);
    }

    private Integer normalizePayStatus(Integer payStatus) {
        if (payStatus == null) {
            return null;
        }
        if (payStatus == PAY_PENDING || payStatus == PAY_SUCCESS || payStatus == PAY_CLOSED) {
            return payStatus;
        }
        throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported pay status filter");
    }

    private int clamp(Integer value, int defaultValue, int maxValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value < 1) {
            return 1;
        }
        return Math.min(value, maxValue);
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }
}

