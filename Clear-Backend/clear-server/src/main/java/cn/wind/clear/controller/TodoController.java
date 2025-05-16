package cn.wind.clear.controller;

import cn.wind.clear.dto.TodoDTO;
import cn.wind.clear.dto.TodoPageQueryDTO;
import cn.wind.clear.dto.UpdateTodoDTO;
import cn.wind.clear.result.PageResult;
import cn.wind.clear.result.Result;
import cn.wind.clear.service.TodoService;
import cn.wind.clear.vo.TodoVO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

/**
 * Todo
 */
@RestController
@RequestMapping("/todo")
@Slf4j
public class TodoController {

    @Resource
    TodoService todoService;

    /**
     * 添加待办事项
     * <p>
     * 创建新的待办事项，并清除相关缓存
     *
     * @param todoDTO 待办事项数据传输对象，包含待办事项的详细信息
     * @return 操作结果，成功返回success状态
     */
    @PostMapping("/addTodo")
    public Result<String> addTodo(@RequestBody TodoDTO todoDTO) {
        todoService.addTodo(todoDTO);
        return Result.success("添加成功");
    }

    /**
     * 待办事项分页查询
     * <p>
     * 根据查询条件进行分页查询待办事项，结果会被缓存
     *
     * @param todoPageQueryDTO 分页查询参数，包含页码、每页大小等查询条件
     * @return 分页结果，包含TodoVO列表和分页信息
     */
    @GetMapping("/page")
    public Result<PageResult<TodoVO>> pageTodo(TodoPageQueryDTO todoPageQueryDTO) {
        PageResult<TodoVO> pageResult = todoService.pageQuery(todoPageQueryDTO);
        return Result.success(pageResult);
    }

    /**
     * 删除待办事项
     * <p>
     * 根据ID删除指定的待办事项，并清空相关缓存
     *
     * @param id 待删除的待办事项ID
     * @return 操作结果，成功返回success状态
     */
    @DeleteMapping("/deleteTodo/{id}")
    public Result<String> deleteTodo(@PathVariable String id) {
        todoService.deleteTodo(id);
        return Result.success("删除成功");
    }

    /**
     * 更新待办事项
     * <p>
     * 更新现有待办事项的信息，并清空相关缓存
     *
     * @param updateTodoDTO 待办事项更新数据传输对象，包含需要更新的字段
     * @return 操作结果，成功返回success状态
     */
    @PutMapping("/updateTodo")
    public Result<String> updateTodo(@RequestBody UpdateTodoDTO updateTodoDTO) {
        todoService.udpateTodo(updateTodoDTO);
        return Result.success("更新成功");
    }
}
