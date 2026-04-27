package com.mall.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
/**
 * 声明本地开发环境下网关使用的路由表。
 */
public class GatewayRoutesConfig {

    @Value("${services.auth.url}")
    private String authServiceUrl;

    @Value("${services.user.url}")
    private String userServiceUrl;

    @Value("${services.product.url}")
    private String productServiceUrl;

    @Value("${services.inventory.url}")
    private String inventoryServiceUrl;

    @Value("${services.cart.url}")
    private String cartServiceUrl;

    @Value("${services.order.url}")
    private String orderServiceUrl;

    @Value("${services.payment.url}")
    private String paymentServiceUrl;

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("auth-service", r -> r.path("/api/v1/auth/**").uri(authServiceUrl))
            .route("user-service", r -> r.path("/api/v1/users/**").uri(userServiceUrl))
            .route("admin-user-service", r -> r.path("/api/v1/admin/users/**").uri(authServiceUrl))
            .route("product-service", r -> r.path("/api/v1/products/**").uri(productServiceUrl))
            .route("admin-product-service", r -> r.path("/api/v1/admin/products/**").uri(productServiceUrl))
            .route("admin-inventory-service", r -> r.path("/api/v1/admin/inventory/**").uri(inventoryServiceUrl))
            .route("cart-service", r -> r.path("/api/v1/cart/**").uri(cartServiceUrl))
            .route("order-service", r -> r.path("/api/v1/orders/**").uri(orderServiceUrl))
            .route("admin-order-service", r -> r.path("/api/v1/admin/orders/**").uri(orderServiceUrl))
            .route("payment-service", r -> r.path("/api/v1/payments/**").uri(paymentServiceUrl))
            .build();
    }
}

