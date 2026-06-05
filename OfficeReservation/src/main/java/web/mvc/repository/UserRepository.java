package web.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import web.mvc.domain.user.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    // 소셜 로그인 / 자체 로그인 시 이메일로 유저 조회
    Optional<User> findByEmail(String email);

    // 이메일 중복 체크
    boolean existsByEmail(String email);
}