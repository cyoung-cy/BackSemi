package web.mvc.domain.user;

import jakarta.persistence.*;
import lombok.*;
import web.mvc.domain.BaseTimeEntity;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {})
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 15)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false, length = 15)
    private Position position;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 10)
    private Provider provider;

    @Column(name = "password", nullable = true, length = 255)
    private String password;

    @Builder
    public User(String email, String name, Role role,
                Position position, Provider provider, String password) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.position = position;
        this.provider = provider;
        this.password = password; // 소셜 로그인이면 null
    }

    // 관리자가 직급 변경 시 사용
    public void updatePosition(Position position) {
        this.position = position;
    }

    // 관리자가 역할 변경 시 사용
    public void updateRole(Role role) {
        this.role = role;
    }
}