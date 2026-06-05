package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.reservation.Reservation;
import web.mvc.domain.reservation.ReservationStatus;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReservationResponseDto {

    private Integer id;
    private Integer resourceId;
    private String resourceName;
    private String resourceLocation;
    private Integer userId;
    private String userName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;

    public static ReservationResponseDto from(Reservation reservation) {
        return ReservationResponseDto.builder()
                .id(reservation.getId())
                .resourceId(reservation.getResource().getId())
                .resourceName(reservation.getResource().getName())
                .resourceLocation(reservation.getResource().getLocation())
                .userId(reservation.getUser().getId())
                .userName(reservation.getUser().getName())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .build();
    }
}