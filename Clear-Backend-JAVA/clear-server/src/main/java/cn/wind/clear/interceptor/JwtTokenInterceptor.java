package cn.wind.clear.interceptor;

import cn.wind.clear.constant.JwtClaimsConstant;
import cn.wind.clear.context.RedisContext;
import cn.wind.clear.properties.JwtProperties;
import cn.wind.clear.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
public class JwtTokenInterceptor implements HandlerInterceptor {

    @Resource
    private JwtProperties jwtProperties;

    /**
     * 校验JWT
     *
     * @param request  current HTTP request
     * @param response current HTTP response
     * @param handler  chosen handler to execute, for type and/or instance evaluation
     * @return
     * @throws Exception
     */
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 判断当前拦截到的是Controller方法还是其它资源
        if (!(handler instanceof HandlerMethod)) {
            // 当前拦截到的不是动态方法，直接放行
            return true;
        }

        // 1. 从请求头中获取令牌
        String token = request.getHeader(jwtProperties.getTokenName());

        // 分割令牌，获取Bearer后面的部分
        if (token == null){
            // 如果令牌不存在，响应401状态码
            response.setStatus(401);
            return false;
        }

        String[] res = token.split(" ");
        if (res.length != 2 || !("Bearer".equals(res[0]))) {
            // 如果令牌格式不正确，响应401状态码
            response.setStatus(401);
            return false;
        }

        // 2. 校验令牌
        try {
            log.info("jwt校验: {}", res[1]);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getSecretKey(), res[1]);
            String userId = claims.get(JwtClaimsConstant.USER_ID).toString();
            log.info("当前用户id: {}", userId);
            RedisContext.setCurrentId(userId);
            // 3. 通过，放行
            return true;
        } catch (Exception e) {
            // 4. 不通过，响应401状态码
            response.setStatus(401);
            return false;
        }
    }
}
