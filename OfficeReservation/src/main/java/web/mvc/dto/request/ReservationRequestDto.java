package web.mvc.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDto {

    private Integer resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}