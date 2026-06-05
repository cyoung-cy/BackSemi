package web.mvc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.mvc.domain.reservation.Reservation;
import web.mvc.domain.user.Provider;
import web.mvc.domain.user.Role;
import web.mvc.domain.user.User;
import web.mvc.dto.request.LocalLoginRequestDto;
import web.mvc.dto.request.UpdatePositionRequestDto;
import web.mvc.dto.response.ReservationResponseDto;
import web.mvc.dto.response.UserResponseDto;
import web.mvc.jwt.JwtTokenDto;
import web.mvc.jwt.JwtTokenProvider;
import web.mvc.repository.ReservationRepository;
import web.mvc.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    // 전체 유저 목록 조회
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponseDto::from)
                .collect(Collectors.toList());
    }

    // 유저 직급 변경
    @Transactional
    public UserResponseDto updateUserPosition(Integer userId,
                                              UpdatePositionRequestDto dto) {
        if (dto.getPosition() == null) {
            throw new IllegalArgumentException("변경할 직급을 입력해주세요.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        user.updatePosition(dto.getPosition());

        return UserResponseDto.from(user);
    }

    // 전체 예약 현황 조회
    public List<ReservationResponseDto> getAllReservations() {
        return reservationRepository.findAllWithFetchJoin()
                .stream()
                .map(ReservationResponseDto::from)
                .collect(Collectors.toList());
    }

    // 예약 강제 취소
    @Transactional
    public void forcecancelReservation(Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        reservation.cancel();
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