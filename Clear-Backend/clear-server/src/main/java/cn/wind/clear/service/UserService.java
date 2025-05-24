package cn.wind.clear.service;

import cn.wind.clear.dto.UserDTO;
import cn.wind.clear.dto.UserLoginDTO;
import cn.wind.clear.entity.User;
import cn.wind.clear.vo.UserStatusVO;
import com.baomidou.mybatisplus.extension.service.IService;

public interface UserService extends IService<User> {

    /**
     * 用户登陆
     * @param userLoginDTO
     */
    User login(UserLoginDTO userLoginDTO);

    /**
     * 用户注册
     * @param userDTO
     */
    User register(UserDTO userDTO);

    void updateTheme(Integer theme);

    UserStatusVO getUserStatus();

}
