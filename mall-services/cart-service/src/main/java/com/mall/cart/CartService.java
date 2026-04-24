package com.mall.cart;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.product.SkuBaseDTO;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class CartService {

    private static final Duration CART_CACHE_TTL = Duration.ofMinutes(10);
    private static final TypeReference<List<CartItemDTO>> CART_LIST_TYPE = new TypeReference<>() {
    };

    private final CartRepository cartRepository;
    private final ProductClient productClient;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public CartService(
        CartRepository cartRepository,
        ProductClient productClient,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.cartRepository = cartRepository;
        this.productClient = productClient;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public List<CartItemDTO> items() {
        Long userId = UserContext.getRequiredUserId();
        List<CartItemDTO> cached = getCachedItems(userId);
        if (cached != null) {
            return cached;
        }

        List<CartItemDTO> items = cartRepository.findItemsByUserId(userId);
        cacheItems(userId, items);
        return items;
    }

    public boolean addItem(AddCartItemRequest request) {
        Long userId = UserContext.getRequiredUserId();
        SkuBaseDTO sku = productClient.getSku(request.skuId()).data();
        if (sku == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU not found");
        }
        if (sku.status() == null || sku.status() != 1) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU is not available");
        }

        cartRepository.upsertItem(userId, sku.skuId(), sku.skuName(), request.quantity(), sku.salePrice());
        evictCartCache(userId);
        return true;
    }

    public boolean deleteItem(Long skuId) {
        Long userId = UserContext.getRequiredUserId();
        cartRepository.deleteItem(userId, skuId);
        evictCartCache(userId);
        return true;
    }

    public boolean clearItems(ClearCartItemsRequest request) {
        cartRepository.deleteItems(request.userId(), request.skuIds());
        evictCartCache(request.userId());
        return true;
    }

    private List<CartItemDTO> getCachedItems(Long userId) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(cacheKey(userId));
            return payload == null ? null : objectMapper.readValue(payload, CART_LIST_TYPE);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheItems(Long userId, List<CartItemDTO> items) {
        try {
            stringRedisTemplate.opsForValue().set(cacheKey(userId), objectMapper.writeValueAsString(items), CART_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void evictCartCache(Long userId) {
        try {
            stringRedisTemplate.delete(cacheKey(userId));
        } catch (DataAccessException ignored) {
        }
    }

    private String cacheKey(Long userId) {
        return "mall:cart:items:" + userId;
    }
}
