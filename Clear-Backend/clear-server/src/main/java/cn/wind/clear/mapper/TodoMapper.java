package cn.wind.clear.mapper;

import cn.wind.clear.dto.TodoPageQueryDTO;
import cn.wind.clear.entity.Todo;
import cn.wind.clear.vo.TodoVO;
import com.github.pagehelper.Page;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface TodoMapper {
    /**
     * 插入to do
     * @param todo
     */
    void insert(Todo todo);

    /**
     * to do分页查询
     * @param todoPageQueryDTO
     * @return
     */
    Page<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO);

    /**
     * 删除to do
     * @param id
     */
    @Delete("DELETE FROM todo where id = #{id}")
    void deleteTodo(Long id);

    /**
     * 更新to do
     * @param todo
     */
    void update(Todo todo);

    @Select("SELECT COUNT(*) FROM todo WHERE user_id = #{userId} AND status = #{status}")
    Long getNumOfDoneOrUndone(Long userId, Integer status);
}
