package web.mvc.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import web.mvc.jwt.JwtAuthenticationFilter;
import web.mvc.jwt.JwtTokenProvider;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    // =====================
    // Security Filter Chain
    // =====================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF 비활성화 (JWT 사용하므로 불필요)
            .csrf(AbstractHttpConfigurer::disable)

            // 2. CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. 세션 미사용 (JWT Stateless)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. URL별 접근 권한 설정
            .authorizeHttpRequests(auth -> auth

                    .requestMatchers("/images/**").permitAll()

                    // 인증 없이 허용 (로그인, Swagger)
                    .requestMatchers(
                            "/api/v1/auth/**",
                            "/v3/api-docs/**",
                            "/swagger-ui/**",
                            "/swagger-ui.html"
                    ).permitAll()

                    // 관리자 전용
                    .requestMatchers("/api/v1/admin/**")
                            .hasAuthority("ROLE_ADMIN")

                    // 자원 조회 - 인증된 유저 전체 허용
                    .requestMatchers(HttpMethod.GET, "/api/v1/resources/**")
                            .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                    // 예약 - 인증된 유저 전체 허용
                    .requestMatchers("/api/v1/reservations/**")
                            .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                    // 그 외 모든 요청 인증 필요
                    .anyRequest().authenticated()


            )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\":false,\"data\":null,\"message\":\"인증이 필요합니다.\"}");
                        })
                )

            // 5. JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 등록
            .addFilterBefore(
                    new JwtAuthenticationFilter(tokenProvider),
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =====================
    // CORS 설정
    // React (localhost:3000) 허용
    // =====================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 허용할 Origin (React 개발 서버)
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));

        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // 허용할 헤더
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        // 인증 정보 포함 허용 (쿠키, Authorization 헤더)
        config.setAllowCredentials(true);

        // 모든 경로에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // =====================
    // BCrypt 비밀번호 암호화
    // =====================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
