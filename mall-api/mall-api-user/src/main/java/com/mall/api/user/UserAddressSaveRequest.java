package com.mall.api.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserAddressSaveRequest(
    @NotBlank @Size(max = 32) String consigneeName,
    @NotBlank @Pattern(regexp = "^1\\d{10}$") String consigneeMobile,
    @NotBlank @Size(max = 255) String detailAddress,
    Boolean defaultAddress
) {
}
