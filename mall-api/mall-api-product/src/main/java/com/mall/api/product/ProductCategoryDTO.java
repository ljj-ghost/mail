package com.mall.api.product;

/**
 * 暴露给前台和管理员调用方的商品分类树节点。
 */
public record ProductCategoryDTO(Long categoryId, Long parentId, String categoryName, Integer sort) {
}

