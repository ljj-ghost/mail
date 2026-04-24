package com.mall.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Order(2)
@Component
public class AuthDemoAccountInitializer implements ApplicationRunner {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${mall.auth.demo-password}")
    private String demoPassword;

    public AuthDemoAccountInitializer(AuthRepository authRepository, PasswordEncoder passwordEncoder) {
        this.authRepository = authRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureDemoAccount(1001001L, "demo", "USER", "Mall Demo User");
        ensureDemoAccount(1001001L, "13800138000", "USER", "Mall Demo User");
        ensureDemoAccount(1001001L, "demo@mall.com", "USER", "Mall Demo User");
        ensureDemoAccount(1001002L, "admin", "ADMIN", "Mall Admin Console");
        ensureDemoAccount(1001002L, "13900139000", "ADMIN", "Mall Admin Console");
        ensureDemoAccount(1001002L, "admin@mall.com", "ADMIN", "Mall Admin Console");
    }

    private void ensureDemoAccount(Long userId, String loginName, String roleCode, String remark) {
        authRepository.upsertAccount(userId, 1, loginName, passwordEncoder.encode(demoPassword), 1, roleCode, remark);
    }
}
