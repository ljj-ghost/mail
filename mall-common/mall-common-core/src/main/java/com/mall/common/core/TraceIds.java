package com.mall.common.core;

import java.util.UUID;

/**
 * 生成附加在接口响应和日志中的链路追踪标识。
 */
public final class TraceIds {

    private TraceIds() {
    }

    public static String newTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}

