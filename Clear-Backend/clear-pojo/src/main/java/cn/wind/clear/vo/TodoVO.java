package cn.wind.clear.vo;

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
public class TodoVO implements Serializable {
    private String id; // To Do 主键
    private String title; // To Do 标题
    private String content; // To Do 内容
    private Integer status; // To Do 状态
    private String categoryId; // 分类Id
    private String categoryName; // 分类名称
    private LocalDateTime dueDate; // 截止日期
    private LocalDateTime createdAt; // 创建时间
    private LocalDateTime udpatedAt; // 更新时间
}
