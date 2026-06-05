package web.mvc.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.mvc.dto.request.LocalLoginRequestDto;
import web.mvc.dto.request.SignupRequestDto;
import web.mvc.dto.response.ApiResponse;
import web.mvc.dto.response.SignupResponseDto;
import web.mvc.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login/local")
    public ResponseEntity<ApiResponse<?>> localLogin(@RequestBody LocalLoginRequestDto dto) {
        return ResponseEntity.ok(
                ApiResponse.success(authService.localLogin(dto), "로그인 성공")
        );
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponseDto>> signup(
            @RequestBody SignupRequestDto dto) {

        SignupResponseDto response = authService.signup(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "회원가입이 완료되었습니다."));
    }
}