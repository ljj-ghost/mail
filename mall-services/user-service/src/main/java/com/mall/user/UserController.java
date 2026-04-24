package com.mall.user;

import com.mall.api.user.AddressDTO;
import com.mall.api.user.AdminUserListItemDTO;
import com.mall.api.user.AdminUserSummaryDTO;
import com.mall.api.user.UserAddressSaveRequest;
import com.mall.api.user.UserBaseDTO;
import com.mall.api.user.UserProfileUpdateRequest;
import com.mall.common.core.CommonResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/v1/users/me")
    public CommonResponse<UserBaseDTO> currentUser() {
        return CommonResponse.success(userService.me());
    }

    @PutMapping("/api/v1/users/profile")
    public CommonResponse<UserBaseDTO> updateProfile(@Valid @RequestBody UserProfileUpdateRequest request) {
        return CommonResponse.success(userService.updateProfile(request));
    }

    @GetMapping("/api/v1/users/addresses")
    public CommonResponse<List<AddressDTO>> addresses() {
        return CommonResponse.success(userService.addresses());
    }

    @PostMapping("/api/v1/users/addresses")
    public CommonResponse<AddressDTO> addAddress(@Valid @RequestBody UserAddressSaveRequest request) {
        return CommonResponse.success(userService.addAddress(request));
    }

    @PutMapping("/api/v1/users/addresses/{addressId}")
    public CommonResponse<AddressDTO> updateAddress(
        @PathVariable("addressId") Long addressId,
        @Valid @RequestBody UserAddressSaveRequest request
    ) {
        return CommonResponse.success(userService.updateAddress(addressId, request));
    }

    @PostMapping("/api/v1/users/addresses/{addressId}/default")
    public CommonResponse<Boolean> setDefaultAddress(@PathVariable("addressId") Long addressId) {
        return CommonResponse.success(userService.setDefaultAddress(addressId));
    }

    @DeleteMapping("/api/v1/users/addresses/{addressId}")
    public CommonResponse<Boolean> deleteAddress(@PathVariable("addressId") Long addressId) {
        return CommonResponse.success(userService.deleteAddress(addressId));
    }

    @GetMapping("/api/v1/admin/users/summary")
    public CommonResponse<AdminUserSummaryDTO> adminSummary() {
        return CommonResponse.success(userService.adminSummary());
    }

    @GetMapping("/api/v1/admin/users")
    public CommonResponse<List<AdminUserListItemDTO>> adminUsers(
        @RequestParam(name = "limit", defaultValue = "8") @Min(1) @Max(20) Integer limit
    ) {
        return CommonResponse.success(userService.adminUsers(limit));
    }

    @GetMapping("/internal/v1/users/{userId}")
    public CommonResponse<UserBaseDTO> getUser(@PathVariable("userId") Long userId) {
        return CommonResponse.success(userService.getUser(userId));
    }

    @GetMapping("/internal/v1/users/{userId}/default-address")
    public CommonResponse<AddressDTO> getDefaultAddress(@PathVariable("userId") Long userId) {
        return CommonResponse.success(userService.getDefaultAddress(userId));
    }
}
