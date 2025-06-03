package cn.wind.clear.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class TodoPageQueryDTO implements Serializable {
    private Integer page;
    private Integer pageSize;
    private String categoryId;
    private Integer status;
    /**
     * 开始日期
     * */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    /**
     * 结束日期
     * */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    /**
     * 全文检索
     * */
    private String keyword;
}
