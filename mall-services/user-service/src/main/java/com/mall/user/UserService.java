package com.mall.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mall.api.user.AddressDTO;
import com.mall.api.user.AdminUserListItemDTO;
import com.mall.api.user.AdminUserSummaryDTO;
import com.mall.api.user.UserAddressSaveRequest;
import com.mall.api.user.UserBaseDTO;
import com.mall.api.user.UserProfileUpdateRequest;
import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import com.mall.common.security.UserContext;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.util.List;

@Service
public class UserService {

    private static final Duration PROFILE_CACHE_TTL = Duration.ofMinutes(15);
    private static final Duration ADDRESS_CACHE_TTL = Duration.ofMinutes(10);
    private static final TypeReference<List<AddressDTO>> ADDRESS_LIST_TYPE = new TypeReference<>() {
    };

    private final UserRepository userRepository;
    private final TransactionTemplate transactionTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public UserService(
        UserRepository userRepository,
        PlatformTransactionManager transactionManager,
        StringRedisTemplate stringRedisTemplate,
        ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public UserBaseDTO me() {
        Long userId = requireCurrentUserId();
        UserBaseDTO cached = getCachedProfile(userId);
        if (cached != null) {
            return cached;
        }
        UserBaseDTO user = requireUser(userId);
        cacheProfile(user);
        return user;
    }

    public UserBaseDTO updateProfile(UserProfileUpdateRequest request) {
        Long userId = requireCurrentUserId();
        Boolean updated = transactionTemplate.execute(
            status -> userRepository.updateUser(userId, request.nickname(), request.mobile(), request.email())
        );
        if (!Boolean.TRUE.equals(updated)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update user profile failed");
        }
        evictProfileCache(userId);
        UserBaseDTO latest = requireUser(userId);
        cacheProfile(latest);
        return latest;
    }

    public List<AddressDTO> addresses() {
        Long userId = requireCurrentUserId();
        List<AddressDTO> cached = getCachedAddresses(userId);
        if (cached != null) {
            return cached;
        }
        List<AddressDTO> addresses = userRepository.findAddresses(userId);
        cacheAddresses(userId, addresses);
        return addresses;
    }

    public AddressDTO addAddress(UserAddressSaveRequest request) {
        Long userId = requireCurrentUserId();
        Boolean created = transactionTemplate.execute(status -> {
            boolean hasDefault = userRepository.findDefaultAddress(userId) != null;
            boolean makeDefault = Boolean.TRUE.equals(request.defaultAddress()) || !hasDefault;
            if (makeDefault) {
                userRepository.clearDefaultAddress(userId);
            }
            Long addressId = userRepository.insertAddress(
                userId,
                request.consigneeName(),
                request.consigneeMobile(),
                request.detailAddress(),
                makeDefault
            );
            if (addressId == null) {
                status.setRollbackOnly();
                return false;
            }
            return true;
        });
        if (!Boolean.TRUE.equals(created)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Create address failed");
        }
        evictAddressCache(userId);
        return requireDefaultSortedAddress(userId, request);
    }

    public AddressDTO updateAddress(Long addressId, UserAddressSaveRequest request) {
        Long userId = requireCurrentUserId();
        AddressDTO current = requireAddress(userId, addressId);
        Boolean updated = transactionTemplate.execute(status -> {
            boolean success = userRepository.updateAddress(
                userId,
                addressId,
                request.consigneeName(),
                request.consigneeMobile(),
                request.detailAddress()
            );
            if (!success) {
                return false;
            }
            boolean shouldDefault = Boolean.TRUE.equals(request.defaultAddress()) || Boolean.TRUE.equals(current.defaultAddress());
            if (shouldDefault) {
                userRepository.clearDefaultAddress(userId);
                return userRepository.markDefaultAddress(userId, addressId);
            }
            return true;
        });
        if (!Boolean.TRUE.equals(updated)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Update address failed");
        }
        evictAddressCache(userId);
        return requireAddress(userId, addressId);
    }

    public boolean setDefaultAddress(Long addressId) {
        Long userId = requireCurrentUserId();
        requireAddress(userId, addressId);
        Boolean updated = transactionTemplate.execute(status -> {
            userRepository.clearDefaultAddress(userId);
            return userRepository.markDefaultAddress(userId, addressId);
        });
        if (!Boolean.TRUE.equals(updated)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Set default address failed");
        }
        evictAddressCache(userId);
        return true;
    }

    public boolean deleteAddress(Long addressId) {
        Long userId = requireCurrentUserId();
        AddressDTO address = requireAddress(userId, addressId);
        Boolean deleted = transactionTemplate.execute(status -> {
            boolean success = userRepository.deleteAddress(userId, addressId);
            if (!success) {
                return false;
            }
            if (Boolean.TRUE.equals(address.defaultAddress())) {
                List<AddressDTO> remaining = userRepository.findAddresses(userId);
                if (!remaining.isEmpty()) {
                    userRepository.markDefaultAddress(userId, remaining.get(0).id());
                }
            }
            return true;
        });
        if (!Boolean.TRUE.equals(deleted)) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Delete address failed");
        }
        evictAddressCache(userId);
        return true;
    }

    public UserBaseDTO getUser(Long userId) {
        return requireUser(userId);
    }

    public AddressDTO getDefaultAddress(Long userId) {
        AddressDTO address = userRepository.findDefaultAddress(userId);
        if (address != null) {
            return address;
        }
        List<AddressDTO> addresses = userRepository.findAddresses(userId);
        if (addresses.isEmpty()) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Default address not found");
        }
        return addresses.get(0);
    }

    public AdminUserSummaryDTO adminSummary() {
        requireAdmin();
        return userRepository.summarizeUsers();
    }

    public List<AdminUserListItemDTO> adminUsers(int limit) {
        requireAdmin();
        return userRepository.findAdminUsers(Math.max(1, Math.min(limit, 20)));
    }

    private UserBaseDTO requireUser(Long userId) {
        UserBaseDTO user = userRepository.findUser(userId);
        if (user == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "User not found");
        }
        return user;
    }

    private AddressDTO requireAddress(Long userId, Long addressId) {
        AddressDTO address = userRepository.findAddress(userId, addressId);
        if (address == null) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Address not found");
        }
        return address;
    }

    private AddressDTO requireDefaultSortedAddress(Long userId, UserAddressSaveRequest request) {
        List<AddressDTO> addresses = userRepository.findAddresses(userId);
        return addresses.stream()
            .filter(address -> address.consigneeName().equals(request.consigneeName())
                && address.consigneeMobile().equals(request.consigneeMobile())
                && address.detailAddress().equals(request.detailAddress()))
            .findFirst()
            .orElse(addresses.get(0));
    }

    private Long requireCurrentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(CommonResultCode.UNAUTHORIZED);
        }
        return userId;
    }

    private void requireAdmin() {
        requireCurrentUserId();
        if (!UserContext.isAdmin()) {
            throw new BusinessException(CommonResultCode.FORBIDDEN.code(), "Administrator access required");
        }
    }

    private UserBaseDTO getCachedProfile(Long userId) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(profileCacheKey(userId));
            return payload == null ? null : objectMapper.readValue(payload, UserBaseDTO.class);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private List<AddressDTO> getCachedAddresses(Long userId) {
        try {
            String payload = stringRedisTemplate.opsForValue().get(addressCacheKey(userId));
            return payload == null ? null : objectMapper.readValue(payload, ADDRESS_LIST_TYPE);
        } catch (JsonProcessingException | DataAccessException ex) {
            return null;
        }
    }

    private void cacheProfile(UserBaseDTO user) {
        try {
            stringRedisTemplate.opsForValue().set(profileCacheKey(user.userId()), objectMapper.writeValueAsString(user), PROFILE_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void cacheAddresses(Long userId, List<AddressDTO> addresses) {
        try {
            stringRedisTemplate.opsForValue().set(addressCacheKey(userId), objectMapper.writeValueAsString(addresses), ADDRESS_CACHE_TTL);
        } catch (JsonProcessingException | DataAccessException ignored) {
        }
    }

    private void evictProfileCache(Long userId) {
        try {
            stringRedisTemplate.delete(profileCacheKey(userId));
        } catch (DataAccessException ignored) {
        }
    }

    private void evictAddressCache(Long userId) {
        try {
            stringRedisTemplate.delete(addressCacheKey(userId));
        } catch (DataAccessException ignored) {
        }
    }

    private String profileCacheKey(Long userId) {
        return "mall:user:profile:" + userId;
    }

    private String addressCacheKey(Long userId) {
        return "mall:user:addresses:" + userId;
    }
}
