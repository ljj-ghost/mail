package com.mall.product;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.product.AdminProductSummaryDTO;
import com.mall.api.product.ProductCategoryDTO;
import com.mall.api.product.ProductSkuCardDTO;
import com.mall.api.product.ProductSkuDetailDTO;
import com.mall.api.product.SkuBaseDTO;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
/**
 * 实现前台商品浏览、管理员商品维护以及商品缓存逻辑。
 */
public class ProductService {

    private static final Duration CATEGORY_CACHE_TTL = Duration.ofMinutes(30);
    private static final Duration LIST_CACHE_TTL = Duration.ofMinutes(10);
    private static final Duration DETAIL_CACHE_TTL = Duration.ofMinutes(15);
    private static final Duration SUMMARY_CACHE_TTL = Duration.ofMinutes(5);
    private static final String ADMIN_SUMMARY_CACHE_KEY = "mall:product:admin:summary:v2";
    private static final int DEFAULT_LIST_LIMIT = 12;
    private static final int MAX_LIST_LIMIT = 50;
    private static final TypeReference<List<ProductCategoryDTO>> CATEGORY_LIST_TYPE = new TypeReference<>() {
    };
    private static final TypeReference<List<ProductSkuCardDTO>> SKU_CARD_LIST_TYPE = new TypeReference<>() {
    };

    private final ProductRepository productRepository;
    private final ProductCacheEvictor productCacheEvictor;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public ProductService(
        ProductRepository productRepository,
        ProductCacheEvictor productCacheEvictor,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.productCacheEvictor = productCacheEvictor;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 返回前台筛选使用的商品分类树。
     */
    public List<ProductCategoryDTO> categories() {
        String cacheKey = "mall:product:categories";
        List<ProductCategoryDTO> cached = readListCache(cacheKey, CATEGORY_LIST_TYPE);
        if (cached != null) {
            return cached;
        }

        List<ProductCategoryDTO> categories = productRepository.findCategories();
        writeCache(cacheKey, categories, CATEGORY_CACHE_TTL);
        return categories;
    }

    /**
     * 返回前台推荐区域使用的精选 SKU 列表。
     */
    public List<ProductSkuCardDTO> recommend(Integer limit) {
        int resolvedLimit = clamp(limit, 6, MAX_LIST_LIMIT);
        String cacheKey = "mall:product:recommend:" + resolvedLimit;
        List<ProductSkuCardDTO> cached = readListCache(cacheKey, SKU_CARD_LIST_TYPE);
        if (cached != null) {
            return cached;
        }

        List<ProductSkuCardDTO> products = productRepository.findRecommend(resolvedLimit);
        writeCache(cacheKey, products, LIST_CACHE_TTL);
        return products;
    }

    /**
     * 返回按分类或关键字过滤后的前台 SKU 列表。
     */
    public List<ProductSkuCardDTO> catalog(Long categoryId, String keyword, Integer limit) {
        int resolvedLimit = clamp(limit, DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
        String normalizedKeyword = normalizeKeyword(keyword);
        String cacheKey = "mall:product:catalog:" + (categoryId == null ? "all" : categoryId) + ":" + normalizedKeyword + ":" + resolvedLimit;
        List<ProductSkuCardDTO> cached = readListCache(cacheKey, SKU_CARD_LIST_TYPE);
        if (cached != null) {
            return cached;
        }

        List<ProductSkuCardDTO> products = productRepository.findCatalog(categoryId, normalizedKeyword, resolvedLimit);
        writeCache(cacheKey, products, LIST_CACHE_TTL);
        return products;
    }

    /**
     * 返回带管理筛选条件的管理员商品列表。
     */
    public List<ProductSkuCardDTO> adminCatalog(String keyword, Integer status, Integer limit) {
        requireAdmin();
        return productRepository.findAdminCatalog(
            normalizeKeyword(keyword),
            normalizeAdminStatus(status),
            clamp(limit, 20, MAX_LIST_LIMIT)
        );
    }

    /**
     * 加载单个 SKU 的前台详情视图。
     */
    public ProductSkuDetailDTO skuDetail(Long skuId) {
        String cacheKey = detailCacheKey(skuId);
        ProductSkuDetailDTO cached = readObjectCache(cacheKey, ProductSkuDetailDTO.class);
        if (cached != null) {
            return cached;
        }

        ProductSkuDetailDTO detail = productRepository.findSkuDetail(skuId);
        if (detail == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU not found");
        }
        writeCache(cacheKey, detail, DETAIL_CACHE_TTL);
        return detail;
    }

    /**
     * 汇总管理员看板所需的商品统计信息。
     */
    public AdminProductSummaryDTO adminSummary() {
        AdminProductSummaryDTO cached = readObjectCache(ADMIN_SUMMARY_CACHE_KEY, AdminProductSummaryDTO.class);
        if (cached != null) {
            return cached;
        }

        AdminProductSummaryDTO summary = productRepository.summarizeCatalog();
        writeCache(ADMIN_SUMMARY_CACHE_KEY, summary, SUMMARY_CACHE_TTL);
        return summary;
    }

    /**
     * 加载单个 SKU 的管理员详情视图。
     */
    public AdminProductDetailDTO adminSkuDetail(Long skuId) {
        requireAdmin();
        AdminProductDetailDTO detail = productRepository.findAdminSkuDetail(skuId);
        if (detail == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU not found");
        }
        return detail;
    }

    /**
     * 列出某个 SPU 下全部可售 SKU。
     */
    public List<ProductSkuCardDTO> spuSkus(Long spuId) {
        String cacheKey = "mall:product:spu:" + spuId + ":skus";
        List<ProductSkuCardDTO> cached = readListCache(cacheKey, SKU_CARD_LIST_TYPE);
        if (cached != null) {
            return cached;
        }

        List<ProductSkuCardDTO> skuCards = productRepository.findSpuSkus(spuId);
        writeCache(cacheKey, skuCards, DETAIL_CACHE_TTL);
        return skuCards;
    }

    /**
     * 返回供其他服务消费的最小 SKU 快照。
     */
    public SkuBaseDTO internalSku(Long skuId) {
        SkuBaseDTO sku = productRepository.findSkuBase(skuId);
        if (sku == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "SKU not found");
        }
        return sku;
    }

    /**
     * 为下游服务批量加载最小 SKU 快照。
     */
    public List<SkuBaseDTO> batchSkus(List<Long> skuIds) {
        if (skuIds == null || skuIds.isEmpty()) {
            return List.of();
        }
        return productRepository.findSkuBases(skuIds);
    }

    /**
     * 通过管理员控制台流程创建新的商品 SKU。
     */
    public AdminProductDetailDTO createAdminProduct(AdminProductSaveRequest request) {
        requireAdmin();
        validateCategory(request.categoryId());
        Long spuId = generateSpuId();
        Long skuId = generateSkuId();
        int status = normalizeAdminStatus(request.status()) == null ? 1 : normalizeAdminStatus(request.status());
        productRepository.insertSpu(
            spuId,
            request.categoryId(),
            request.spuName().trim(),
            request.brandName().trim(),
            normalizeText(request.sellingPoint()),
            normalizeDescription(request.description())
        );
        productRepository.insertSku(
            skuId,
            spuId,
            request.categoryId(),
            request.skuName().trim(),
            request.marketPrice(),
            request.salePrice(),
            normalizeText(request.mainImageUrl()),
            normalizeText(request.sellingPoint()),
            normalizeDescription(request.description()),
            status,
            normalizeRecommendSort(request.recommendSort())
        );
        evictProductCaches();
        return adminSkuDetail(skuId);
    }

    /**
     * 更新已有商品 SKU，并清理相关缓存。
     */
    public AdminProductDetailDTO updateAdminProduct(Long skuId, AdminProductSaveRequest request) {
        requireAdmin();
        AdminProductDetailDTO current = adminSkuDetail(skuId);
        validateCategory(request.categoryId());
        if (!productRepository.updateSpuMetadata(
            current.spuId(),
            request.categoryId(),
            request.spuName().trim(),
            request.brandName().trim(),
            normalizeText(request.sellingPoint()),
            normalizeDescription(request.description())
        )) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update SPU failed");
        }
        if (!productRepository.updateSku(
            skuId,
            request.categoryId(),
            request.skuName().trim(),
            request.marketPrice(),
            request.salePrice(),
            normalizeText(request.mainImageUrl()),
            normalizeText(request.sellingPoint()),
            normalizeDescription(request.description()),
            normalizeAdminStatus(request.status()) == null ? current.status() : normalizeAdminStatus(request.status()),
            normalizeRecommendSort(request.recommendSort())
        )) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update SKU failed");
        }
        if ((normalizeAdminStatus(request.status()) == null ? current.status() : normalizeAdminStatus(request.status())) == 1) {
            productRepository.updateSpuStatus(current.spuId(), 1);
        }
        evictProductCaches();
        return adminSkuDetail(skuId);
    }

    /**
     * 在管理员侧对商品 SKU 执行软删除。
     */
    public boolean deleteAdminProduct(Long skuId) {
        requireAdmin();
        AdminProductDetailDTO current = adminSkuDetail(skuId);
        if (!productRepository.markSkuDeleted(skuId)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Delete SKU failed");
        }
        if (productRepository.countVisibleSkusBySpuId(current.spuId()) == 0) {
            productRepository.updateSpuStatus(current.spuId(), 0);
        }
        evictProductCaches();
        return true;
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null ? "" : keyword.trim();
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

    private Integer normalizeAdminStatus(Integer status) {
        if (status == null) {
            return null;
        }
        if (status == 0 || status == 1) {
            return status;
        }
        throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Unsupported product status");
    }

    private int normalizeRecommendSort(Integer recommendSort) {
        if (recommendSort == null || recommendSort < 0) {
            return 0;
        }
        return recommendSort;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeDescription(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateCategory(Long categoryId) {
        if (!productRepository.existsCategory(categoryId)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Category not found");
        }
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

    private void evictProductCaches() {
        productCacheEvictor.evictAll();
    }

    private Long generateSpuId() {
        for (int attempt = 0; attempt < 8; attempt++) {
            long candidate = System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(100, 1000);
            if (!productRepository.existsSpuId(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Unable to allocate SPU id");
    }

    private Long generateSkuId() {
        for (int attempt = 0; attempt < 8; attempt++) {
            long candidate = System.currentTimeMillis() * 10 + ThreadLocalRandom.current().nextInt(100, 1000);
            if (!productRepository.existsSkuId(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Unable to allocate SKU id");
    }

    private <T> T readObjectCache(String key, Class<T> clazz) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(key);
            return payload == null ? null : objectMapper.readValue(payload, clazz);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private <T> List<T> readListCache(String key, TypeReference<List<T>> typeReference) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(key);
            return payload == null ? null : objectMapper.readValue(payload, typeReference);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void writeCache(String key, Object value, Duration ttl) {
        try {
            stringRedisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value), ttl);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private String detailCacheKey(Long skuId) {
        return "mall:product:sku:" + skuId;
    }
}

