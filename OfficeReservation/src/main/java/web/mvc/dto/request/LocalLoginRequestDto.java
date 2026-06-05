package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LocalLoginRequestDto {

    private String email;
    private String password;
}