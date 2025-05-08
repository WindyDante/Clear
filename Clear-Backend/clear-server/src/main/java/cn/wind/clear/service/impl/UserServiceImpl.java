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
import cn.wind.clear.mapper.UserMapper;
import cn.wind.clear.service.CategoryService;
import cn.wind.clear.service.TodoService;
import cn.wind.clear.service.UserService;
import cn.wind.clear.vo.UserStatusVO;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {

    @Resource
    private UserMapper userMapper;
    @Resource
    private TodoService todoService;
    @Resource
    private CategoryService categoryService;

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

        userLoginDTO.setPassword(DigestUtils.md5DigestAsHex(userLoginDTO.getPassword().getBytes()));
        User user = new User();
        BeanUtils.copyProperties(userLoginDTO, user);

        // 1. 检查用户登陆凭证是否有效

        User userToLogin = this.lambdaQuery().eq(User::getUsername, userLoginDTO.getUsername()).one();

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
        User userByInfo = this.lambdaQuery().eq(User::getUsername, username).one();
        if (userByInfo != null) {
            // 已存在相同用户名的用户
            throw new BaseException(MessageConstant.CONFLICT_USERNAME);
        }

        // 2. 不冲突, 添加到数据库中
        boolean isOk = this.save(newUser);
        if (!isOk) {
            // 添加失败
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }

        // 3. 为用户创建默认分类
        Category category = Category.builder()
                .userId(newUser.getId())
                .name(CategoryConstant.DEFAULT_CATEGORY)
                .build();

        boolean isOkToCategory = categoryService.save(category);
        if (!isOkToCategory) {
            // 添加失败
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    /**
     * 获取当前用户相关信息
     * @return
     */
    public UserStatusVO getStatus() {
        log.info("获取当前用户相关信息");
        return UserStatusVO.builder()
                .username(this.lambdaQuery()
                        .eq(User::getId, BaseContext.getCurrentId())
                        .one()
                        .getUsername())
                .numOfUndone(
                        todoService.getNumOfDoneOrUndone(BaseContext.getCurrentId(), StatusConstant.ENABLED)
                )
                .numOfDone(todoService.getNumOfDoneOrUndone(BaseContext.getCurrentId(), StatusConstant.DISABLED))
                .build();
    }

}
