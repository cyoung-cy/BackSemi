package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequestDto {

    private String email;
    private String password;
    private String name;
    private String position; // ASSISTANT / MANAGER / EXECUTIVE
}