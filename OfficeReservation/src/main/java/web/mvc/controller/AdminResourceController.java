package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.mvc.dto.request.EquipmentRequestDto;
import web.mvc.dto.request.RoomRequestDto;
import web.mvc.dto.response.ApiResponse;
import web.mvc.service.ResourceService;

@RestController
@RequestMapping("/api/v1/admin/resources")
@RequiredArgsConstructor
public class AdminResourceController {

    private final ResourceService resourceService;

    // 회의실 등록
    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<?>> createRoom(@RequestBody RoomRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(resourceService.createRoom(dto), "회의실이 등록되었습니다.")
        );
    }

    // 장비 등록
    @PostMapping("/equipments")
    public ResponseEntity<ApiResponse<?>> createEquipment(@RequestBody EquipmentRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(resourceService.createEquipment(dto), "장비가 등록되었습니다.")
        );
    }

    // 회의실 수정
    @PutMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<?>> updateRoom(
            @PathVariable Integer id,
            @RequestBody RoomRequestDto dto) {
        return ResponseEntity.ok(
                ApiResponse.success(resourceService.updateRoom(id, dto), "회의실 정보가 수정되었습니다.")
        );
    }

    // 장비 수정
    @PutMapping("/equipments/{id}")
    public ResponseEntity<ApiResponse<?>> updateEquipment(
            @PathVariable Integer id,
            @RequestBody EquipmentRequestDto dto) {
        return ResponseEntity.ok(
                ApiResponse.success(resourceService.updateEquipment(id, dto), "장비 정보가 수정되었습니다.")
        );
    }

    // 자원 삭제 (Room, Equipment 공통)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteResource(@PathVariable Integer id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(
                ApiResponse.success("자원이 삭제되었습니다.")
        );
    }
}