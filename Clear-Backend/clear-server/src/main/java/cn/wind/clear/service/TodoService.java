package cn.wind.clear.service;

import cn.wind.clear.dto.TodoDTO;
import cn.wind.clear.dto.TodoPageQueryDTO;
import cn.wind.clear.dto.UpdateTodoDTO;
import cn.wind.clear.entity.Todo;
import cn.wind.clear.result.PageResult;
import cn.wind.clear.vo.CategoryVO;
import cn.wind.clear.vo.TodoVO;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface TodoService extends IService<Todo> {
    /**
     * 添加to do
     * @param todoDTO
     */
    void addTodo(TodoDTO todoDTO);

    /**
     * to do 分页查询
     * @param todoPageQueryDTO
     * @return
     */
    PageResult<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO);

    /**
     * to do 删除
     * @param id
     */
    void deleteTodo(Long id);

    /**
     * 更新to do
     * @param updateTodoDTO
     */
    void udpateTodo(UpdateTodoDTO updateTodoDTO);

    /**
     * 获取用户的分类数据
     * @return
     */
    List<CategoryVO> getCategories();

    Long getNumOfDoneOrUndone(Long currentId, Integer enabled);
}
