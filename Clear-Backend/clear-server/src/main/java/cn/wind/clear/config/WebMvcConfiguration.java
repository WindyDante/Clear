package cn.wind.clear.config;

import cn.wind.clear.interceptor.JwtTokenInterceptor;
import cn.wind.clear.json.JacksonObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.util.List;

/**
 * 配置类，注册Web层相关组件
 */
@Configuration
@Slf4j
public class WebMvcConfiguration extends WebMvcConfigurationSupport {

    @Autowired
    private JwtTokenInterceptor jwtTokenInterceptor;


    /**
     * 注册自定义拦截器
     * @param registry
     */
    protected void addInterceptors(InterceptorRegistry registry) {
        log.info("开始注册自定义拦截器...");
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/user/**")
                .addPathPatterns("/todo/**")
                .excludePathPatterns("/user/login")
                .excludePathPatterns("/user/register");
    }

    /**
     * 扩展Spring MVC消息转换器
     * @param converters
     */
    @Override
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        log.info("扩展消息转换器");

        // 创建消息转换器对象
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();

        // 需要为消息转换器设置一个对象转换器，对象转换器可以将Java对象转换为json数据
        converter.setObjectMapper(new JacksonObjectMapper());

        converters.add(0, converter);
    }
}
