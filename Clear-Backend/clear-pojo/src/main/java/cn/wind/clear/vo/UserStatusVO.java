package cn.wind.clear.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserStatusVO implements Serializable {
    private String username;
    /**
     * 已完成任务数量
     */
    private Long numOfDone;

    /**
     * 未完成任务数量
     */
    private Long numOfUndone;
    private String theme;
}
