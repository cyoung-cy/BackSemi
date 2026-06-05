package web.mvc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.mvc.domain.user.Position;
import web.mvc.domain.user.Provider;
import web.mvc.domain.user.Role;
import web.mvc.domain.user.User;
import web.mvc.dto.request.LocalLoginRequestDto;
import web.mvc.dto.request.SignupRequestDto;
import web.mvc.dto.response.SignupResponseDto;
import web.mvc.jwt.JwtTokenDto;
import web.mvc.jwt.JwtTokenProvider;
import web.mvc.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public JwtTokenDto localLogin(LocalLoginRequestDto dto) {

        // 1. 이메일 조회
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 2. 소셜 로그인 계정 차단
        if (user.getProvider() != Provider.LOCAL) {
            throw new IllegalArgumentException("소셜 로그인 계정입니다.");
        }

        // 3. 비밀번호 검증
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 4. JWT 토큰 생성 후 반환
        return tokenProvider.generateToken(user);
    }

    // 회원가입
    @Transactional
    public SignupResponseDto signup(SignupRequestDto dto) {

        // 1. 이메일 중복 체크
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 2. 직급 파싱
        Position position;
        try {
            position = Position.valueOf(dto.getPosition());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("올바르지 않은 직급입니다. (ASSISTANT / MANAGER / EXECUTIVE)");
        }

        // 3. 유저 생성
        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .role(Role.ROLE_USER)       // 기본값 고정
                .position(position)
                .provider(Provider.LOCAL)
                .build();

        userRepository.save(user);

        return SignupResponseDto.from(user);
    }


    public JwtTokenDto adminLogin(LocalLoginRequestDto dto) {

        // 1. 이메일 조회
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 2. 관리자 계정 여부 확인
        if (user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("관리자 계정이 아닙니다.");
        }

        // 3. LOCAL provider 여부 확인
        if (user.getProvider() != Provider.LOCAL) {
            throw new IllegalArgumentException("소셜 로그인 계정입니다.");
        }

        // 4. 비밀번호 검증
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        // 5. JWT 토큰 생성 후 반환
        return tokenProvider.generateToken(user);
    }
}