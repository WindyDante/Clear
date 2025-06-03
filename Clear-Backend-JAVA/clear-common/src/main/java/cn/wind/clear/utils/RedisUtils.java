package cn.wind.clear.utils;

import cn.wind.clear.properties.JwtProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.concurrent.TimeUnit;

/**
 * Redis 工具类
 */
@Component
public class RedisUtils {

    private static StringRedisTemplate stringRedisTemplate;

    // 用户上下文 ID 在 Redis 中的前缀
    private static final String CONTEXT_KEY_PREFIX = "clear:context:user:";

    private static JwtProperties jwtProperties;


    public RedisUtils(StringRedisTemplate stringRedisTemplate, JwtProperties jwtProperties) {
        RedisUtils.stringRedisTemplate = stringRedisTemplate;
        RedisUtils.jwtProperties = jwtProperties;
    }

    /**
     * 获取当前请求中的token
     * @return token字符串
     */
    private static String getCurrentToken() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            return request.getHeader(jwtProperties.getTokenName());
        }
        return null;
    }

    /**
     * 将用户ID存入Redis，使用token作为key
     * @param userId 用户ID
     * @param token 用户的token
     */
    public static void setCurrentId(String userId, String token) {
        if (userId != null && token != null) {
            String key = CONTEXT_KEY_PREFIX + token;
            stringRedisTemplate.opsForValue().set(key, userId, jwtProperties.getTtl(), TimeUnit.MINUTES);
        }
    }

    /**
     * 将用户ID存入Redis，自动从当前请求获取token
     * @param userId 用户ID
     */
    public static void setCurrentId(String userId) {
        String token = getCurrentToken();
        if (userId != null && token != null) {
            String key = CONTEXT_KEY_PREFIX + token;
            stringRedisTemplate.opsForValue().set(key, userId,  jwtProperties.getTtl(), TimeUnit.MINUTES);
        }
    }

    /**
     * 从Redis获取当前用户ID，使用指定token
     * @param token 用户token
     * @return 当前用户ID
     */
    public static String getCurrentId(String token) {
        if (token != null) {
            String key = CONTEXT_KEY_PREFIX + token;
            return stringRedisTemplate.opsForValue().get(key);
        }
        return null;
    }

    /**
     * 从Redis获取当前用户ID，自动从当前请求获取token
     * @return 当前用户ID
     */
    public static String getCurrentId() {
        String token = getCurrentToken();
        return getCurrentId(token);
    }

    /**
     * 从Redis清除当前用户ID，使用指定token
     * @param token 用户token
     */
    public static void clearCurrentId(String token) {
        if (token != null) {
            String key = CONTEXT_KEY_PREFIX + token;
            stringRedisTemplate.delete(key);
        }
    }

    /**
     * 从Redis清除当前用户ID，自动从当前请求获取token
     */
    public static void clearCurrentId() {
        String token = getCurrentToken();
        if (token != null) {
            String key = CONTEXT_KEY_PREFIX + token;
            stringRedisTemplate.delete(key);
        }
    }
}
