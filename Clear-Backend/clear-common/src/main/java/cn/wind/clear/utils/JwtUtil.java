package cn.wind.clear.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    /**
     * 生成JWT
     *
     * @param secretKey
     * @param ttlMillis
     * @param claims
     * @return
     */
    public static String createJWT(String secretKey, long ttlMillis, Map<String, Object> claims) {
        // 1. 生成密钥
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        // 2. 生成JWT过期时间
        long expMillis = System.currentTimeMillis() + ttlMillis;
        Date exp = new Date(expMillis);

        // 3. 生成JWT
        JwtBuilder builder = Jwts.builder()
                .claims(claims)
                .signWith(key, Jwts.SIG.HS256)
                .expiration(exp);

        return builder.compact();
    }

    /**
     * Token 解密
     * @param secretKey
     * @param token
     * @return
     */
    public static Claims parseJWT(String secretKey, String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
