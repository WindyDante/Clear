package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserDTO implements Serializable {
    private String username; // 用户名
    private String password; // 密码
}
