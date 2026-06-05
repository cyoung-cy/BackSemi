package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class UpdateReservationRequestDto {

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}