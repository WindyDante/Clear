package cn.wind.clear.controller;

import cn.wind.clear.constant.JwtClaimsConstant;
import cn.wind.clear.dto.UserDTO;
import cn.wind.clear.dto.UserLoginDTO;
import cn.wind.clear.entity.User;
import cn.wind.clear.properties.JwtProperties;
import cn.wind.clear.result.Result;
import cn.wind.clear.service.UserService;
import cn.wind.clear.utils.JwtUtil;
import cn.wind.clear.vo.UserLoginVO;
import cn.wind.clear.vo.UserStatusVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    @Autowired
    UserService userService;
    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 用户登陆
     * @param userLoginDTO
     * @return
     */
    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO) {
        User user = userService.login(userLoginDTO);

        // 登陆成功，生成JWT令牌
        HashMap<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getId());
        claims.put(JwtClaimsConstant.USER_NAME, user.getUsername());
        String token = JwtUtil.createJWT(
                jwtProperties.getSecretKey(),
                jwtProperties.getTtl(),
                claims
        );

        UserLoginVO userLoginVO = UserLoginVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .token(token)
                .build();

        return Result.success(userLoginVO);
    }

    /**
     * 用户注册
     * @param userDTO
     * @return
     */
    @PostMapping("/register")
    public Result register(@RequestBody UserDTO userDTO) {
        userService.register(userDTO);
        return Result.success();
    }

    /**
     * 获取当前用户相关信息
     * @return
     */
    @GetMapping("/status")
    public Result<UserStatusVO> getUserStatus() {
        UserStatusVO userStatusVO = userService.getStatus();
        return Result.success(userStatusVO);
    }
}
