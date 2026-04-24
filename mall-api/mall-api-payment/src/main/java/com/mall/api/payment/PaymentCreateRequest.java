package com.mall.api.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentCreateRequest(@NotBlank String orderNo, @NotNull Integer payChannel) {
}
