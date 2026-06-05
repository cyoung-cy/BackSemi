package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.mvc.dto.response.ApiResponse;
import web.mvc.service.ResourceService;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // 전체 자원 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllResources() {
        return ResponseEntity.ok(
                ApiResponse.success(resourceService.getAllResources())
        );
    }

    // 특정 자원 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getResource(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ApiResponse.success(resourceService.getResource(id))
        );
    }
}