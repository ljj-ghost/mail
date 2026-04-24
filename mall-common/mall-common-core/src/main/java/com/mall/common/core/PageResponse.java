package com.mall.common.core;

import java.util.List;

public record PageResponse<T>(List<T> list, long pageNum, long pageSize, long total, long totalPage) {

    public static <T> PageResponse<T> of(List<T> list, long pageNum, long pageSize, long total) {
        long totalPage = pageSize <= 0 ? 0 : (long) Math.ceil((double) total / pageSize);
        return new PageResponse<>(list, pageNum, pageSize, total, totalPage);
    }
}
