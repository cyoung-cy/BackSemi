package web.mvc.domain.reservation;

import jakarta.persistence.*;
import lombok.*;
import web.mvc.domain.BaseTimeEntity;
import web.mvc.domain.resource.Resource;
import web.mvc.domain.user.User;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "reservation",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_reservation_resource_time",
            columnNames = {"resource_id", "start_time", "end_time"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Integer id;

    // 비식별 관계 - USER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 비식별 관계 - RESOURCE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private ReservationStatus status;

    @Builder
    public Reservation(User user, Resource resource,
                       LocalDateTime startTime, LocalDateTime endTime) {
        this.user = user;
        this.resource = resource;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = ReservationStatus.RESERVED; // 생성 시 항상 RESERVED
    }

    // 예약 취소 (상태만 변경 - soft delete)
    public void cancel() {
        if (this.status == ReservationStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }
        this.status = ReservationStatus.CANCELED;
    }

    // 예약 시간 수정
    public void updateTime(LocalDateTime startTime, LocalDateTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }
}