package cn.wind.clear.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class TodoDTO implements Serializable {
    private String title;
    private String content;
    private LocalDate dueDate;
    private String categoryId;
}
