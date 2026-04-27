package com.mall.api.user;

/**
 * 用户相关接口共享的收货地址视图。
 */
public record AddressDTO(
    Long id,
    Long userId,
    String consigneeName,
    String consigneeMobile,
    String detailAddress,
    Boolean defaultAddress
) {
}

