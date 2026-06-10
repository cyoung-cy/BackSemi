package web.mvc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.mvc.domain.reservation.Reservation;
import web.mvc.domain.reservation.ReservationStatus;
import web.mvc.domain.resource.Resource;
import web.mvc.domain.user.User;
import web.mvc.dto.request.ReservationRequestDto;
import web.mvc.dto.request.UpdateReservationRequestDto;
import web.mvc.dto.response.ReservationResponseDto;
import web.mvc.repository.ReservationRepository;
import web.mvc.repository.ResourceRepository;
import web.mvc.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    // 예약 생성
    @Transactional
    public ReservationResponseDto createReservation(Integer userId, ReservationRequestDto dto) {

        validateReservationRequest(dto);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 락을 거는 findByIdWithLock
        // A가 이 자원에 락을 걸면 B는 A 트랜잭션이 끝날 때까지 여기서 대기
        Resource resource = resourceRepository.findByIdWithLock(dto.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        if (user.getPosition().compareTo(resource.getMinPosition()) < 0) {
            throw new IllegalStateException("이 자원을 예약할 직급 권한이 부족합니다.");
        }

        boolean isDuplicate = reservationRepository.existsDuplicateReservation(
                dto.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (isDuplicate) {
            throw new IllegalStateException("선택한 시간대에 이미 예약이 존재합니다.");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .resource(resource)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();

        reservationRepository.save(reservation);

        return ReservationResponseDto.from(reservation);
    }

    // 내 예약 내역 조회
    public List<ReservationResponseDto> getMyReservations(Integer userId) {
        return reservationRepository.findAllByUserIdWithFetchJoin(userId)
                .stream()
                .map(ReservationResponseDto::from)
                .collect(Collectors.toList());
    }

    // 특정 자원의 날짜별 예약 현황 조회
    public List<ReservationResponseDto> getReservationsByResource(Integer resourceId, LocalDateTime date) {

        // 해당 날짜의 시작(00:00:00) ~ 끝(23:59:59) 범위 설정
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return reservationRepository.findByResourceIdAndDate(
                        resourceId,
                        ReservationStatus.RESERVED,
                        startOfDay,
                        endOfDay
                )
                .stream()
                .map(ReservationResponseDto::from)
                .collect(Collectors.toList());
    }

    // 예약 취소
    @Transactional
    public void cancelReservation(Integer userId, Integer reservationId) {

        // 본인 예약인지 DB 레벨에서 확인
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없거나 본인의 예약이 아닙니다."));

        // 엔티티 내부 cancel() 메서드로 상태 변경 (이미 취소된 예약 예외 처리 포함)
        reservation.cancel();
    }

    // 예약 수정
    @Transactional
    public ReservationResponseDto updateReservation(Integer userId,
                                                    Integer reservationId,
                                                    UpdateReservationRequestDto dto) {
        // 1. 요청값 검증
        validateUpdateRequest(dto);

        // 2. 본인 예약 조회
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "예약을 찾을 수 없거나 본인의 예약이 아닙니다."));

        // 3. 취소된 예약 수정 불가
        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new IllegalStateException("취소된 예약은 수정할 수 없습니다.");
        }

        // 4. 중복 예약 검증 (본인 예약 제외)
        boolean isDuplicate = reservationRepository.existsDuplicateReservationExcludeSelf(
                reservation.getResource().getId(),
                dto.getStartTime(),
                dto.getEndTime(),
                reservationId
        );

        if (isDuplicate) {
            throw new IllegalStateException("선택한 시간대에 이미 예약이 존재합니다.");
        }

        // 5. 예약 시간 수정
        reservation.updateTime(dto.getStartTime(), dto.getEndTime());

        return ReservationResponseDto.from(reservation);
    }

    // =====================
    // 예약 생성 검증
    // =====================
    private void validateReservationRequest(ReservationRequestDto dto) {
        if (dto.getResourceId() == null) {
            throw new IllegalArgumentException("자원 ID를 입력해주세요.");
        }
        // 공통 시간 검증으로 위임
        validateTimeRange(dto.getStartTime(), dto.getEndTime());
    }

    // =====================
    // 예약 수정 검증
    // =====================
    private void validateUpdateRequest(UpdateReservationRequestDto dto) {
        // 공통 시간 검증으로 위임
        validateTimeRange(dto.getStartTime(), dto.getEndTime());
    }
    // =====================
    // 공통 시간 검증
    // =====================
    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null) {
            throw new IllegalArgumentException("예약 시작 시간을 입력해주세요.");
        }
        if (endTime == null) {
            throw new IllegalArgumentException("예약 종료 시간을 입력해주세요.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("시작 시간은 종료 시간보다 이전이어야 합니다.");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("예약 시작 시간은 현재 시간 이후여야 합니다.");
        }
        if (startTime.getMinute() % 30 != 0 || endTime.getMinute() % 30 != 0) {
            throw new IllegalArgumentException("예약 시간은 30분 단위로 설정해주세요.");
        }
    }
}