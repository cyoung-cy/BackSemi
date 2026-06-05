package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.mvc.dto.request.UpdatePositionRequestDto;
import web.mvc.dto.response.ApiResponse;
import web.mvc.service.AdminService;
import web.mvc.service.AuthService;
import web.mvc.dto.request.LocalLoginRequestDto;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    // 관리자 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> adminLogin(@RequestBody LocalLoginRequestDto dto) {
        return ResponseEntity.ok(
                ApiResponse.success(authService.adminLogin(dto), "관리자 로그인 성공")
        );
    }

    // 전체 유저 목록 조회
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllUsers())
        );
    }

    // 유저 직급 변경
    @PutMapping("/users/{userId}/position")
    public ResponseEntity<ApiResponse<?>> updateUserPosition(
            @PathVariable Integer userId,
            @RequestBody UpdatePositionRequestDto dto) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.updateUserPosition(userId, dto),
                        "직급이 변경되었습니다."
                )
        );
    }

    // 전체 예약 현황 조회
    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<?>> getAllReservations() {
        return ResponseEntity.ok(
                ApiResponse.success(adminService.getAllReservations())
        );
    }

    // 예약 강제 취소
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<ApiResponse<?>> forceCancel(@PathVariable Integer id) {
        adminService.forcecancelReservation(id);
        return ResponseEntity.ok(
                ApiResponse.success("예약이 강제 취소되었습니다.")
        );
    }
}