package web.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import web.mvc.domain.reservation.Reservation;
import web.mvc.domain.reservation.ReservationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    // 내 예약 내역 조회 (유저, 자원 Fetch Join - N+1 방지)
    // 내 예약 목록에서 유저+자원 한번에
    @Query("select r from Reservation r " +
           "join fetch r.user " +
           "join fetch r.resource " +
           "where r.user.id = :userId")
    List<Reservation> findAllByUserIdWithFetchJoin(@Param("userId") Integer userId);

    // 특정 자원의 날짜별 예약 현황 조회 (취소 제외)
    // 자원 예약 현황에서 예약자 정보 한번에
    @Query("select r from Reservation r " +
           "join fetch r.user " +
           "where r.resource.id = :resourceId " +
           "and r.status = :status " +
           "and r.startTime >= :startOfDay " +
           "and r.startTime < :endOfDay")
    List<Reservation> findByResourceIdAndDate(
            @Param("resourceId") Integer resourceId,
            @Param("status") ReservationStatus status,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    // 중복 예약 검증 (동시성 체크)
    // 새 예약의 시간대가 기존 예약과 겹치는지 확인
    /**
     * 새 예약:        |--new--|
     * 기존 예약 1:  |--existing--|   ← 겹침
     * 기존 예약 2:      |--existing--|  ← 겹침
     * 기존 예약 3:            |--existing--|  ← 겹침
     *
     * 조건: 기존.startTime < 새.endTime AND 기존.endTime > 새.startTime
     * → 이 조건 하나로 모든 겹침 케이스를 커버
     */
    @Query("select count(r) > 0 from Reservation r " +
           "where r.resource.id = :resourceId " +
           "and r.status = 'RESERVED' " +
           "and r.startTime < :endTime " +
           "and r.endTime > :startTime")
    boolean existsDuplicateReservation(
            @Param("resourceId") Integer resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // 본인 예약 단건 조회 (취소 시 본인 확인용)
    @Query("select r from Reservation r " +
           "join fetch r.resource " +
           "where r.id = :reservationId " +
           "and r.user.id = :userId")
    Optional<Reservation> findByIdAndUserId(
            @Param("reservationId") Integer reservationId,
            @Param("userId") Integer userId
    );

    // 관리자용 전체 예약 조회 (Fetch Join)
    @Query("select r from Reservation r " +
            "join fetch r.user " +
            "join fetch r.resource")
    List<Reservation> findAllWithFetchJoin();

    // 수정 시 본인 예약 제외한 중복 체크
    @Query("select count(r) > 0 from Reservation r " +
            "where r.resource.id = :resourceId " +
            "and r.status = 'RESERVED' " +
            "and r.id != :excludeId " +
            "and r.startTime < :endTime " +
            "and r.endTime > :startTime")
    boolean existsDuplicateReservationExcludeSelf(
            @Param("resourceId") Integer resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Integer excludeId
    );
}