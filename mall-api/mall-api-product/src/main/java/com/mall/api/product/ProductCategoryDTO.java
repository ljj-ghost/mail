package com.mall.api.product;

public record ProductCategoryDTO(Long categoryId, Long parentId, String categoryName, Integer sort) {
}
