package com.mall.product.controller;

import com.mall.api.product.dto.AdminProductSummaryDTO;
import com.mall.api.product.dto.ProductCategoryDTO;
import com.mall.api.product.dto.ProductSkuCardDTO;
import com.mall.api.product.dto.ProductSkuDetailDTO;
import com.mall.api.product.dto.SkuBaseDTO;
import com.mall.common.core.CommonResponse;
import com.mall.common.security.UserContext;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.mall.product.model.dto.AdminProductDetailDTO;
import com.mall.product.model.request.AdminProductSaveRequest;
import com.mall.product.model.response.ProductImageUploadResponse;
import com.mall.product.service.ProductAssetService;
import com.mall.product.service.ProductService;


import java.util.List;

@Validated
@RestController
@RequestMapping
/**
 * 暴露前台商城和管理员商品接口。
 */
public class ProductController {

    private final ProductService productService;
    private final ProductAssetService productAssetService;

    public ProductController(ProductService productService, ProductAssetService productAssetService) {
        this.productService = productService;
        this.productAssetService = productAssetService;
    }

    @GetMapping("/api/v1/products/recommend")
    public CommonResponse<List<ProductSkuCardDTO>> recommend(
        @RequestParam(name = "limit", defaultValue = "6") @Min(1) Integer limit
    ) {
        return CommonResponse.success(productService.recommend(limit));
    }

    @GetMapping("/api/v1/products")
    public CommonResponse<List<ProductSkuCardDTO>> catalog(
        @RequestParam(name = "categoryId", required = false) Long categoryId,
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "limit", defaultValue = "12") @Min(1) Integer limit
    ) {
        return CommonResponse.success(productService.catalog(categoryId, keyword, limit));
    }

    @GetMapping("/api/v1/products/categories")
    public CommonResponse<List<ProductCategoryDTO>> categories() {
        return CommonResponse.success(productService.categories());
    }

    @GetMapping("/api/v1/admin/products/summary")
    public CommonResponse<AdminProductSummaryDTO> adminSummary() {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.adminSummary());
    }

    @GetMapping("/api/v1/admin/products")
    public CommonResponse<List<ProductSkuCardDTO>> adminCatalog(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "status", required = false) Integer status,
        @RequestParam(name = "limit", defaultValue = "20") @Min(1) Integer limit
    ) {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.adminCatalog(keyword, status, limit));
    }

    @GetMapping("/api/v1/admin/products/{skuId}")
    public CommonResponse<AdminProductDetailDTO> adminSku(@PathVariable("skuId") Long skuId) {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.adminSkuDetail(skuId));
    }

    @PostMapping("/api/v1/admin/products")
    public CommonResponse<AdminProductDetailDTO> createAdminProduct(@RequestBody @Validated AdminProductSaveRequest request) {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.createAdminProduct(request));
    }

    @PostMapping(value = "/api/v1/admin/products/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommonResponse<ProductImageUploadResponse> uploadAdminProductImage(@RequestPart("file") MultipartFile file) {
        UserContext.requireAdmin();
        return CommonResponse.success(productAssetService.storeProductImage(file));
    }

    @PutMapping("/api/v1/admin/products/{skuId}")
    public CommonResponse<AdminProductDetailDTO> updateAdminProduct(
        @PathVariable("skuId") Long skuId,
        @RequestBody @Validated AdminProductSaveRequest request
    ) {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.updateAdminProduct(skuId, request));
    }

    @DeleteMapping("/api/v1/admin/products/{skuId}")
    public CommonResponse<Boolean> deleteAdminProduct(@PathVariable("skuId") Long skuId) {
        UserContext.requireAdmin();
        return CommonResponse.success(productService.deleteAdminProduct(skuId));
    }

    @GetMapping("/api/v1/products/sku/{skuId}")
    public CommonResponse<ProductSkuDetailDTO> getSku(@PathVariable("skuId") Long skuId) {
        return CommonResponse.success(productService.skuDetail(skuId));
    }

    @GetMapping("/api/v1/products/spu/{spuId}/skus")
    public CommonResponse<List<ProductSkuCardDTO>> spuSkus(@PathVariable("spuId") Long spuId) {
        return CommonResponse.success(productService.spuSkus(spuId));
    }

    @GetMapping("/api/v1/products/assets/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> productAsset(@PathVariable("fileName") String fileName) {
        return productAssetService.loadProductImage(fileName);
    }

    @GetMapping("/internal/v1/products/skus/{skuId}")
    public CommonResponse<SkuBaseDTO> getInternalSku(@PathVariable("skuId") Long skuId) {
        return CommonResponse.success(productService.internalSku(skuId));
    }

    @PostMapping("/internal/v1/products/skus/batch")
    public CommonResponse<List<SkuBaseDTO>> batchSku(@RequestBody List<Long> skuIds) {
        return CommonResponse.success(productService.batchSkus(skuIds));
    }
}

