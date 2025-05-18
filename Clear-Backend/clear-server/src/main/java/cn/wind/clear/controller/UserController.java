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
import java.util.List;

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

    @PutMapping("/theme/{theme}")
    public Result<String> updateTheme(@PathVariable Integer theme) {
        userService.updateTheme(theme);
        return Result.success("主题更新成功");
    }

    /**
     * 发送简单文本邮件
     *
     * @param mail 收件人邮箱地址
     * @return Result 发送结果，成功返回提示信息
     */
    @PostMapping("/send/{mail}")
    public Result<String> send(@PathVariable String mail){
//        emailService.sendHtmlEmail(mail);
        return Result.success("当前功能正在开发中,请耐心等待");
    }

    /**
     * 验证邮箱验证码
     * <p>
     * 校验用户提供的邮箱地址和验证码是否匹配有效
     *
     * @param mail 用户邮箱地址
     * @param code 用户输入的验证码
     * @return Result 验证结果，成功返回提示信息
     */
    @PostMapping("/check/{mail}/{code}")
    public Result<String> check(@PathVariable String mail, @PathVariable String code){
//        String token = emailService.check(mail,code);
        return Result.success("当前功能正在开发中,请耐心等待");
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
