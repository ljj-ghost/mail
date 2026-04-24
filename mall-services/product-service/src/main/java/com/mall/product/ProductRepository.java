package com.mall.product;

import com.mall.api.product.AdminProductSummaryDTO;
import com.mall.api.product.ProductCategoryDTO;
import com.mall.api.product.ProductSkuCardDTO;
import com.mall.api.product.ProductSkuDetailDTO;
import com.mall.api.product.SkuBaseDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Repository
public class ProductRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ProductCategoryDTO> findCategories() {
        return jdbcTemplate.query(
            """
                SELECT category_id, parent_id, category_name, sort
                FROM pms_category
                WHERE status = 1
                ORDER BY sort ASC, category_id ASC
                """,
            (rs, rowNum) -> new ProductCategoryDTO(
                rs.getLong("category_id"),
                rs.getLong("parent_id"),
                rs.getString("category_name"),
                rs.getInt("sort")
            )
        );
    }

    public List<ProductSkuCardDTO> findRecommend(int limit) {
        return jdbcTemplate.query(
            baseCardSelect() + """
                WHERE s.status = 1
                  AND p.status = 1
                  AND c.status = 1
                ORDER BY s.recommend_sort ASC, s.sku_id ASC
                LIMIT ?
                """,
            (rs, rowNum) -> mapCard(rs),
            limit
        );
    }

    public List<ProductSkuCardDTO> findCatalog(Long categoryId, String keyword, int limit) {
        StringBuilder sql = new StringBuilder(baseCardSelect()).append("""
            WHERE s.status = 1
              AND p.status = 1
              AND c.status = 1
            """);
        List<Object> params = new ArrayList<>();
        if (categoryId != null) {
            sql.append(" AND s.category_id = ? ");
            params.add(categoryId);
        }
        if (keyword != null && !keyword.isBlank()) {
            sql.append(" AND (s.sku_name LIKE ? OR p.spu_name LIKE ? OR p.brand_name LIKE ? OR s.selling_point LIKE ?) ");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        sql.append(" ORDER BY s.recommend_sort ASC, s.sku_id ASC LIMIT ? ");
        params.add(limit);

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> mapCard(rs), params.toArray());
    }

    public ProductSkuDetailDTO findSkuDetail(Long skuId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT s.sku_id, s.spu_id, s.category_id, c.category_name, p.spu_name, s.sku_name, p.brand_name,
                           s.sale_price, s.market_price, s.status, s.main_image_url,
                           COALESCE(NULLIF(s.selling_point, ''), p.selling_point) AS selling_point,
                           COALESCE(NULLIF(s.description, ''), p.description) AS description
                    FROM pms_sku s
                    JOIN pms_spu p ON p.spu_id = s.spu_id
                    JOIN pms_category c ON c.category_id = s.category_id
                    WHERE s.sku_id = ?
                      AND s.status = 1
                      AND p.status = 1
                      AND c.status = 1
                    """,
                (rs, rowNum) -> new ProductSkuDetailDTO(
                    rs.getLong("sku_id"),
                    rs.getLong("spu_id"),
                    rs.getLong("category_id"),
                    rs.getString("category_name"),
                    rs.getString("spu_name"),
                    rs.getString("sku_name"),
                    rs.getString("brand_name"),
                    rs.getBigDecimal("sale_price"),
                    rs.getBigDecimal("market_price"),
                    rs.getInt("status"),
                    rs.getString("main_image_url"),
                    rs.getString("selling_point"),
                    rs.getString("description")
                ),
                skuId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public List<ProductSkuCardDTO> findSpuSkus(Long spuId) {
        return jdbcTemplate.query(
            baseCardSelect() + """
                WHERE s.spu_id = ?
                  AND s.status = 1
                  AND p.status = 1
                  AND c.status = 1
                ORDER BY s.recommend_sort ASC, s.sku_id ASC
                """,
            (rs, rowNum) -> mapCard(rs),
            spuId
        );
    }

    public List<ProductSkuCardDTO> findAdminCatalog(String keyword, Integer status, int limit) {
        StringBuilder sql = new StringBuilder(baseCardSelect()).append("""
            WHERE c.status = 1
              AND s.status >= 0
            """);
        List<Object> params = new ArrayList<>();
        if (keyword != null && !keyword.isBlank()) {
            sql.append(" AND (s.sku_name LIKE ? OR p.spu_name LIKE ? OR p.brand_name LIKE ? OR s.selling_point LIKE ?) ");
            String likeKeyword = "%" + keyword.trim() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (status != null) {
            sql.append(" AND s.status = ? ");
            params.add(status);
        }
        sql.append(" ORDER BY s.update_time DESC, s.sku_id DESC LIMIT ? ");
        params.add(limit);
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> mapCard(rs), params.toArray());
    }

    public AdminProductDetailDTO findAdminSkuDetail(Long skuId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT s.sku_id, s.spu_id, s.category_id, c.category_name, p.spu_name, s.sku_name, p.brand_name,
                           s.sale_price, s.market_price, s.status, s.main_image_url,
                           COALESCE(NULLIF(s.selling_point, ''), p.selling_point) AS selling_point,
                           COALESCE(NULLIF(s.description, ''), p.description) AS description,
                           s.recommend_sort
                    FROM pms_sku s
                    JOIN pms_spu p ON p.spu_id = s.spu_id
                    JOIN pms_category c ON c.category_id = s.category_id
                    WHERE s.sku_id = ?
                      AND s.status >= 0
                    LIMIT 1
                    """,
                (rs, rowNum) -> new AdminProductDetailDTO(
                    rs.getLong("sku_id"),
                    rs.getLong("spu_id"),
                    rs.getLong("category_id"),
                    rs.getString("category_name"),
                    rs.getString("spu_name"),
                    rs.getString("sku_name"),
                    rs.getString("brand_name"),
                    rs.getBigDecimal("sale_price"),
                    rs.getBigDecimal("market_price"),
                    rs.getInt("status"),
                    rs.getString("main_image_url"),
                    rs.getString("selling_point"),
                    rs.getString("description"),
                    rs.getInt("recommend_sort")
                ),
                skuId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public AdminProductSummaryDTO summarizeCatalog() {
        return jdbcTemplate.queryForObject(
            """
                SELECT COUNT(DISTINCT CASE WHEN c.status = 1 THEN c.category_id END) AS total_categories,
                       COUNT(DISTINCT CASE WHEN p.status = 1 THEN p.spu_id END) AS total_spus,
                       COUNT(CASE WHEN s.status >= 0 THEN 1 END) AS total_skus,
                       COUNT(CASE WHEN s.status = 1 AND p.status = 1 AND c.status = 1 THEN 1 END) AS active_skus,
                       COUNT(CASE WHEN s.status = 1 AND p.status = 1 AND c.status = 1 AND s.recommend_sort > 0 THEN 1 END) AS featured_skus,
                       COALESCE(MIN(CASE WHEN s.status = 1 AND p.status = 1 AND c.status = 1 THEN s.sale_price END), 0) AS price_floor,
                       COALESCE(MAX(CASE WHEN s.status = 1 AND p.status = 1 AND c.status = 1 THEN s.sale_price END), 0) AS price_ceiling
                FROM pms_sku s
                JOIN pms_spu p ON p.spu_id = s.spu_id
                JOIN pms_category c ON c.category_id = s.category_id
                """,
            (rs, rowNum) -> new AdminProductSummaryDTO(
                rs.getLong("total_categories"),
                rs.getLong("total_spus"),
                rs.getLong("total_skus"),
                rs.getLong("active_skus"),
                rs.getLong("featured_skus"),
                rs.getBigDecimal("price_floor"),
                rs.getBigDecimal("price_ceiling")
            )
        );
    }

    public SkuBaseDTO findSkuBase(Long skuId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT sku_id, spu_id, sku_name, sale_price, status
                    FROM pms_sku
                    WHERE sku_id = ?
                    """,
                (rs, rowNum) -> new SkuBaseDTO(
                    rs.getLong("sku_id"),
                    rs.getLong("spu_id"),
                    rs.getString("sku_name"),
                    rs.getBigDecimal("sale_price"),
                    rs.getInt("status")
                ),
                skuId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public List<SkuBaseDTO> findSkuBases(List<Long> skuIds) {
        if (skuIds == null || skuIds.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(", ", Collections.nCopies(skuIds.size(), "?"));
        List<SkuBaseDTO> skuBases = jdbcTemplate.query(
            """
                SELECT sku_id, spu_id, sku_name, sale_price, status
                FROM pms_sku
                WHERE sku_id IN (%s)
                """.formatted(placeholders),
            (rs, rowNum) -> new SkuBaseDTO(
                rs.getLong("sku_id"),
                rs.getLong("spu_id"),
                rs.getString("sku_name"),
                rs.getBigDecimal("sale_price"),
                rs.getInt("status")
            ),
            skuIds.toArray()
        );
        Map<Long, SkuBaseDTO> resultMap = new LinkedHashMap<>();
        for (SkuBaseDTO sku : skuBases) {
            resultMap.put(sku.skuId(), sku);
        }

        return skuIds.stream()
            .map(resultMap::get)
            .filter(Objects::nonNull)
            .toList();
    }

    public boolean existsCategory(Long categoryId) {
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM pms_category
                WHERE category_id = ?
                  AND status = 1
                """,
            Integer.class,
            categoryId
        );
        return count != null && count > 0;
    }

    public void insertSpu(
        Long spuId,
        Long categoryId,
        String spuName,
        String brandName,
        String sellingPoint,
        String description
    ) {
        jdbcTemplate.update(
            """
                INSERT INTO pms_spu (
                    spu_id, category_id, spu_name, brand_name, selling_point, description, status, create_time, update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, 1, NOW(3), NOW(3))
                """,
            spuId,
            categoryId,
            spuName,
            brandName,
            sellingPoint,
            description
        );
    }

    public void insertSku(
        Long skuId,
        Long spuId,
        Long categoryId,
        String skuName,
        java.math.BigDecimal marketPrice,
        java.math.BigDecimal salePrice,
        String mainImageUrl,
        String sellingPoint,
        String description,
        Integer status,
        Integer recommendSort
    ) {
        jdbcTemplate.update(
            """
                INSERT INTO pms_sku (
                    sku_id, spu_id, category_id, sku_name, market_price, sale_price,
                    main_image_url, selling_point, description, status, recommend_sort, create_time, update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
                """,
            skuId,
            spuId,
            categoryId,
            skuName,
            marketPrice,
            salePrice,
            mainImageUrl,
            sellingPoint,
            description,
            status,
            recommendSort
        );
    }

    public boolean updateSpuMetadata(
        Long spuId,
        Long categoryId,
        String spuName,
        String brandName,
        String sellingPoint,
        String description
    ) {
        return jdbcTemplate.update(
            """
                UPDATE pms_spu
                SET category_id = ?,
                    spu_name = ?,
                    brand_name = ?,
                    selling_point = ?,
                    description = ?,
                    update_time = NOW(3)
                WHERE spu_id = ?
                """,
            categoryId,
            spuName,
            brandName,
            sellingPoint,
            description,
            spuId
        ) == 1;
    }

    public boolean updateSpuStatus(Long spuId, Integer status) {
        return jdbcTemplate.update(
            """
                UPDATE pms_spu
                SET status = ?,
                    update_time = NOW(3)
                WHERE spu_id = ?
                """,
            status,
            spuId
        ) == 1;
    }

    public boolean updateSku(
        Long skuId,
        Long categoryId,
        String skuName,
        java.math.BigDecimal marketPrice,
        java.math.BigDecimal salePrice,
        String mainImageUrl,
        String sellingPoint,
        String description,
        Integer status,
        Integer recommendSort
    ) {
        return jdbcTemplate.update(
            """
                UPDATE pms_sku
                SET category_id = ?,
                    sku_name = ?,
                    market_price = ?,
                    sale_price = ?,
                    main_image_url = ?,
                    selling_point = ?,
                    description = ?,
                    status = ?,
                    recommend_sort = ?,
                    update_time = NOW(3)
                WHERE sku_id = ?
                  AND status >= 0
                """,
            categoryId,
            skuName,
            marketPrice,
            salePrice,
            mainImageUrl,
            sellingPoint,
            description,
            status,
            recommendSort,
            skuId
        ) == 1;
    }

    public boolean markSkuDeleted(Long skuId) {
        return jdbcTemplate.update(
            """
                UPDATE pms_sku
                SET status = -1,
                    recommend_sort = 0,
                    update_time = NOW(3)
                WHERE sku_id = ?
                  AND status >= 0
                """,
            skuId
        ) == 1;
    }

    public int countVisibleSkusBySpuId(Long spuId) {
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM pms_sku
                WHERE spu_id = ?
                  AND status >= 0
                """,
            Integer.class,
            spuId
        );
        return count == null ? 0 : count;
    }

    public boolean existsSkuId(Long skuId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM pms_sku WHERE sku_id = ?",
            Integer.class,
            skuId
        );
        return count != null && count > 0;
    }

    public boolean existsSpuId(Long spuId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM pms_spu WHERE spu_id = ?",
            Integer.class,
            spuId
        );
        return count != null && count > 0;
    }

    private String baseCardSelect() {
        return """
            SELECT s.sku_id, s.spu_id, s.category_id, c.category_name, p.spu_name, s.sku_name,
                   s.sale_price, s.market_price, s.status, s.main_image_url,
                   COALESCE(NULLIF(s.selling_point, ''), p.selling_point) AS selling_point
            FROM pms_sku s
            JOIN pms_spu p ON p.spu_id = s.spu_id
            JOIN pms_category c ON c.category_id = s.category_id
            """;
    }

    private ProductSkuCardDTO mapCard(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ProductSkuCardDTO(
            rs.getLong("sku_id"),
            rs.getLong("spu_id"),
            rs.getLong("category_id"),
            rs.getString("category_name"),
            rs.getString("spu_name"),
            rs.getString("sku_name"),
            rs.getBigDecimal("sale_price"),
            rs.getBigDecimal("market_price"),
            rs.getInt("status"),
            rs.getString("main_image_url"),
            rs.getString("selling_point")
        );
    }
}
