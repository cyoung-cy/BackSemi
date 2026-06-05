package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.user.User;

@Getter
@Builder
public class SignupResponseDto {

    private Integer userId;
    private String email;
    private String name;
    private String role;
    private String position;

    public static SignupResponseDto from(User user) {
        return SignupResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .position(user.getPosition().name())
                .build();
    }
}