package com.mall.cart;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CartRepository {

    private final JdbcTemplate jdbcTemplate;

    public CartRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CartItemDTO> findItemsByUserId(Long userId) {
        return jdbcTemplate.query(
            """
                SELECT sku_id, sku_name, quantity, sale_price
                FROM oms_cart_item
                WHERE user_id = ?
                ORDER BY update_time DESC, id DESC
                """,
            (rs, rowNum) -> new CartItemDTO(
                rs.getLong("sku_id"),
                rs.getString("sku_name"),
                rs.getInt("quantity"),
                rs.getBigDecimal("sale_price")
            ),
            userId
        );
    }

    public void upsertItem(Long userId, Long skuId, String skuName, Integer quantity, java.math.BigDecimal salePrice) {
        jdbcTemplate.update(
            """
                INSERT INTO oms_cart_item (user_id, sku_id, sku_name, quantity, sale_price, create_time, update_time)
                VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))
                ON DUPLICATE KEY UPDATE
                    sku_name = VALUES(sku_name),
                    quantity = quantity + VALUES(quantity),
                    sale_price = VALUES(sale_price),
                    update_time = NOW(3)
                """,
            userId,
            skuId,
            skuName,
            quantity,
            salePrice
        );
    }

    public boolean deleteItem(Long userId, Long skuId) {
        return jdbcTemplate.update(
            """
                DELETE FROM oms_cart_item
                WHERE user_id = ?
                  AND sku_id = ?
                """,
            userId,
            skuId
        ) > 0;
    }

    public int deleteItems(Long userId, List<Long> skuIds) {
        if (skuIds == null || skuIds.isEmpty()) {
            return 0;
        }

        String placeholders = String.join(", ", java.util.Collections.nCopies(skuIds.size(), "?"));
        Object[] args = new Object[skuIds.size() + 1];
        args[0] = userId;
        for (int index = 0; index < skuIds.size(); index++) {
            args[index + 1] = skuIds.get(index);
        }

        return jdbcTemplate.update(
            "DELETE FROM oms_cart_item WHERE user_id = ? AND sku_id IN (" + placeholders + ")",
            args
        );
    }
}
