package web.mvc.jwt;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.user.Position;
import web.mvc.domain.user.Role;

@Getter
@Builder
public class JwtTokenDto {

    private String accessToken;
    private String tokenType;
    private Integer userId;
    private String email;
    private String name;
    private Role role;
    private Position position;
}