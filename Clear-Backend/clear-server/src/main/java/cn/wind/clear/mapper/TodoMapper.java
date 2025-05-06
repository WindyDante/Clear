package cn.wind.clear.mapper;

import cn.wind.clear.entity.Todo;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TodoMapper extends BaseMapper<Todo> {
//    /**
//     * 插入to do
//     * @param todo
//     */
//    void insert(Todo todo);
//
//    /**
//     * to do分页查询
//     * @param todoPageQueryDTO
//     * @return
//     */
//    Page<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO);
//
//    /**
//     * 删除to do
//     * @param id
//     */
//    @Delete("DELETE FROM todo where id = #{id}")
//    void deleteTodo(Long id);
//
//    /**
//     * 更新to do
//     * @param todo
//     */
//    void update(Todo todo);
//
//    @Select("SELECT COUNT(*) FROM todo WHERE user_id = #{userId} AND status = #{status}")
//    Long getNumOfDoneOrUndone(Long userId, Integer status);
}
