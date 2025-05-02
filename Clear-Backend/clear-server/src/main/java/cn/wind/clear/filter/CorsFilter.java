package cn.wind.clear.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // 最高优先级
public class CorsFilter implements Filter {

    private static final String OPTIONS = "OPTIONS";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;

        res.setHeader("Access-Control-Allow-Origin", "*"); // 允许所有域
        res.setHeader("Access-Control-Allow-Credentials", "true"); // 允许携带 Cookie
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE, PATCH");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Max-Age", "3600"); // 预检请求缓存 1 小时

        // 处理 OPTIONS 预检请求
        if (OPTIONS.equals(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }
}
