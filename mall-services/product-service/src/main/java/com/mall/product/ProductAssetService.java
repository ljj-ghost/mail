package com.mall.product;

import com.mall.common.core.BusinessException;
import com.mall.common.core.CommonResultCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductAssetService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        MediaType.IMAGE_JPEG_VALUE,
        MediaType.IMAGE_PNG_VALUE,
        "image/webp",
        MediaType.IMAGE_GIF_VALUE
    );

    private final Path assetRoot;

    public ProductAssetService(@Value("${mall.product.asset-dir:deploy/uploads/product-images}") String assetDir) {
        try {
            this.assetRoot = Path.of(assetDir).toAbsolutePath().normalize();
            Files.createDirectories(this.assetRoot);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to initialize product asset directory", ex);
        }
    }

    public ProductImageUploadResponse storeProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Image file is required");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Only JPG, PNG, WEBP or GIF images are supported");
        }

        String extension = resolveExtension(file.getOriginalFilename(), contentType);
        String fileName = "product-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12) + extension;
        Path target = resolveAssetPath(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException(CommonResultCode.BUSINESS_ERROR.code(), "Save product image failed");
        }

        return new ProductImageUploadResponse(fileName, "/api/v1/products/assets/" + fileName);
    }

    public ResponseEntity<Resource> loadProductImage(String fileName) {
        Path filePath = resolveAssetPath(fileName);
        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            MediaType mediaType = MediaTypeFactory.getMediaType(fileName).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .contentType(mediaType)
                .body(resource);
        } catch (IOException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private Path resolveAssetPath(String fileName) {
        String normalizedFileName = Path.of(fileName).getFileName().toString();
        if (normalizedFileName.isBlank() || normalizedFileName.contains("..")) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Invalid image file name");
        }

        Path resolved = assetRoot.resolve(normalizedFileName).normalize();
        if (!resolved.startsWith(assetRoot)) {
            throw new BusinessException(CommonResultCode.BAD_REQUEST.code(), "Invalid image file name");
        }
        return resolved;
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveExtension(String originalFileName, String contentType) {
        if (originalFileName != null) {
            String trimmed = originalFileName.trim();
            int dotIndex = trimmed.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < trimmed.length() - 1) {
                String candidate = "." + trimmed.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
                if (candidate.equals(".jpg") || candidate.equals(".jpeg") || candidate.equals(".png")
                    || candidate.equals(".webp") || candidate.equals(".gif")) {
                    return candidate;
                }
            }
        }

        return switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_GIF_VALUE -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".png";
        };
    }
}
