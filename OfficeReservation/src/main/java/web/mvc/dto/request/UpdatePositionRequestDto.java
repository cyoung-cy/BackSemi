package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import web.mvc.domain.user.Position;

@Getter
@NoArgsConstructor
public class UpdatePositionRequestDto {

    private Position position;
}