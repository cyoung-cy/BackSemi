package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.mvc.dto.response.ApiResponse;
import web.mvc.service.ImageService;

@RestController
@RequestMapping("/api/v1/admin/resources")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    // 이미지 업로드
    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<?>> uploadImage(
            @PathVariable Integer id,
            @RequestPart("image") MultipartFile file) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        imageService.uploadImage(id, file),
                        "이미지가 업로드되었습니다."
                )
        );
    }

    // 이미지 삭제
    @DeleteMapping("/{id}/image")
    public ResponseEntity<ApiResponse<?>> deleteImage(@PathVariable Integer id) {
        imageService.deleteImage(id);
        return ResponseEntity.ok(
                ApiResponse.success("이미지가 삭제되었습니다.")
        );
    }
}