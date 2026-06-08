package web.mvc.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import web.mvc.domain.user.User;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expiration;

    // 해당 클래스 생성 될 때 토큰 생성
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
    }

    // =====================
    // 토큰 생성 - 토큰 내에 사용자 정보 (userId, email, name, role, position) 넣기
    // =====================
    public JwtTokenDto generateToken(User user) {

        // 현재 시간 + 만료 시간 계산
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String accessToken = Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .claim("position", user.getPosition().name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key) //생성자에서 만들어진 암호화 키로 서명
                .compact();    //문자열로 반환

        //Dto로 포장하여 변환
        return JwtTokenDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .position(user.getPosition())
                .build();
    }

    // =====================
    // 토큰 → Authentication 객체 추출
    // =====================
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);

        String role = claims.get("role", String.class); //role 추출
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

        Integer userId = Integer.valueOf(claims.getSubject()); //userId 추출

        return new UsernamePasswordAuthenticationToken(
                userId, //로그인한 유저
                null, //비밀번호 (검증 끝나서 null)
                Collections.singleton(authority) //authorities 권한 목록
        );
    }

    // =====================
    // 토큰 유효성 검증
    // =====================
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;

        } catch (SecurityException | MalformedJwtException e) {
            log.warn("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.warn("지원하지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 비어있습니다.");
        }
        return false;
    }

    // =====================
    // Claims 파싱 (내부 전용)
    // =====================
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}