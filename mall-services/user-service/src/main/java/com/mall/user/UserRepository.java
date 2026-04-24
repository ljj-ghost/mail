package com.mall.user;

import com.mall.api.user.AddressDTO;
import com.mall.api.user.AdminUserListItemDTO;
import com.mall.api.user.AdminUserSummaryDTO;
import com.mall.api.user.UserBaseDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UserBaseDTO findUser(Long userId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT user_id, nickname, mobile, email, status, role_code
                    FROM ums_user
                    WHERE user_id = ?
                    """,
                (rs, rowNum) -> new UserBaseDTO(
                    rs.getLong("user_id"),
                    rs.getString("nickname"),
                    rs.getString("mobile"),
                    rs.getString("email"),
                    rs.getInt("status"),
                    rs.getString("role_code")
                ),
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public List<AdminUserListItemDTO> findAdminUsers(int limit) {
        return jdbcTemplate.query(
            """
                SELECT u.user_id,
                       u.nickname,
                       u.mobile,
                       u.email,
                       u.status,
                       u.role_code,
                       COUNT(a.id) AS address_count
                FROM ums_user u
                LEFT JOIN ums_user_address a ON a.user_id = u.user_id AND a.deleted = 0
                GROUP BY u.user_id, u.nickname, u.mobile, u.email, u.status, u.role_code
                ORDER BY CASE WHEN u.role_code = 'ADMIN' THEN 0 ELSE 1 END, u.user_id ASC
                LIMIT ?
                """,
            (rs, rowNum) -> new AdminUserListItemDTO(
                rs.getLong("user_id"),
                rs.getString("nickname"),
                rs.getString("mobile"),
                rs.getString("email"),
                rs.getInt("status"),
                rs.getString("role_code"),
                rs.getInt("address_count")
            ),
            limit
        );
    }

    public AdminUserSummaryDTO summarizeUsers() {
        return jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1) AS total_users,
                       SUM(CASE WHEN role_code = 'ADMIN' THEN 1 ELSE 0 END) AS admin_users,
                       SUM(CASE WHEN role_code <> 'ADMIN' THEN 1 ELSE 0 END) AS member_users,
                       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_users,
                       (SELECT COUNT(1) FROM ums_user_address WHERE deleted = 0) AS total_addresses
                FROM ums_user
                """,
            (rs, rowNum) -> new AdminUserSummaryDTO(
                rs.getInt("total_users"),
                rs.getInt("admin_users"),
                rs.getInt("member_users"),
                rs.getInt("active_users"),
                rs.getInt("total_addresses")
            )
        );
    }

    public boolean updateUser(Long userId, String nickname, String mobile, String email) {
        return jdbcTemplate.update(
            """
                UPDATE ums_user
                SET nickname = ?,
                    mobile = ?,
                    email = ?,
                    update_time = NOW(3)
                WHERE user_id = ?
                """,
            nickname,
            mobile,
            email,
            userId
        ) == 1;
    }

    public List<AddressDTO> findAddresses(Long userId) {
        return jdbcTemplate.query(
            """
                SELECT id, user_id, consignee_name, consignee_mobile, detail_address, is_default
                FROM ums_user_address
                WHERE user_id = ?
                  AND deleted = 0
                ORDER BY is_default DESC, id ASC
                """,
            (rs, rowNum) -> new AddressDTO(
                rs.getLong("id"),
                rs.getLong("user_id"),
                rs.getString("consignee_name"),
                rs.getString("consignee_mobile"),
                rs.getString("detail_address"),
                rs.getInt("is_default") == 1
            ),
            userId
        );
    }

    public AddressDTO findAddress(Long userId, Long addressId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT id, user_id, consignee_name, consignee_mobile, detail_address, is_default
                    FROM ums_user_address
                    WHERE user_id = ?
                      AND id = ?
                      AND deleted = 0
                    """,
                (rs, rowNum) -> new AddressDTO(
                    rs.getLong("id"),
                    rs.getLong("user_id"),
                    rs.getString("consignee_name"),
                    rs.getString("consignee_mobile"),
                    rs.getString("detail_address"),
                    rs.getInt("is_default") == 1
                ),
                userId,
                addressId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public AddressDTO findDefaultAddress(Long userId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT id, user_id, consignee_name, consignee_mobile, detail_address, is_default
                    FROM ums_user_address
                    WHERE user_id = ?
                      AND deleted = 0
                      AND is_default = 1
                    ORDER BY id ASC
                    LIMIT 1
                    """,
                (rs, rowNum) -> new AddressDTO(
                    rs.getLong("id"),
                    rs.getLong("user_id"),
                    rs.getString("consignee_name"),
                    rs.getString("consignee_mobile"),
                    rs.getString("detail_address"),
                    true
                ),
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Long insertAddress(Long userId, String consigneeName, String consigneeMobile, String detailAddress, boolean defaultAddress) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                """
                    INSERT INTO ums_user_address (
                        user_id, consignee_name, consignee_mobile, detail_address, is_default, deleted, create_time, update_time
                    )
                    VALUES (?, ?, ?, ?, ?, 0, NOW(3), NOW(3))
                    """,
                new String[]{"id"}
            );
            ps.setLong(1, userId);
            ps.setString(2, consigneeName);
            ps.setString(3, consigneeMobile);
            ps.setString(4, detailAddress);
            ps.setInt(5, defaultAddress ? 1 : 0);
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        return key == null ? null : key.longValue();
    }

    public boolean updateAddress(Long userId, Long addressId, String consigneeName, String consigneeMobile, String detailAddress) {
        return jdbcTemplate.update(
            """
                UPDATE ums_user_address
                SET consignee_name = ?,
                    consignee_mobile = ?,
                    detail_address = ?,
                    update_time = NOW(3)
                WHERE user_id = ?
                  AND id = ?
                  AND deleted = 0
                """,
            consigneeName,
            consigneeMobile,
            detailAddress,
            userId,
            addressId
        ) == 1;
    }

    public void clearDefaultAddress(Long userId) {
        jdbcTemplate.update(
            """
                UPDATE ums_user_address
                SET is_default = 0,
                    update_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                  AND is_default = 1
                """,
            userId
        );
    }

    public boolean markDefaultAddress(Long userId, Long addressId) {
        return jdbcTemplate.update(
            """
                UPDATE ums_user_address
                SET is_default = 1,
                    update_time = NOW(3)
                WHERE user_id = ?
                  AND id = ?
                  AND deleted = 0
                """,
            userId,
            addressId
        ) == 1;
    }

    public boolean deleteAddress(Long userId, Long addressId) {
        return jdbcTemplate.update(
            """
                UPDATE ums_user_address
                SET deleted = 1,
                    is_default = 0,
                    update_time = NOW(3)
                WHERE user_id = ?
                  AND id = ?
                  AND deleted = 0
                """,
            userId,
            addressId
        ) == 1;
    }
}
