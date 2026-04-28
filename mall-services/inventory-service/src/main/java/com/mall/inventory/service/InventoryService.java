package com.mall.inventory.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.inventory.dto.InventoryCheckItemResult;
import com.mall.api.inventory.request.InventoryCheckRequest;
import com.mall.api.inventory.response.InventoryCheckResponse;
import com.mall.api.inventory.request.InventoryDeductRequest;
import com.mall.api.inventory.request.InventoryItemRequest;
import com.mall.api.inventory.request.InventoryReleaseRequest;
import com.mall.api.inventory.request.InventoryReserveRequest;
import com.mall.api.inventory.response.InventoryReserveResponse;
import com.mall.api.inventory.dto.InventoryStockDTO;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import com.mall.inventory.model.dto.InventoryLowStockDTO;
import com.mall.inventory.model.dto.InventoryReservationDTO;
import com.mall.inventory.model.request.InventoryStockAdjustRequest;
import com.mall.inventory.model.response.InventoryExpiredReleaseResponse;
import com.mall.inventory.repository.InventoryRepository;


import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
/**
 * 执行库存校验、预占、扣减、释放以及管理员库存更新逻辑。
 */
public class InventoryService {

    private static final Duration STOCK_CACHE_TTL = Duration.ofMinutes(5);
    private static final String STOCK_CACHE_KEY_PREFIX = "mall:inventory:stock:";
    private static final int RESERVED = 1;
    private static final int RELEASED = 2;
    private static final int DEDUCTED = 3;

    private final InventoryRepository inventoryRepository;
    private final TransactionTemplate transactionTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public InventoryService(
        InventoryRepository inventoryRepository,
        PlatformTransactionManager transactionManager,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.inventoryRepository = inventoryRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 返回指定 SKU 的最新库存快照。
     */
    public InventoryStockDTO getStock(Long skuId) {
        InventoryStockDTO cached = getCachedStock(skuId);
        if (cached != null) {
            return cached;
        }

        InventoryRepository.StockSnapshot snapshot = inventoryRepository.findStock(skuId);
        InventoryStockDTO dto = snapshot == null
            ? new InventoryStockDTO(skuId, 0, 0, 0)
            : new InventoryStockDTO(snapshot.skuId(), snapshot.availableQty(), snapshot.lockedQty(), snapshot.saleableQty());
        cacheStock(dto);
        return dto;
    }

    /**
     * 校验请求数量当前是否可售。
     */
    public InventoryCheckResponse check(InventoryCheckRequest request) {
        Map<Long, InventoryRepository.StockSnapshot> stockMap = inventoryRepository.findStocks(
            request.items().stream().map(InventoryItemRequest::skuId).toList()
        );
        List<InventoryCheckItemResult> items = request.items().stream().map(item -> {
            InventoryRepository.StockSnapshot snapshot = stockMap.get(item.skuId());
            int saleableQty = snapshot == null ? 0 : snapshot.saleableQty();
            boolean enough = saleableQty >= item.quantity();
            return new InventoryCheckItemResult(
                item.skuId(),
                item.quantity(),
                saleableQty,
                enough,
                enough ? "OK" : "INSUFFICIENT_STOCK"
            );
        }).toList();
        return new InventoryCheckResponse(items.stream().allMatch(InventoryCheckItemResult::enough), items);
    }

    /**
     * 列出可售库存低于或等于预警阈值的 SKU。
     */
    public List<InventoryLowStockDTO> lowStock(Integer threshold) {
        return inventoryRepository.findLowStock(threshold).stream()
            .map(snapshot -> new InventoryLowStockDTO(
                snapshot.skuId(),
                snapshot.availableQty(),
                snapshot.lockedQty(),
                snapshot.saleableQty()
            ))
            .toList();
    }

    /**
     * 在支付确认前为订单临时锁定库存。
     */
    public InventoryReserveResponse reserve(InventoryReserveRequest request) {
        InventoryRepository.ReservationSnapshot existing = inventoryRepository.findReservation(request.orderNo());
        if (existing != null) {
            return switch (existing.status()) {
                case RESERVED, DEDUCTED -> new InventoryReserveResponse(existing.reserveNo(), request.orderNo(), true, "already reserved");
                case RELEASED -> new InventoryReserveResponse(existing.reserveNo(), request.orderNo(), false, "reservation already released");
                default -> new InventoryReserveResponse(existing.reserveNo(), request.orderNo(), false, "unknown reservation status");
            };
        }

        InventoryCheckResponse checkResponse = check(new InventoryCheckRequest(request.items()));
        if (!checkResponse.passed()) {
            return new InventoryReserveResponse("", request.orderNo(), false, "insufficient stock");
        }

        String reserveNo = "RSV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        ReserveResult result = transactionTemplate.execute(status -> {
            InventoryRepository.ReservationSnapshot current = inventoryRepository.findReservation(request.orderNo());
            if (current != null) {
                return new ReserveResult(current.reserveNo(), current.status() == RESERVED || current.status() == DEDUCTED, "already reserved");
            }

            for (InventoryItemRequest item : request.items()) {
                if (!inventoryRepository.tryReserveStock(item.skuId(), item.quantity())) {
                    status.setRollbackOnly();
                    return new ReserveResult("", false, "insufficient stock");
                }
            }

            inventoryRepository.insertReservation(reserveNo, request.orderNo(), RESERVED, request.expireTime());
            inventoryRepository.insertReservationItems(reserveNo, request.orderNo(), request.items());
            return new ReserveResult(reserveNo, true, "reserved");
        });

        if (result == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Inventory reserve transaction failed");
        }
        if (result.success()) {
            evictStockCache(request.items());
        }
        return new InventoryReserveResponse(result.reserveNo(), request.orderNo(), result.success(), result.message());
    }

    /**
     * 释放库存预占，使锁定库存回到可售池。
     */
    public boolean release(InventoryReleaseRequest request) {
        InventoryRepository.ReservationSnapshot reservation = inventoryRepository.findReservation(request.orderNo());
        if (reservation == null || reservation.status() == RELEASED) {
            return true;
        }
        if (reservation.status() == DEDUCTED) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation already deducted");
        }

        Boolean released = transactionTemplate.execute(status -> {
            InventoryRepository.ReservationSnapshot current = inventoryRepository.findReservation(request.orderNo());
            if (current == null || current.status() == RELEASED) {
                return true;
            }
            if (current.status() == DEDUCTED) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation already deducted");
            }
            current.items().forEach(item -> inventoryRepository.releaseStock(item.skuId(), item.quantity()));
            inventoryRepository.updateReservationStatus(request.orderNo(), RELEASED);
            return true;
        });

        if (Boolean.TRUE.equals(released)) {
            evictStockCache(reservation.items());
            return true;
        }
        return false;
    }

    /**
     * 支付成功后正式完成库存扣减。
     */
    public boolean deduct(InventoryDeductRequest request) {
        InventoryRepository.ReservationSnapshot reservation = inventoryRepository.findReservation(request.orderNo());
        if (reservation == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation not found");
        }
        if (reservation.status() == DEDUCTED) {
            return true;
        }
        if (reservation.status() == RELEASED) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation already released");
        }

        Boolean deducted = transactionTemplate.execute(status -> {
            InventoryRepository.ReservationSnapshot current = inventoryRepository.findReservation(request.orderNo());
            if (current == null) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation not found");
            }
            if (current.status() == DEDUCTED) {
                return true;
            }
            if (current.status() == RELEASED) {
                throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation already released");
            }

            for (InventoryItemRequest item : current.items()) {
                if (!inventoryRepository.deductStock(item.skuId(), item.quantity())) {
                    status.setRollbackOnly();
                    throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Inventory deduct failed");
                }
            }
            inventoryRepository.updateReservationStatus(request.orderNo(), DEDUCTED);
            return true;
        });

        if (Boolean.TRUE.equals(deducted)) {
            evictStockCache(reservation.items());
            return true;
        }
        return false;
    }

    /**
     * 查询当前订单关联的库存预占状态。
     */
    public InventoryReservationDTO reservation(String orderNo) {
        InventoryRepository.ReservationSnapshot reservation = inventoryRepository.findReservation(orderNo);
        if (reservation == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Reservation not found");
        }
        return new InventoryReservationDTO(
            reservation.reserveNo(),
            reservation.orderNo(),
            reservation.status(),
            statusText(reservation.status()),
            reservation.expireTime(),
            reservation.items()
        );
    }

    /**
     * 在记录管理员备注的同时调整可用库存。
     */
    public InventoryStockDTO replenish(InventoryStockAdjustRequest request) {
        transactionTemplate.executeWithoutResult(status -> inventoryRepository.replenishStock(request.skuId(), request.quantity()));
        deleteStockCache(request.skuId());
        return getStock(request.skuId());
    }

    /**
     * 在管理员控制台直接覆盖指定 SKU 的可用库存数量。
     */
    public InventoryStockDTO updateStock(Long skuId, Integer availableQty) {
        transactionTemplate.executeWithoutResult(status -> inventoryRepository.upsertAbsoluteStock(skuId, availableQty));
        deleteStockCache(skuId);
        return getStock(skuId);
    }

    /**
     * 批量释放已经过期的库存预占。
     */
    public InventoryExpiredReleaseResponse releaseExpired(int limit) {
        List<String> orderNos = inventoryRepository.findExpiredReservationOrderNos(RESERVED, limit);
        List<String> releasedOrderNos = new ArrayList<>();
        for (String orderNo : orderNos) {
            if (release(new InventoryReleaseRequest(orderNo, "EXPIRED_RELEASE"))) {
                releasedOrderNos.add(orderNo);
            }
        }
        return new InventoryExpiredReleaseResponse(releasedOrderNos.size(), releasedOrderNos);
    }

    private InventoryStockDTO getCachedStock(Long skuId) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(stockCacheKey(skuId));
            return payload == null ? null : objectMapper.readValue(payload, InventoryStockDTO.class);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheStock(InventoryStockDTO dto) {
        try {
            stringRedisTemplate.opsForValue().set(stockCacheKey(dto.skuId()), objectMapper.writeValueAsString(dto), STOCK_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void evictStockCache(List<InventoryItemRequest> items) {
        Set<String> keys = new LinkedHashSet<>();
        for (InventoryItemRequest item : items) {
            keys.add(stockCacheKey(item.skuId()));
        }
        try {
            stringRedisTemplate.delete(keys);
        } catch (DataAccessException ignored) {
        }
    }

    private void deleteStockCache(Long skuId) {
        try {
            stringRedisTemplate.delete(stockCacheKey(skuId));
        } catch (DataAccessException ignored) {
        }
    }

    private String stockCacheKey(Long skuId) {
        return STOCK_CACHE_KEY_PREFIX + skuId;
    }

    private String statusText(Integer status) {
        return switch (status) {
            case RESERVED -> "RESERVED";
            case RELEASED -> "RELEASED";
            case DEDUCTED -> "DEDUCTED";
            default -> "UNKNOWN";
        };
    }

    private record ReserveResult(String reserveNo, boolean success, String message) {
    }
}

