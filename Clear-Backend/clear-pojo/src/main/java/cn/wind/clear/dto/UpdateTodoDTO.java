package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UpdateTodoDTO implements Serializable {
    private String id;
    private String title;
    private String content;
    private String categoryId;
    private Integer status;
    private LocalDateTime dueDate;
    private String userId;
}
