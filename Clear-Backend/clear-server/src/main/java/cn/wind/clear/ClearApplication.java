package cn.wind.clear;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;


@SpringBootApplication
@Slf4j
@EnableCaching
public class ClearApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClearApplication.class, args);
        log.info("Clear Server started!");
    }
}
