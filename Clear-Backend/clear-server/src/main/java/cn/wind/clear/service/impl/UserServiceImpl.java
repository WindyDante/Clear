package cn.wind.clear.service.impl;

import cn.wind.clear.constant.CategoryConstant;
import cn.wind.clear.constant.MessageConstant;
import cn.wind.clear.constant.StatusConstant;
import cn.wind.clear.context.BaseContext;
import cn.wind.clear.dto.UserDTO;
import cn.wind.clear.dto.UserLoginDTO;
import cn.wind.clear.entity.Category;
import cn.wind.clear.entity.User;
import cn.wind.clear.exception.BaseException;
import cn.wind.clear.mapper.CategoryMapper;
import cn.wind.clear.mapper.TodoMapper;
import cn.wind.clear.mapper.UserMapper;
import cn.wind.clear.service.UserService;
import cn.wind.clear.vo.UserStatusVO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Resource
    UserMapper userMapper;
    @Autowired
    TodoMapper todoMapper;
    @Autowired
    CategoryMapper categoryMapper;

    /**
     * 用户登陆
     * @param userLoginDTO
     * @return
     */
    public User login(UserLoginDTO userLoginDTO) {
        log.info("用户登陆: {}", userLoginDTO);

        if (userLoginDTO.getUsername() == null || userLoginDTO.getUsername().isBlank()){
            throw new BaseException(MessageConstant.EMPTY_NAME);
        }

        User user = User.builder()
                .username(userLoginDTO.getUsername())
                .password(DigestUtils.md5DigestAsHex(userLoginDTO.getPassword().getBytes()))
                .build();

        // 1. 检查用户登陆凭证是否有效
        User userToLogin = userMapper.getUserByUsername(user);

        // 2. 无效
        if (userToLogin == null) {
            // 用户不存在
            throw new BaseException(MessageConstant.USER_NOT_EXIST);
        } else if (!userToLogin.getPassword().equals(user.getPassword())) {
            // 用户存在但是密码错误
            throw new BaseException(MessageConstant.PASSWORD_ERROR);
        } else {
            // 3. 有效,返回登陆用户
            return userToLogin;
        }
    }

    @Override
    public void register(UserDTO userDTO) {
        log.info("新用户注册: {}", userDTO);
        if (userDTO.getUsername() == null || userDTO.getUsername().isBlank()){
            throw new BaseException(MessageConstant.EMPTY_NAME);
        }

        String username = userDTO.getUsername();
        String password = DigestUtils.md5DigestAsHex(userDTO.getPassword().getBytes());

        User newUser = User.builder()
                .username(username)
                .password(password)
                .build();

        // 1. 查找数据库中是否与已有的用户名冲突
        User userByInfo = userMapper.getUserByUsername(newUser);
        if (userByInfo != null) {
            // 已存在相同用户名的用户
            throw new BaseException(MessageConstant.CONFLICT_USERNAME);
        }

        // 2. 不冲突, 添加到数据库中
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(newUser);

        // 3. 为用户创建默认分类
        Category category = Category.builder()
                .userId(newUser.getId())
                .name(CategoryConstant.DEFAULT_CATEGORY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        categoryMapper.insert(category);
    }

    /**
     * 获取当前用户相关信息
     * @return
     */
    public UserStatusVO getStatus() {
        return UserStatusVO.builder()
                .username(userMapper.getUserById(BaseContext.getCurrentId()).getUsername())
                .numOfUndone(todoMapper.getNumOfDoneOrUndone(BaseContext.getCurrentId(), StatusConstant.ENABLED))
                .numOfDone(todoMapper.getNumOfDoneOrUndone(BaseContext.getCurrentId(), StatusConstant.DISABLED))
                .build();
    }

}
