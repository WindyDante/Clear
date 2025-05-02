package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class UpdateTodoDTO implements Serializable {
    private Long id;
    private String title;
    private String content;
    private Long categoryId;
    private Integer status;
    private LocalDate dueDate;
    private Long userId;
}
