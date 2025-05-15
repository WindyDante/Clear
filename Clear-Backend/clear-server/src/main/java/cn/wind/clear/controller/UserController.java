package cn.wind.clear.controller;

import cn.wind.clear.constant.JwtClaimsConstant;
import cn.wind.clear.constant.MessageConstant;
import cn.wind.clear.dto.UserDTO;
import cn.wind.clear.dto.UserLoginDTO;
import cn.wind.clear.entity.User;
import cn.wind.clear.exception.BaseException;
import cn.wind.clear.properties.JwtProperties;
import cn.wind.clear.result.Result;
import cn.wind.clear.service.UserService;
import cn.wind.clear.utils.JwtUtil;
import cn.wind.clear.vo.UserLoginVO;
import cn.wind.clear.vo.UserStatusVO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

/**
 * User
 * */
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    @Resource
    UserService userService;
    @Resource
    private JwtProperties jwtProperties;

    /**
     * 用户登录
     * <p>
     * 验证用户凭据并生成JWT令牌用于身份认证
     *
     * @param userLoginDTO 用户登录数据传输对象，包含用户名和密码
     * @return 带有用户信息和认证令牌的登录结果
     */
    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO) {
        User user = userService.login(userLoginDTO);

        UserLoginVO vo = this.generateRes(user);

        return Result.success(vo);
    }

    /**
     * 用户注册
     * <p>
     * 创建新用户账户并存储到系统中
     *
     * @param userDTO 用户数据传输对象，包含注册所需的用户信息
     * @return 操作结果，成功返回success状态
     */
    @PostMapping("/register")
    public Result<UserLoginVO> register(@RequestBody UserDTO userDTO) {
        User isOk = userService.register(userDTO);
        if (isOk == null) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
        UserLoginVO vo = this.generateRes(isOk);
        return Result.success(vo);
    }

    /**
     * 获取当前用户相关信息
     * <p>
     * 检索并返回当前登录用户的状态和配置信息
     *
     * @return 包含用户状态信息的结果对象，成功时返回UserStatusVO
     */
    @GetMapping("/status")
    public Result<UserStatusVO> getUserStatus() {
        UserStatusVO userStatusVO = userService.getStatus();
        return Result.success(userStatusVO);
    }

    /**
     * 生成响应结果
     * */
    private UserLoginVO generateRes(User user) {
        // 登陆成功，生成JWT令牌
        HashMap<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getId());
        claims.put(JwtClaimsConstant.USER_NAME, user.getUsername());
        String token = JwtUtil.createJWT(
                jwtProperties.getSecretKey(),
                jwtProperties.getTtl(),
                claims
        );

        return UserLoginVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .tk(token)
                .theme(user.getTheme())
                .build();
    }

}
