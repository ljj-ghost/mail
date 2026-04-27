package com.mall.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Repository
/**
 * 负责认证账号、会话以及管理员用户视图相关的数据持久化。
 */
public class AuthRepository {

    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.ofHours(8);

    private final JdbcTemplate jdbcTemplate;
    private final String userTable;
    private final String addressTable;

    public AuthRepository(JdbcTemplate jdbcTemplate, @Value("${mall.infra.user-database}") String userDatabase) {
        this.jdbcTemplate = jdbcTemplate;
        String safeDatabaseName = userDatabase == null ? "mall_user" : userDatabase.replace("`", "").trim();
        this.userTable = "`" + safeDatabaseName + "`.`ums_user`";
        this.addressTable = "`" + safeDatabaseName + "`.`ums_user_address`";
    }

    public boolean existsAccount(String loginName) {
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM auth_account
                WHERE login_type = 1
                  AND login_name = ?
                  AND deleted = 0
                """,
            Integer.class,
            loginName
        );
        return count != null && count > 0;
    }

    public void insertAccount(Long userId, Integer loginType, String loginName, String passwordHash, Integer status, String remark) {
        jdbcTemplate.update(
            """
                INSERT INTO auth_account (
                    user_id, login_type, login_name, password_hash, status, role_code, fail_count,
                    last_login_ip, pwd_modified_time, remark, created_by, created_time,
                    updated_by, updated_time, deleted, version
                )
                VALUES (?, ?, ?, ?, ?, ?, 0, '', NOW(3), ?, 0, NOW(3), 0, NOW(3), 0, 0)
                """,
            userId,
            loginType,
            loginName,
            passwordHash,
            status,
            "USER",
            remark
        );
    }

    public void upsertAccount(Long userId, Integer loginType, String loginName, String passwordHash, Integer status, String roleCode, String remark) {
        jdbcTemplate.update(
            """
                INSERT INTO auth_account (
                    user_id, login_type, login_name, password_hash, status, role_code, fail_count,
                    last_login_ip, pwd_modified_time, remark, created_by, created_time,
                    updated_by, updated_time, deleted, version
                )
                VALUES (?, ?, ?, ?, ?, ?, 0, '', NOW(3), ?, 0, NOW(3), 0, NOW(3), 0, 0)
                ON DUPLICATE KEY UPDATE
                    user_id = VALUES(user_id),
                    password_hash = VALUES(password_hash),
                    status = VALUES(status),
                    role_code = VALUES(role_code),
                    remark = VALUES(remark),
                    deleted = 0,
                    updated_time = NOW(3)
                """,
            userId,
            loginType,
            loginName,
            passwordHash,
            status,
            roleCode,
            remark
        );
    }

    public AuthAccountRecord findAccountByLoginName(String loginName) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT id, user_id, login_type, login_name, password_hash, status, role_code, fail_count, remark
                    FROM auth_account
                    WHERE login_type = 1
                      AND login_name = ?
                      AND deleted = 0
                    LIMIT 1
                    """,
                (rs, rowNum) -> new AuthAccountRecord(
                    rs.getLong("id"),
                    rs.getLong("user_id"),
                    rs.getInt("login_type"),
                    rs.getString("login_name"),
                    rs.getString("password_hash"),
                    rs.getInt("status"),
                    rs.getString("role_code"),
                    rs.getInt("fail_count"),
                    rs.getString("remark")
                ),
                loginName
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public AuthAccountRecord findPrimaryAccountByUserId(Long userId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT id, user_id, login_type, login_name, password_hash, status, role_code, fail_count, remark
                    FROM auth_account
                    WHERE user_id = ?
                      AND deleted = 0
                    ORDER BY id ASC
                    LIMIT 1
                    """,
                (rs, rowNum) -> new AuthAccountRecord(
                    rs.getLong("id"),
                    rs.getLong("user_id"),
                    rs.getInt("login_type"),
                    rs.getString("login_name"),
                    rs.getString("password_hash"),
                    rs.getInt("status"),
                    rs.getString("role_code"),
                    rs.getInt("fail_count"),
                    rs.getString("remark")
                ),
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public AdminUserSummaryDTO summarizeAdminUsers() {
        return jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1) AS total_users,
                       SUM(CASE WHEN role_code = 'ADMIN' THEN 1 ELSE 0 END) AS admin_users,
                       SUM(CASE WHEN role_code <> 'ADMIN' THEN 1 ELSE 0 END) AS member_users,
                       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_users,
                       (SELECT COUNT(1) FROM %s WHERE deleted = 0) AS total_addresses
                FROM %s
                """.formatted(addressTable, userTable),
            (rs, rowNum) -> new AdminUserSummaryDTO(
                rs.getInt("total_users"),
                rs.getInt("admin_users"),
                rs.getInt("member_users"),
                rs.getInt("active_users"),
                rs.getInt("total_addresses")
            )
        );
    }

    public List<AdminUserListItemDTO> findAdminUsers(String keyword, Integer status, String roleCode, int limit) {
        StringBuilder sql = new StringBuilder(
            """
                SELECT u.user_id,
                       COALESCE(primary_account.login_name, '') AS login_name,
                       u.nickname,
                       u.mobile,
                       u.email,
                       u.status,
                       u.role_code,
                       COUNT(a.id) AS address_count
                FROM %s u
                LEFT JOIN %s a ON a.user_id = u.user_id AND a.deleted = 0
                LEFT JOIN auth_account primary_account
                  ON primary_account.id = (
                      SELECT id
                      FROM (
                          SELECT aa.id
                          FROM auth_account aa
                          WHERE aa.user_id = u.user_id
                            AND aa.deleted = 0
                          ORDER BY aa.id ASC
                          LIMIT 1
                      ) account_ids
                  )
                WHERE 1 = 1
                """.formatted(userTable, addressTable)
        );
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            String likeKeyword = "%" + keyword.trim() + "%";
            sql.append("""
                 AND (
                    u.nickname LIKE ?
                    OR u.mobile LIKE ?
                    OR u.email LIKE ?
                    OR COALESCE(primary_account.login_name, '') LIKE ?
                 )
                """);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }
        if (status != null) {
            sql.append(" AND u.status = ? ");
            params.add(status);
        }
        if (roleCode != null && !roleCode.isBlank()) {
            sql.append(" AND u.role_code = ? ");
            params.add(roleCode.trim().toUpperCase());
        }
        sql.append("""
            GROUP BY u.user_id, primary_account.login_name, u.nickname, u.mobile, u.email, u.status, u.role_code
            ORDER BY CASE WHEN u.role_code = 'ADMIN' THEN 0 ELSE 1 END, u.user_id DESC
            LIMIT ?
            """);
        params.add(limit);

        return jdbcTemplate.query(
            sql.toString(),
            (rs, rowNum) -> new AdminUserListItemDTO(
                rs.getLong("user_id"),
                rs.getString("login_name"),
                rs.getString("nickname"),
                rs.getString("mobile"),
                rs.getString("email"),
                rs.getInt("status"),
                rs.getString("role_code"),
                rs.getInt("address_count")
            ),
            params.toArray()
        );
    }

    public AdminUserDetailDTO findAdminUser(Long userId) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT u.user_id,
                           COALESCE(primary_account.login_name, '') AS login_name,
                           u.nickname,
                           u.mobile,
                           u.email,
                           u.status,
                           u.role_code,
                           (
                               SELECT COUNT(1)
                               FROM %s addr
                               WHERE addr.user_id = u.user_id
                                 AND addr.deleted = 0
                           ) AS address_count
                    FROM %s u
                    LEFT JOIN auth_account primary_account
                      ON primary_account.id = (
                          SELECT id
                          FROM (
                              SELECT aa.id
                              FROM auth_account aa
                              WHERE aa.user_id = u.user_id
                                AND aa.deleted = 0
                              ORDER BY aa.id ASC
                              LIMIT 1
                          ) account_ids
                      )
                    WHERE u.user_id = ?
                    LIMIT 1
                    """.formatted(addressTable, userTable),
                (rs, rowNum) -> new AdminUserDetailDTO(
                    rs.getLong("user_id"),
                    rs.getString("login_name"),
                    rs.getString("nickname"),
                    rs.getString("mobile"),
                    rs.getString("email"),
                    rs.getInt("status"),
                    rs.getString("role_code"),
                    rs.getInt("address_count")
                ),
                userId
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public boolean existsEnabledUser(Long userId) {
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM auth_account
                WHERE user_id = ?
                  AND status = 1
                  AND deleted = 0
                """,
            Integer.class,
            userId
        );
        return count != null && count > 0;
    }

    public boolean existsUserId(Long userId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM " + userTable + " WHERE user_id = ?",
            Integer.class,
            userId
        );
        return count != null && count > 0;
    }

    public boolean existsUserByMobile(String mobile) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM " + userTable + " WHERE mobile = ?",
            Integer.class,
            mobile
        );
        return count != null && count > 0;
    }

    public boolean existsUserByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM " + userTable + " WHERE LOWER(email) = LOWER(?)",
            Integer.class,
            email
        );
        return count != null && count > 0;
    }

    public void insertUser(Long userId, String nickname, String mobile, String email, String roleCode) {
        jdbcTemplate.update(
            """
                INSERT INTO %s (
                    user_id, nickname, mobile, email, status, role_code, create_time, update_time
                )
                VALUES (?, ?, ?, ?, 1, ?, NOW(3), NOW(3))
                """.formatted(userTable),
            userId,
            nickname,
            mobile,
            email,
            roleCode
        );
    }

    public boolean existsAccountForOtherUser(String loginName, Long excludedUserId) {
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM auth_account
                WHERE login_type = 1
                  AND login_name = ?
                  AND deleted = 0
                  AND user_id <> ?
                """,
            Integer.class,
            loginName,
            excludedUserId
        );
        return count != null && count > 0;
    }

    public boolean existsUserByMobileForOtherUser(String mobile, Long excludedUserId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM " + userTable + " WHERE mobile = ? AND user_id <> ?",
            Integer.class,
            mobile,
            excludedUserId
        );
        return count != null && count > 0;
    }

    public boolean existsUserByEmailForOtherUser(String email, Long excludedUserId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM " + userTable + " WHERE LOWER(email) = LOWER(?) AND user_id <> ?",
            Integer.class,
            email,
            excludedUserId
        );
        return count != null && count > 0;
    }

    public boolean updateUserProfile(Long userId, String nickname, String mobile, String email, Integer status, String roleCode) {
        return jdbcTemplate.update(
            """
                UPDATE %s
                SET nickname = ?,
                    mobile = ?,
                    email = ?,
                    status = ?,
                    role_code = ?,
                    update_time = NOW(3)
                WHERE user_id = ?
                """.formatted(userTable),
            nickname,
            mobile,
            email,
            status,
            roleCode,
            userId
        ) == 1;
    }

    public boolean updatePrimaryAccountLoginName(Long userId, String loginName) {
        return jdbcTemplate.update(
            """
                UPDATE auth_account
                SET login_name = ?,
                    updated_time = NOW(3)
                WHERE id = (
                    SELECT id
                    FROM (
                        SELECT aa.id
                        FROM auth_account aa
                        WHERE aa.user_id = ?
                          AND aa.deleted = 0
                        ORDER BY aa.id ASC
                        LIMIT 1
                    ) account_ids
                )
                """,
            loginName,
            userId
        ) == 1;
    }

    public int updateAccountsMeta(Long userId, Integer status, String roleCode, String remark) {
        return jdbcTemplate.update(
            """
                UPDATE auth_account
                SET status = ?,
                    role_code = ?,
                    remark = ?,
                    updated_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                """,
            status,
            roleCode,
            remark,
            userId
        );
    }

    public int updateAccountsPassword(Long userId, String passwordHash) {
        return jdbcTemplate.update(
            """
                UPDATE auth_account
                SET password_hash = ?,
                    fail_count = 0,
                    pwd_modified_time = NOW(3),
                    updated_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                """,
            passwordHash,
            userId
        );
    }

    public int updateSessionsStatusByUserId(Long userId, Integer status) {
        return jdbcTemplate.update(
            """
                UPDATE auth_token_session
                SET status = ?,
                    updated_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                """,
            status,
            userId
        );
    }

    public int markAccountsDeletedByUserId(Long userId) {
        return jdbcTemplate.update(
            """
                UPDATE auth_account
                SET deleted = 1,
                    status = 0,
                    updated_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                """,
            userId
        );
    }

    public int deleteUserAddresses(Long userId) {
        return jdbcTemplate.update(
            """
                UPDATE %s
                SET deleted = 1,
                    is_default = 0,
                    update_time = NOW(3)
                WHERE user_id = ?
                  AND deleted = 0
                """.formatted(addressTable),
            userId
        );
    }

    public int deleteUserProfile(Long userId) {
        return jdbcTemplate.update(
            "DELETE FROM " + userTable + " WHERE user_id = ?",
            userId
        );
    }

    public void incrementFailCount(Long accountId) {
        jdbcTemplate.update(
            """
                UPDATE auth_account
                SET fail_count = fail_count + 1,
                    updated_time = NOW(3)
                WHERE id = ?
                """,
            accountId
        );
    }

    public void markLoginSuccess(Long accountId, String clientIp) {
        jdbcTemplate.update(
            """
                UPDATE auth_account
                SET fail_count = 0,
                    last_login_time = NOW(3),
                    last_login_ip = ?,
                    updated_time = NOW(3)
                WHERE id = ?
                """,
            clientIp,
            accountId
        );
    }

    public void insertLoginLog(
        Long userId,
        Integer loginType,
        String loginName,
        Integer deviceType,
        String clientIp,
        String userAgent,
        Integer loginResult,
        String failReason
    ) {
        jdbcTemplate.update(
            """
                INSERT INTO auth_login_log (
                    user_id, login_type, login_name, device_type, client_ip,
                    user_agent, login_result, fail_reason, trace_id, login_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', NOW(3))
                """,
            userId,
            loginType,
            loginName,
            deviceType,
            clientIp,
            userAgent,
            loginResult,
            failReason
        );
    }

    public void insertSession(AuthSessionRecord session) {
        jdbcTemplate.update(
            """
                INSERT INTO auth_token_session (
                    session_no, user_id, access_jti, refresh_jti, device_type, device_id,
                    client_ip, user_agent, last_active_time, expire_time, status,
                    created_by, created_time, updated_by, updated_time, deleted, version
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(3), 0, NOW(3), 0, 0)
                """,
            session.sessionNo(),
            session.userId(),
            session.accessJti(),
            session.refreshJti(),
            session.deviceType(),
            session.deviceId(),
            session.clientIp(),
            session.userAgent(),
            toTimestamp(session.lastActiveTime()),
            toTimestamp(session.expireTime()),
            session.status()
        );
    }

    public AuthSessionRecord findSessionBySessionNo(String sessionNo) {
        try {
            return jdbcTemplate.queryForObject(
                """
                    SELECT session_no, user_id, access_jti, refresh_jti, device_type, device_id,
                           client_ip, user_agent, last_active_time, expire_time, status
                    FROM auth_token_session
                    WHERE session_no = ?
                      AND deleted = 0
                    LIMIT 1
                    """,
                (rs, rowNum) -> new AuthSessionRecord(
                    rs.getString("session_no"),
                    rs.getLong("user_id"),
                    rs.getString("access_jti"),
                    rs.getString("refresh_jti"),
                    rs.getInt("device_type"),
                    rs.getString("device_id"),
                    rs.getString("client_ip"),
                    rs.getString("user_agent"),
                    toOffsetDateTime(rs.getTimestamp("last_active_time")),
                    toOffsetDateTime(rs.getTimestamp("expire_time")),
                    rs.getInt("status")
                ),
                sessionNo
            );
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public List<AuthSessionRecord> findSessionsByUserId(Long userId) {
        return jdbcTemplate.query(
            """
                SELECT session_no, user_id, access_jti, refresh_jti, device_type, device_id,
                       client_ip, user_agent, last_active_time, expire_time, status
                FROM auth_token_session
                WHERE user_id = ?
                  AND deleted = 0
                ORDER BY last_active_time DESC, id DESC
                """,
            (rs, rowNum) -> new AuthSessionRecord(
                rs.getString("session_no"),
                rs.getLong("user_id"),
                rs.getString("access_jti"),
                rs.getString("refresh_jti"),
                rs.getInt("device_type"),
                rs.getString("device_id"),
                rs.getString("client_ip"),
                rs.getString("user_agent"),
                toOffsetDateTime(rs.getTimestamp("last_active_time")),
                toOffsetDateTime(rs.getTimestamp("expire_time")),
                rs.getInt("status")
            ),
            userId
        );
    }

    public boolean updateSessionTokens(
        String sessionNo,
        String accessJti,
        String refreshJti,
        String clientIp,
        String userAgent,
        OffsetDateTime lastActiveTime,
        OffsetDateTime expireTime
    ) {
        return jdbcTemplate.update(
            """
                UPDATE auth_token_session
                SET access_jti = ?,
                    refresh_jti = ?,
                    client_ip = ?,
                    user_agent = ?,
                    last_active_time = ?,
                    expire_time = ?,
                    status = 1,
                    updated_time = NOW(3)
                WHERE session_no = ?
                  AND deleted = 0
                """,
            accessJti,
            refreshJti,
            clientIp,
            userAgent,
            toTimestamp(lastActiveTime),
            toTimestamp(expireTime),
            sessionNo
        ) == 1;
    }

    public boolean updateSessionStatus(String sessionNo, Integer status) {
        return jdbcTemplate.update(
            """
                UPDATE auth_token_session
                SET status = ?,
                    updated_time = NOW(3)
                WHERE session_no = ?
                  AND deleted = 0
                """,
            status,
            sessionNo
        ) == 1;
    }

    public boolean updateSessionStatusByUserId(Long userId, String sessionNo, Integer status) {
        return jdbcTemplate.update(
            """
                UPDATE auth_token_session
                SET status = ?,
                    updated_time = NOW(3)
                WHERE user_id = ?
                  AND session_no = ?
                  AND deleted = 0
                """,
            status,
            userId,
            sessionNo
        ) == 1;
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant().atOffset(DEFAULT_OFFSET);
    }

    private Timestamp toTimestamp(OffsetDateTime offsetDateTime) {
        return offsetDateTime == null ? null : Timestamp.from(offsetDateTime.toInstant());
    }

    public record AuthAccountRecord(
        Long id,
        Long userId,
        Integer loginType,
        String loginName,
        String passwordHash,
        Integer status,
        String roleCode,
        Integer failCount,
        String remark
    ) {
    }

    public record AuthSessionRecord(
        String sessionNo,
        Long userId,
        String accessJti,
        String refreshJti,
        Integer deviceType,
        String deviceId,
        String clientIp,
        String userAgent,
        OffsetDateTime lastActiveTime,
        OffsetDateTime expireTime,
        Integer status
    ) {
    }
}

