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

    private final SecretKey key;        // Key → SecretKey
    private final long expiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
    }

    // =====================
    // 토큰 생성
    // =====================
    public JwtTokenDto generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String accessToken = Jwts.builder()
                .subject(String.valueOf(user.getId()))      // setSubject → subject
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .claim("position", user.getPosition().name())
                .issuedAt(now)                              // setIssuedAt → issuedAt
                .expiration(expiryDate)                     // setExpiration → expiration
                .signWith(key)                              // SignatureAlgorithm 제거
                .compact();

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

        String role = claims.get("role", String.class);
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

        Integer userId = Integer.valueOf(claims.getSubject());

        return new UsernamePasswordAuthenticationToken(
                userId,
                null,
                Collections.singleton(authority)
        );
    }

    // =====================
    // 토큰 → userId 추출
    // =====================
    public Integer getUserId(String token) {
        return Integer.valueOf(parseClaims(token).getSubject());
    }

    // =====================
    // 토큰 유효성 검증
    // =====================
    public boolean validateToken(String token) {
        try {
            Jwts.parser()                   // parserBuilder() → parser()
                    .verifyWith(key)        // setSigningKey → verifyWith
                    .build()
                    .parseSignedClaims(token);  // parseClaimsJws → parseSignedClaims
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
        return Jwts.parser()                // parserBuilder() → parser()
                .verifyWith(key)            // setSigningKey → verifyWith
                .build()
                .parseSignedClaims(token)   // parseClaimsJws → parseSignedClaims
                .getPayload();              // getBody() → getPayload()
    }
}