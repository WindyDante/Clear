package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class TodoPageQueryDTO implements Serializable {
    private Integer page;
    private Integer pageSize;
    private String categoryId;
    private Integer status;
}
