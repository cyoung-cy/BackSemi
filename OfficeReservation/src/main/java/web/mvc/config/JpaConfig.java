package web.mvc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // @EnableJpaAuditing을 여기로 분리한 이유:
    // @SpringBootApplication에 붙이면 @WebMvcTest 슬라이스 테스트 시
    // JPA Auditing이 없다고 오류나는 문제를 방지
}