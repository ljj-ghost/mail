package com.mall.payment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.order.OrderBaseDTO;
import com.mall.api.order.OrderPaidRequest;
import com.mall.api.payment.PaymentCreateRequest;
import com.mall.api.payment.PaymentCreateResponse;
import com.mall.api.payment.PaymentDetailDTO;
import com.mall.api.payment.PaymentMockSuccessRequest;
import com.mall.api.payment.PaymentSummaryDTO;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
/**
 * 处理支付创建、状态流转以及与订单回调协同的逻辑。
 */
public class PaymentService {

    private static final int PAY_PENDING = 0;
    private static final int PAY_SUCCESS = 2;
    private static final int PAY_CLOSED = 4;
    private static final Duration DETAIL_CACHE_TTL = Duration.ofMinutes(10);
    private static final int DEFAULT_PAYMENT_LIST_LIMIT = 10;
    private static final int MAX_PAYMENT_LIST_LIMIT = 50;

    private final OrderClient orderClient;
    private final PaymentRepository paymentRepository;
    private final TransactionTemplate transactionTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public PaymentService(
        OrderClient orderClient,
        PaymentRepository paymentRepository,
        PlatformTransactionManager transactionManager,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.orderClient = orderClient;
        this.paymentRepository = paymentRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 为已有订单创建支付单，并返回收银所需信息。
     */
    public PaymentCreateResponse create(PaymentCreateRequest request) {
        Long currentUserId = requireCurrentUserId();
        OrderBaseDTO order = orderClient.getOrder(request.orderNo()).data();
        if (order == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Order not found");
        }
        ensureCurrentUserOwnsOrder(currentUserId, order);
        if (order.payStatus() == PAY_SUCCESS) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Order already paid");
        }
        if (order.orderStatus() == 50 || order.payStatus() == PAY_CLOSED) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Order already closed");
        }

        PaymentRepository.PaymentRecord existing = paymentRepository.findByOrderNo(order.orderNo());
        if (existing != null) {
            ensureCurrentUserOwnsPayment(currentUserId, existing.userId());
        }
        if (existing != null && existing.payStatus() != PAY_CLOSED) {
            cacheDetail(toDetail(existing));
            return toCreateResponse(existing);
        }
        if (existing != null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Payment already closed");
        }

        PaymentRepository.PaymentRecord newPayment = new PaymentRepository.PaymentRecord(
            "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12),
            order.orderNo(),
            order.userId(),
            request.payChannel(),
            PAY_PENDING,
            order.payAmount(),
            "",
            now(),
            null,
            null,
            ""
        );

        try {
            PaymentCreateResponse response = transactionTemplate.execute(status -> {
                paymentRepository.insert(newPayment);
                return toCreateResponse(newPayment);
            });
            if (response == null) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Create payment failed");
            }
            PaymentRepository.PaymentRecord persisted = paymentRepository.findByPaymentNo(newPayment.paymentNo());
            cacheDetail(toDetail(persisted == null ? newPayment : persisted));
            return response;
        } catch (RuntimeException ex) {
            PaymentRepository.PaymentRecord fallback = paymentRepository.findByOrderNo(order.orderNo());
            if (fallback != null && fallback.payStatus() != PAY_CLOSED) {
                cacheDetail(toDetail(fallback));
                return toCreateResponse(fallback);
            }
            throw ex;
        }
    }

    /**
     * 返回单个支付单的完整详情。
     */
    public PaymentDetailDTO detail(String paymentNo) {
        Long currentUserId = requireCurrentUserId();
        PaymentDetailDTO cached = getCachedDetail(paymentNo);
        if (cached != null) {
            ensureCurrentUserOwnsPayment(currentUserId, cached.userId());
            return cached;
        }
        PaymentRepository.PaymentRecord record = requireOwnedPayment(paymentNo);
        PaymentDetailDTO detail = toDetail(record);
        cacheDetail(detail);
        return detail;
    }

    /**
     * 按可选状态条件列出当前用户支付单。
     */
    public List<PaymentSummaryDTO> list(Integer status, Integer limit) {
        return paymentRepository.findByUserId(
            requireCurrentUserId(),
            normalizePayStatusFilter(status),
            clamp(limit, DEFAULT_PAYMENT_LIST_LIMIT, MAX_PAYMENT_LIST_LIMIT)
        );
    }

    /**
     * 模拟第三方支付成功回调，并同步订单状态。
     */
    public PaymentDetailDTO mockSuccess(String paymentNo, PaymentMockSuccessRequest request) {
        PaymentRepository.PaymentRecord payment = requireOwnedPayment(paymentNo);
        if (payment.payStatus() == PAY_SUCCESS) {
            PaymentDetailDTO detail = toDetail(payment);
            cacheDetail(detail);
            return detail;
        }
        if (payment.payStatus() == PAY_CLOSED) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Payment already closed");
        }

        String thirdTradeNo = request.thirdTradeNo() == null || request.thirdTradeNo().isBlank()
            ? "MOCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12)
            : request.thirdTradeNo();
        OffsetDateTime payTime = now();

        orderClient.markPaid(
            payment.orderNo(),
            new OrderPaidRequest(payment.paymentNo(), payment.payChannel(), payment.payAmount(), payTime)
        );

        Boolean updated = transactionTemplate.execute(status -> paymentRepository.markSuccess(paymentNo, thirdTradeNo, payTime));
        PaymentRepository.PaymentRecord latest = paymentRepository.findByPaymentNo(paymentNo);
        if (!Boolean.TRUE.equals(updated) && latest != null && latest.payStatus() != PAY_SUCCESS) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Payment success callback failed");
        }

        PaymentDetailDTO detail = toDetail(latest == null ? requirePayment(paymentNo) : latest);
        cacheDetail(detail);
        return detail;
    }

    /**
     * 当订单生命周期需要时，关闭该订单关联的支付单。
     */
    public boolean closeByOrder(String orderNo, String reason) {
        PaymentRepository.PaymentRecord payment = paymentRepository.findByOrderNo(orderNo);
        if (payment == null || payment.payStatus() == PAY_CLOSED) {
            return true;
        }
        if (payment.payStatus() == PAY_SUCCESS) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Paid payment cannot be closed");
        }

        Boolean updated = transactionTemplate.execute(
            status -> paymentRepository.markClosedByOrderNo(orderNo, normalizeCloseReason(reason), now())
        );
        if (!Boolean.TRUE.equals(updated)) {
            PaymentRepository.PaymentRecord latest = paymentRepository.findByOrderNo(orderNo);
            if (latest == null || latest.payStatus() == PAY_CLOSED) {
                deleteRedisKey(detailCacheKey(payment.paymentNo()));
                return true;
            }
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Close payment failed");
        }

        deleteRedisKey(detailCacheKey(payment.paymentNo()));
        return true;
    }

    private PaymentRepository.PaymentRecord requirePayment(String paymentNo) {
        PaymentRepository.PaymentRecord payment = paymentRepository.findByPaymentNo(paymentNo);
        if (payment == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Payment not found");
        }
        return payment;
    }

    private PaymentRepository.PaymentRecord requireOwnedPayment(String paymentNo) {
        PaymentRepository.PaymentRecord payment = requirePayment(paymentNo);
        ensureCurrentUserOwnsPayment(requireCurrentUserId(), payment.userId());
        return payment;
    }

    private PaymentCreateResponse toCreateResponse(PaymentRepository.PaymentRecord paymentRecord) {
        return new PaymentCreateResponse(
            paymentRecord.paymentNo(),
            paymentRecord.orderNo(),
            paymentRecord.payStatus(),
            paymentRecord.payAmount(),
            "http://localhost:18087/api/v1/payments/mock/success/" + paymentRecord.paymentNo()
        );
    }

    private PaymentDetailDTO toDetail(PaymentRepository.PaymentRecord paymentRecord) {
        return new PaymentDetailDTO(
            paymentRecord.paymentNo(),
            paymentRecord.orderNo(),
            paymentRecord.userId(),
            paymentRecord.payChannel(),
            paymentRecord.payStatus(),
            paymentRecord.payAmount(),
            paymentRecord.thirdTradeNo(),
            paymentRecord.createTime(),
            paymentRecord.payTime(),
            paymentRecord.closeTime(),
            paymentRecord.closeReason()
        );
    }

    private PaymentDetailDTO getCachedDetail(String paymentNo) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(detailCacheKey(paymentNo));
            return payload == null ? null : objectMapper.readValue(payload, PaymentDetailDTO.class);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheDetail(PaymentDetailDTO detail) {
        try {
            stringRedisTemplate.opsForValue().set(detailCacheKey(detail.paymentNo()), objectMapper.writeValueAsString(detail), DETAIL_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void deleteRedisKey(String key) {
        try {
            stringRedisTemplate.delete(key);
        } catch (DataAccessException ignored) {
        }
    }

    private String detailCacheKey(String paymentNo) {
        return "mall:payment:detail:" + paymentNo;
    }

    private Long requireCurrentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(CommonResultCode.UNAUTHORIZED);
        }
        return userId;
    }

    private void ensureCurrentUserOwnsOrder(Long currentUserId, OrderBaseDTO order) {
        if (!currentUserId.equals(order.userId())) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Order does not belong to current user");
        }
    }

    private void ensureCurrentUserOwnsPayment(Long currentUserId, Long ownerUserId) {
        if (ownerUserId == null || ownerUserId <= 0) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Payment owner is invalid");
        }
        if (!currentUserId.equals(ownerUserId)) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Payment does not belong to current user");
        }
    }

    private Integer normalizePayStatusFilter(Integer status) {
        if (status == null) {
            return null;
        }
        if (status == PAY_PENDING || status == PAY_SUCCESS || status == PAY_CLOSED) {
            return status;
        }
        throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported payment status filter");
    }

    private String normalizeCloseReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "ORDER_CANCELLED";
        }
        return reason.length() > 64 ? reason.substring(0, 64) : reason;
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

    private OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.ofHours(8));
    }
}

