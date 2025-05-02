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
    private Long numOfDone;
    private Long numOfUndone;
}
