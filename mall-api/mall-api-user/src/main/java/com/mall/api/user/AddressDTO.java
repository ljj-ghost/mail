package com.mall.api.user;

public record AddressDTO(
    Long id,
    Long userId,
    String consigneeName,
    String consigneeMobile,
    String detailAddress,
    Boolean defaultAddress
) {
}
