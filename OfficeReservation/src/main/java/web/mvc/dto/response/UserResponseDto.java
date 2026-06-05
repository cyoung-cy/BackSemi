package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.user.Position;
import web.mvc.domain.user.Provider;
import web.mvc.domain.user.Role;
import web.mvc.domain.user.User;

@Getter
@Builder
public class UserResponseDto {

    private Integer id;
    private String email;
    private String name;
    private Role role;
    private Position position;
    private Provider provider;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .position(user.getPosition())
                .provider(user.getProvider())
                .build();
    }
}