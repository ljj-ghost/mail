package com.mall.payment;

import com.mall.api.payment.PaymentSummaryDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Repository
/**
 * 负责支付单和支付事件历史的数据持久化。
 */
public class PaymentRepository {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public PaymentRecord findByPaymentNo(String paymentNo) {
        return querySingle(
            """
                SELECT payment_no, order_no, user_id, pay_channel, pay_status, pay_amount, third_trade_no,
                       create_time, pay_time, close_time, close_reason
                FROM pay_payment
                WHERE payment_no = ?
                """,
            paymentNo
        );
    }

    public PaymentRecord findByOrderNo(String orderNo) {
        return querySingle(
            """
                SELECT payment_no, order_no, user_id, pay_channel, pay_status, pay_amount, third_trade_no,
                       create_time, pay_time, close_time, close_reason
                FROM pay_payment
                WHERE order_no = ?
                """,
            orderNo
        );
    }

    public List<PaymentSummaryDTO> findByUserId(Long userId, Integer payStatus, int limit) {
        String baseSql = """
            SELECT payment_no, order_no, pay_channel, pay_status, pay_amount, create_time, pay_time, close_time
            FROM pay_payment
            WHERE user_id = ?
            """;
        String orderAndLimit = " ORDER BY create_time DESC, id DESC LIMIT ?";
        if (payStatus == null) {
            return jdbcTemplate.query(
                baseSql + orderAndLimit,
                (rs, rowNum) -> new PaymentSummaryDTO(
                    rs.getString("payment_no"),
                    rs.getString("order_no"),
                    rs.getInt("pay_channel"),
                    rs.getInt("pay_status"),
                    rs.getBigDecimal("pay_amount"),
                    toOffsetDateTime(rs.getTimestamp("create_time")),
                    toOffsetDateTime(rs.getTimestamp("pay_time")),
                    toOffsetDateTime(rs.getTimestamp("close_time"))
                ),
                userId,
                limit
            );
        }

        return jdbcTemplate.query(
            baseSql + " AND pay_status = ? " + orderAndLimit,
            (rs, rowNum) -> new PaymentSummaryDTO(
                rs.getString("payment_no"),
                rs.getString("order_no"),
                rs.getInt("pay_channel"),
                rs.getInt("pay_status"),
                rs.getBigDecimal("pay_amount"),
                toOffsetDateTime(rs.getTimestamp("create_time")),
                toOffsetDateTime(rs.getTimestamp("pay_time")),
                toOffsetDateTime(rs.getTimestamp("close_time"))
            ),
            userId,
            payStatus,
            limit
        );
    }

    public void insert(PaymentRecord paymentRecord) {
        jdbcTemplate.update(
            """
                INSERT INTO pay_payment (
                    payment_no, order_no, user_id, pay_channel, pay_status, pay_amount, third_trade_no,
                    pay_time, close_time, close_reason, create_time, update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
                """,
            paymentRecord.paymentNo(),
            paymentRecord.orderNo(),
            paymentRecord.userId(),
            paymentRecord.payChannel(),
            paymentRecord.payStatus(),
            paymentRecord.payAmount(),
            paymentRecord.thirdTradeNo(),
            toTimestamp(paymentRecord.payTime()),
            toTimestamp(paymentRecord.closeTime()),
            paymentRecord.closeReason()
        );
    }

    public boolean markSuccess(String paymentNo, String thirdTradeNo, OffsetDateTime payTime) {
        return jdbcTemplate.update(
            """
                UPDATE pay_payment
                SET pay_status = 2,
                    third_trade_no = ?,
                    pay_time = ?,
                    close_time = NULL,
                    close_reason = '',
                    update_time = NOW(3)
                WHERE payment_no = ?
                  AND pay_status = 0
                """,
            thirdTradeNo,
            toTimestamp(payTime),
            paymentNo
        ) == 1;
    }

    public boolean markClosedByOrderNo(String orderNo, String closeReason, OffsetDateTime closeTime) {
        return jdbcTemplate.update(
            """
                UPDATE pay_payment
                SET pay_status = 4,
                    close_time = ?,
                    close_reason = ?,
                    update_time = NOW(3)
                WHERE order_no = ?
                  AND pay_status = 0
                """,
            toTimestamp(closeTime),
            closeReason,
            orderNo
        ) == 1;
    }

    private PaymentRecord querySingle(String sql, String identifier) {
        try {
            return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> new PaymentRecord(
                    rs.getString("payment_no"),
                    rs.getString("order_no"),
                    rs.getLong("user_id"),
                    rs.getInt("pay_channel"),
                    rs.getInt("pay_status"),
                    rs.getBigDecimal("pay_amount"),
                    rs.getString("third_trade_no"),
                    toOffsetDateTime(rs.getTimestamp("create_time")),
                    toOffsetDateTime(rs.getTimestamp("pay_time")),
                    toOffsetDateTime(rs.getTimestamp("close_time")),
                    rs.getString("close_reason")
                ),
                identifier
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(DEFAULT_OFFSET);
    }

    private Timestamp toTimestamp(OffsetDateTime offsetDateTime) {
        return offsetDateTime == null ? null : Timestamp.from(offsetDateTime.toInstant());
    }

    public record PaymentRecord(
        String paymentNo,
        String orderNo,
        Long userId,
        Integer payChannel,
        Integer payStatus,
        BigDecimal payAmount,
        String thirdTradeNo,
        OffsetDateTime createTime,
        OffsetDateTime payTime,
        OffsetDateTime closeTime,
        String closeReason
    ) {
    }
}

