package cn.wind.clear.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Todo implements Serializable {
    private String id; // 主键自增
    private String title; // To Do 标题
    private String content; // To Do 详细内容
    private Integer status; // To Do 状态
    private LocalDateTime dueDate; // 截止日期
    private String userId; // 用户id 逻辑外键
    private String categoryId; // 分类 id 逻辑外键
    private LocalDateTime createdAt; // 创建时间
    private LocalDateTime updatedAt; // 更新时间
}
