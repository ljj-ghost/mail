package com.mall.product;

import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Component
class ProductCacheEvictor {

    private static final String PRODUCT_CACHE_PATTERN = "mall:product:*";
    private static final int SCAN_COUNT = 500;

    private final StringRedisTemplate stringRedisTemplate;

    ProductCacheEvictor(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    void evictAll() {
        List<String> batch = new ArrayList<>(SCAN_COUNT);
        ScanOptions options = ScanOptions.scanOptions().match(PRODUCT_CACHE_PATTERN).count(SCAN_COUNT).build();
        try (Cursor<String> cursor = stringRedisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                batch.add(cursor.next());
                if (batch.size() >= SCAN_COUNT) {
                    deleteBatch(batch);
                }
            }
            deleteBatch(batch);
        } catch (DataAccessException ignored) {
        }
    }

    private void deleteBatch(List<String> keys) {
        if (keys.isEmpty()) {
            return;
        }
        stringRedisTemplate.delete(new LinkedHashSet<>(keys));
        keys.clear();
    }
}
