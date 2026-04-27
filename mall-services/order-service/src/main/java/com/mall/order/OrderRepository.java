package com.mall.order;

import com.mall.api.order.OrderSummaryDTO;
import com.mall.api.order.OrderItemDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Repository
/**
 * 负责订单、订单项以及管理员订单查询投影的数据持久化。
 */
public class OrderRepository {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);

    private final JdbcTemplate jdbcTemplate;

    public OrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public OrderRecord findOrder(String orderNo) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT order_no, user_id, order_status, pay_status, deleted, buyer_remark,
                           reserve_no, payment_no, pay_channel, pay_amount, pay_time, create_time,
                           delivery_company, delivery_no, delivery_time, finish_time
                    FROM oms_order
                    WHERE order_no = ?
                    """,
                (rs, rowNum) -> new OrderRecord(
                    rs.getString("order_no"),
                    rs.getLong("user_id"),
                    rs.getInt("order_status"),
                    rs.getInt("pay_status"),
                    rs.getBoolean("deleted"),
                    rs.getString("buyer_remark"),
                    rs.getString("reserve_no"),
                    rs.getString("payment_no"),
                    rs.getObject("pay_channel", Integer.class),
                    rs.getBigDecimal("pay_amount"),
                    toOffsetDateTime(rs.getTimestamp("pay_time")),
                    toOffsetDateTime(rs.getTimestamp("create_time")),
                    rs.getString("delivery_company"),
                    rs.getString("delivery_no"),
                    toOffsetDateTime(rs.getTimestamp("delivery_time")),
                    toOffsetDateTime(rs.getTimestamp("finish_time"))
                ),
                orderNo
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public List<OrderSummaryDTO> findOrdersByUserId(Long userId, Integer orderStatus, int limit) {
        String baseSelect = """
            SELECT o.order_no,
                   o.order_status,
                   o.pay_status,
                   o.pay_amount,
                   o.buyer_remark,
                   o.create_time,
                   COUNT(i.id) AS item_count
            FROM oms_order o
            LEFT JOIN oms_order_item i ON i.order_no = o.order_no
            WHERE o.user_id = ?
              AND o.deleted = 0
            """;
        String groupAndOrder = """
            GROUP BY o.order_no, o.order_status, o.pay_status, o.pay_amount, o.buyer_remark, o.create_time
            ORDER BY o.create_time DESC, o.id DESC
            LIMIT ?
            """;

        if (orderStatus == null) {
            return jdbcTemplate.query(
                baseSelect + groupAndOrder,
                (rs, rowNum) -> new OrderSummaryDTO(
                    rs.getString("order_no"),
                    rs.getInt("order_status"),
                    rs.getInt("pay_status"),
                    rs.getBigDecimal("pay_amount"),
                    rs.getString("buyer_remark"),
                    toOffsetDateTime(rs.getTimestamp("create_time")),
                    rs.getInt("item_count")
                ),
                userId,
                limit
            );
        }

        return jdbcTemplate.query(
            baseSelect + " AND o.order_status = ? " + groupAndOrder,
            (rs, rowNum) -> new OrderSummaryDTO(
                rs.getString("order_no"),
                rs.getInt("order_status"),
                rs.getInt("pay_status"),
                rs.getBigDecimal("pay_amount"),
                rs.getString("buyer_remark"),
                toOffsetDateTime(rs.getTimestamp("create_time")),
                rs.getInt("item_count")
            ),
            userId,
            orderStatus,
            limit
        );
    }

    public List<AdminOrderSummaryDTO> findAdminOrders(
        String keyword,
        Integer orderStatus,
        Integer payStatus,
        Long userId,
        int limit
    ) {
        StringBuilder sql = new StringBuilder(
            """
                SELECT o.order_no,
                       o.user_id,
                       o.order_status,
                       o.pay_status,
                       o.pay_amount,
                       o.buyer_remark,
                       o.create_time,
                       COUNT(i.id) AS item_count
                FROM oms_order o
                LEFT JOIN oms_order_item i ON i.order_no = o.order_no
                WHERE o.deleted = 0
                """
        );
        List<Object> params = new java.util.ArrayList<>();
        if (keyword != null && !keyword.isBlank()) {
            String likeKeyword = "%" + keyword.trim() + "%";
            sql.append("""
                 AND (
                    o.order_no LIKE ?
                    OR o.buyer_remark LIKE ?
                    OR CAST(o.user_id AS CHAR) LIKE ?
                 )
                """);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (orderStatus != null) {
            sql.append(" AND o.order_status = ? ");
            params.add(orderStatus);
        }
        if (payStatus != null) {
            sql.append(" AND o.pay_status = ? ");
            params.add(payStatus);
        }
        if (userId != null) {
            sql.append(" AND o.user_id = ? ");
            params.add(userId);
        }
        sql.append("""
            GROUP BY o.order_no, o.user_id, o.order_status, o.pay_status, o.pay_amount, o.buyer_remark, o.create_time, o.id
            ORDER BY o.create_time DESC, o.id DESC
            LIMIT ?
            """);
        params.add(limit);
        return jdbcTemplate.query(
            sql.toString(),
            (rs, rowNum) -> new AdminOrderSummaryDTO(
                rs.getString("order_no"),
                rs.getLong("user_id"),
                rs.getInt("order_status"),
                rs.getInt("pay_status"),
                rs.getBigDecimal("pay_amount"),
                rs.getString("buyer_remark"),
                toOffsetDateTime(rs.getTimestamp("create_time")),
                rs.getInt("item_count")
            ),
            params.toArray()
        );
    }

    public List<OrderItemDTO> findOrderItems(String orderNo) {
        return jdbcTemplate.query(
            """
                SELECT sku_id, sku_name, quantity, sale_price, item_amount
                FROM oms_order_item
                WHERE order_no = ?
                ORDER BY id ASC
                """,
            (rs, rowNum) -> new OrderItemDTO(
                rs.getLong("sku_id"),
                rs.getString("sku_name"),
                rs.getInt("quantity"),
                rs.getBigDecimal("sale_price"),
                rs.getBigDecimal("item_amount")
            ),
            orderNo
        );
    }

    public String findOrderNoByIdempotency(Long userId, String idempotencyKey) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT order_no
                    FROM oms_order_submit_log
                    WHERE user_id = ?
                      AND idempotency_key = ?
                    """,
                String.class,
                userId,
                idempotencyKey
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public void insertOrder(OrderRecord order, List<OrderItemDTO> items, String idempotencyKey) {
        jdbcTemplate.update(
            """
                INSERT INTO oms_order (
                    order_no, user_id, order_status, pay_status, buyer_remark,
                    reserve_no, payment_no, pay_channel, pay_amount, pay_time,
                    delivery_company, delivery_no, delivery_time, finish_time,
                    create_time, update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
                """,
            order.orderNo(),
            order.userId(),
            order.orderStatus(),
            order.payStatus(),
            order.buyerRemark(),
            order.reserveNo(),
            order.paymentNo(),
            order.payChannel(),
            order.payAmount(),
            toTimestamp(order.payTime()),
            order.deliveryCompany(),
            order.deliveryNo(),
            toTimestamp(order.deliveryTime()),
            toTimestamp(order.finishTime())
        );

        jdbcTemplate.batchUpdate(
            """
                INSERT INTO oms_order_item (
                    order_no, sku_id, sku_name, quantity, sale_price, item_amount, create_time, update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
                """,
            new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int index) throws SQLException {
                    OrderItemDTO item = items.get(index);
                    ps.setString(1, order.orderNo());
                    ps.setLong(2, item.skuId());
                    ps.setString(3, item.skuName());
                    ps.setInt(4, item.quantity());
                    ps.setBigDecimal(5, item.salePrice());
                    ps.setBigDecimal(6, item.itemAmount());
                }

                @Override
                public int getBatchSize() {
                    return items.size();
                }
            }
        );

        jdbcTemplate.update(
            """
                INSERT INTO oms_order_submit_log (user_id, idempotency_key, order_no, create_time)
                VALUES (?, ?, ?, NOW(3))
                """,
            order.userId(),
            idempotencyKey,
            order.orderNo()
        );
    }

    public boolean markCancelled(String orderNo) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET order_status = 50,
                    pay_status = 4,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND order_status = 10
                  AND pay_status = 0
                """,
            orderNo
        ) == 1;
    }

    public boolean markPaid(String orderNo, String paymentNo, Integer payChannel, OffsetDateTime payTime) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET order_status = 20,
                    pay_status = 2,
                    payment_no = ?,
                    pay_channel = ?,
                    pay_time = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND order_status <> 50
                  AND pay_status <> 2
                """,
            paymentNo,
            payChannel,
            toTimestamp(payTime),
            orderNo
        ) == 1;
    }

    public boolean markShipped(String orderNo, String deliveryCompany, String deliveryNo, OffsetDateTime deliveryTime) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET order_status = 30,
                    delivery_company = ?,
                    delivery_no = ?,
                    delivery_time = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND pay_status = 2
                  AND order_status IN (20, 30)
                  AND deleted = 0
                """,
            deliveryCompany,
            deliveryNo,
            toTimestamp(deliveryTime),
            orderNo
        ) == 1;
    }

    public boolean markCompleted(String orderNo, OffsetDateTime finishTime) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET order_status = 40,
                    finish_time = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND pay_status = 2
                  AND order_status = 30
                  AND deleted = 0
                """,
            toTimestamp(finishTime),
            orderNo
        ) == 1;
    }

    public boolean markDeleted(String orderNo, Long userId) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET deleted = 1,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND user_id = ?
                  AND deleted = 0
                """,
            orderNo,
            userId
        ) == 1;
    }

    public boolean markDeletedByAdmin(String orderNo) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET deleted = 1,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND deleted = 0
                """,
            orderNo
        ) == 1;
    }

    public boolean updateBuyerRemark(String orderNo, String buyerRemark) {
        return jdbcTemplate.update(
            """
                UPDATE oms_order
                SET buyer_remark = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                """,
            buyerRemark,
            orderNo
        ) == 1;
    }

    public List<String> findExpiredPendingPaymentOrderNos(OffsetDateTime cutoffTime, int limit) {
        return jdbcTemplate.query(
            """
                SELECT order_no
                FROM oms_order
                WHERE order_status = 10
                  AND pay_status = 0
                  AND deleted = 0
                  AND create_time <= ?
                ORDER BY create_time ASC, id ASC
                LIMIT ?
                """,
            (rs, rowNum) -> rs.getString("order_no"),
            toTimestamp(cutoffTime),
            limit
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(DEFAULT_OFFSET);
    }

    private Timestamp toTimestamp(OffsetDateTime offsetDateTime) {
        return offsetDateTime == null ? null : Timestamp.from(offsetDateTime.toInstant());
    }

    public record OrderRecord(
        String orderNo,
        Long userId,
        Integer orderStatus,
        Integer payStatus,
        Boolean deleted,
        String buyerRemark,
        String reserveNo,
        String paymentNo,
        Integer payChannel,
        java.math.BigDecimal payAmount,
        OffsetDateTime payTime,
        OffsetDateTime createTime,
        String deliveryCompany,
        String deliveryNo,
        OffsetDateTime deliveryTime,
        OffsetDateTime finishTime
    ) {
    }
}

