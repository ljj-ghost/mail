package com.mall.inventory.repository;

import com.mall.api.inventory.request.InventoryItemRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
/**
 * 负责库存数量、预占记录以及相关管理员视图的数据持久化。
 */
public class InventoryRepository {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);

    private final JdbcTemplate jdbcTemplate;

    public InventoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public StockSnapshot findStock(Long skuId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT sku_id, available_qty, locked_qty
                    FROM inventory_stock
                    WHERE sku_id = ?
                    """,
                (rs, rowNum) -> new StockSnapshot(
                    rs.getLong("sku_id"),
                    rs.getInt("available_qty"),
                    rs.getInt("locked_qty")
                ),
                skuId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Map<Long, StockSnapshot> findStocks(Collection<Long> skuIds) {
        Map<Long, StockSnapshot> result = new LinkedHashMap<>();
        for (Long skuId : skuIds) {
            StockSnapshot snapshot = findStock(skuId);
            if (snapshot != null) {
                result.put(skuId, snapshot);
            }
        }
        return result;
    }

    public ReservationSnapshot findReservation(String orderNo) {
        List<ReservationHeader> headers = jdbcTemplate.query(
            """
                SELECT reserve_no, order_no, status, expire_time
                FROM inventory_reservation
                WHERE order_no = ?
                """,
            (rs, rowNum) -> new ReservationHeader(
                rs.getString("reserve_no"),
                rs.getString("order_no"),
                rs.getInt("status"),
                toOffsetDateTime(rs.getTimestamp("expire_time"))
            ),
            orderNo
        );
        if (headers.isEmpty()) {
            return null;
        }

        List<InventoryItemRequest> items = jdbcTemplate.query(
            """
                SELECT sku_id, quantity
                FROM inventory_reservation_item
                WHERE order_no = ?
                ORDER BY id ASC
                """,
            (rs, rowNum) -> new InventoryItemRequest(rs.getLong("sku_id"), rs.getInt("quantity")),
            orderNo
        );

        ReservationHeader header = headers.get(0);
        return new ReservationSnapshot(header.reserveNo(), header.orderNo(), header.status(), header.expireTime(), items);
    }

    public boolean tryReserveStock(Long skuId, Integer quantity) {
        return jdbcTemplate.update(
            """
                UPDATE inventory_stock
                SET locked_qty = locked_qty + ?,
                    update_time = NOW(3)
                WHERE sku_id = ?
                  AND available_qty - locked_qty >= ?
                """,
            quantity,
            skuId,
            quantity
        ) == 1;
    }

    public void releaseStock(Long skuId, Integer quantity) {
        jdbcTemplate.update(
            """
                UPDATE inventory_stock
                SET locked_qty = GREATEST(locked_qty - ?, 0),
                    update_time = NOW(3)
                WHERE sku_id = ?
                """,
            quantity,
            skuId
        );
    }

    public boolean deductStock(Long skuId, Integer quantity) {
        return jdbcTemplate.update(
            """
                UPDATE inventory_stock
                SET available_qty = available_qty - ?,
                    locked_qty = locked_qty - ?,
                    update_time = NOW(3)
                WHERE sku_id = ?
                  AND available_qty >= ?
                  AND locked_qty >= ?
                """,
            quantity,
            quantity,
            skuId,
            quantity,
            quantity
        ) == 1;
    }

    public void insertReservation(String reserveNo, String orderNo, Integer status, OffsetDateTime expireTime) {
        jdbcTemplate.update(
            """
                INSERT INTO inventory_reservation (reserve_no, order_no, status, expire_time, create_time, update_time)
                VALUES (?, ?, ?, ?, NOW(3), NOW(3))
                """,
            reserveNo,
            orderNo,
            status,
            Timestamp.from(expireTime.toInstant())
        );
    }

    public void insertReservationItems(String reserveNo, String orderNo, List<InventoryItemRequest> items) {
        jdbcTemplate.batchUpdate(
            """
                INSERT INTO inventory_reservation_item (reserve_no, order_no, sku_id, quantity, create_time, update_time)
                VALUES (?, ?, ?, ?, NOW(3), NOW(3))
                """,
            new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int index) throws SQLException {
                    InventoryItemRequest item = items.get(index);
                    ps.setString(1, reserveNo);
                    ps.setString(2, orderNo);
                    ps.setLong(3, item.skuId());
                    ps.setInt(4, item.quantity());
                }

                @Override
                public int getBatchSize() {
                    return items.size();
                }
            }
        );
    }

    public void updateReservationStatus(String orderNo, Integer status) {
        jdbcTemplate.update(
            """
                UPDATE inventory_reservation
                SET status = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                """,
            status,
            orderNo
        );
    }

    public List<StockSnapshot> findLowStock(int threshold) {
        return jdbcTemplate.query(
            """
                SELECT sku_id, available_qty, locked_qty
                FROM inventory_stock
                WHERE available_qty - locked_qty <= ?
                ORDER BY (available_qty - locked_qty) ASC, sku_id ASC
                """,
            (rs, rowNum) -> new StockSnapshot(
                rs.getLong("sku_id"),
                rs.getInt("available_qty"),
                rs.getInt("locked_qty")
            ),
            threshold
        );
    }

    public void replenishStock(Long skuId, Integer quantity) {
        jdbcTemplate.update(
            """
                INSERT INTO inventory_stock (sku_id, available_qty, locked_qty, create_time, update_time)
                VALUES (?, ?, 0, NOW(3), NOW(3))
                ON DUPLICATE KEY UPDATE
                    available_qty = available_qty + VALUES(available_qty),
                    update_time = NOW(3)
                """,
            skuId,
            quantity
        );
    }

    public void upsertAbsoluteStock(Long skuId, Integer availableQty) {
        int updated = jdbcTemplate.update(
            """
                UPDATE inventory_stock
                SET available_qty = GREATEST(?, locked_qty),
                    update_time = NOW(3)
                WHERE sku_id = ?
                """,
            availableQty,
            skuId
        );
        if (updated > 0) {
            return;
        }
        jdbcTemplate.update(
            """
                INSERT INTO inventory_stock (sku_id, available_qty, locked_qty, create_time, update_time)
                VALUES (?, ?, 0, NOW(3), NOW(3))
                """,
            skuId,
            availableQty
        );
    }

    public List<String> findExpiredReservationOrderNos(Integer status, int limit) {
        return jdbcTemplate.query(
            """
                SELECT order_no
                FROM inventory_reservation
                WHERE status = ?
                  AND expire_time IS NOT NULL
                  AND expire_time <= NOW(3)
                ORDER BY expire_time ASC, id ASC
                LIMIT ?
                """,
            (rs, rowNum) -> rs.getString("order_no"),
            status,
            limit
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(DEFAULT_OFFSET);
    }

    private record ReservationHeader(String reserveNo, String orderNo, Integer status, OffsetDateTime expireTime) {
    }

    public record StockSnapshot(Long skuId, Integer availableQty, Integer lockedQty) {
        public int saleableQty() {
            return availableQty - lockedQty;
        }
    }

    public record ReservationSnapshot(
        String reserveNo,
        String orderNo,
        Integer status,
        OffsetDateTime expireTime,
        List<InventoryItemRequest> items
    ) {
    }
}

