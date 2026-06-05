package web.mvc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import web.mvc.domain.resource.Room;
import web.mvc.domain.user.Position;
import web.mvc.domain.user.Provider;
import web.mvc.domain.user.Role;
import web.mvc.domain.user.User;
import web.mvc.dto.request.ReservationRequestDto;
import web.mvc.jwt.JwtTokenProvider;
import web.mvc.repository.ResourceRepository;
import web.mvc.repository.UserRepository;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReservationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired ResourceRepository resourceRepository;
    @Autowired JwtTokenProvider jwtTokenProvider;

    private String userToken;
    private String adminToken;
    private Integer roomId;  // Long → Integer

    @BeforeEach
    void setUp() {
        // 일반 유저 생성
        User user = userRepository.save(User.builder()
                .email("user@test.com")
                .name("테스트유저")
                .role(Role.ROLE_USER)
                .position(Position.ASSISTANT)
                .provider(Provider.LOCAL)
                .build());

        // 관리자 생성
        User admin = userRepository.save(User.builder()
                .email("admin@test.com")
                .name("관리자")
                .role(Role.ROLE_ADMIN)
                .position(Position.EXECUTIVE)
                .provider(Provider.LOCAL)
                .build());

        // 회의실 생성
        Room room = (Room) resourceRepository.save(Room.builder()
                .name("제1회의실")
                .location("3층 A구역")
                .minPosition(Position.ASSISTANT)
                .capacity(10)
                .hasBoard(true)
                .build());

        roomId = room.getId();  // Integer

        // generateToken(User) 사용
        userToken  = "Bearer " + jwtTokenProvider.generateToken(user).getAccessToken();
        adminToken = "Bearer " + jwtTokenProvider.generateToken(admin).getAccessToken();
    }

    @Test
    @DisplayName("예약 생성 성공")
    void createReservation_success() throws Exception {
        ReservationRequestDto request = new ReservationRequestDto(
                roomId,
                // 2025 → 2027로 변경 (현재 2026년이므로)
                LocalDateTime.of(2027, 7, 1, 9, 0),
                LocalDateTime.of(2027, 7, 1, 10, 30)
        );

        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("RESERVED"));
    }

    @Test
    @DisplayName("중복 예약 시 400 반환")
    void createReservation_duplicate_fail() throws Exception {
        ReservationRequestDto request = new ReservationRequestDto(
                roomId,
                // 2025 → 2027로 변경 (현재 2026년이므로)
                LocalDateTime.of(2027, 7, 1, 9, 0),
                LocalDateTime.of(2027, 7, 1, 10, 30)
        );

        // 첫 번째 예약
        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // 중복 예약 시도
        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("토큰 없이 예약 시 401 반환")
    void createReservation_noToken_fail() throws Exception {
        ReservationRequestDto request = new ReservationRequestDto(
                roomId,
                LocalDateTime.of(2025, 7, 1, 9, 0),
                LocalDateTime.of(2025, 7, 1, 10, 30)
        );

        mockMvc.perform(post("/api/v1/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("내 예약 목록 조회 성공")
    void getMyReservations_success() throws Exception {
        mockMvc.perform(get("/api/v1/reservations/me")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}