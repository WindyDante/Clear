package cn.wind.clear.service;

import cn.wind.clear.dto.UserDTO;
import cn.wind.clear.dto.UserLoginDTO;
import cn.wind.clear.entity.User;
import cn.wind.clear.vo.UserStatusVO;

public interface UserService {

    /**
     * 用户登陆
     * @param userLoginDTO
     */
    User login(UserLoginDTO userLoginDTO);

    /**
     * 用户注册
     * @param userDTO
     */
    void register(UserDTO userDTO);

    /**
     * 获取当前用户相关信息
     * @return
     */
    UserStatusVO getStatus();
}
