package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import web.mvc.dto.request.ReservationRequestDto;
import web.mvc.dto.request.UpdateReservationRequestDto;
import web.mvc.dto.response.ApiResponse;
import web.mvc.service.ReservationService;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // 예약 생성
    // userId는 JWT 토큰에서 추출 예정 (현재는 임시로 @RequestHeader로 받음)
    // JWT 필터 완성 후 SecurityContext에서 꺼내는 방식
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createReservation(
            Authentication authentication,
            @RequestBody ReservationRequestDto dto) {

        // SecurityContext에서 userId 추출
        Integer userId = (Integer) authentication.getPrincipal();

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(
                        reservationService.createReservation(userId, dto),
                        "예약이 완료되었습니다."
                )
        );
    }
    // 내 예약 내역 조회
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMyReservations(Authentication authentication) {

        Integer userId = (Integer) authentication.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.success(reservationService.getMyReservations(userId))
        );
    }

    // 특정 자원 날짜별 예약 현황
    @GetMapping("/resource/{id}")
    public ResponseEntity<ApiResponse<?>> getReservationsByResource(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        reservationService.getReservationsByResource(id, date.atStartOfDay())
                )
        );
    }

    // 예약 취소
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> cancelReservation(
            Authentication authentication,
            @PathVariable Integer id) {

        Integer userId = (Integer) authentication.getPrincipal();

        reservationService.cancelReservation(userId, id);
        return ResponseEntity.ok(
                ApiResponse.success("예약이 취소되었습니다.")
        );
    }

    // 예약 수정
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateReservation(
            Authentication authentication,
            @PathVariable Integer id,
            @RequestBody UpdateReservationRequestDto dto) {

        Integer userId = (Integer) authentication.getPrincipal();

        return ResponseEntity.ok(
                ApiResponse.success(
                        reservationService.updateReservation(userId, id, dto),
                        "예약이 수정되었습니다."
                )
        );
    }
}