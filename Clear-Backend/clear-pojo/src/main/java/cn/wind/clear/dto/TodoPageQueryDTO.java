package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class TodoPageQueryDTO implements Serializable {
    private Long userId;
    private Integer page;
    private Integer pageSize;
    private Long categoryId;
    private Integer status;
}
