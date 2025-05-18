package cn.wind.clear.service.impl;

import cn.wind.clear.constant.CategoryConstant;
import cn.wind.clear.constant.MessageConstant;
import cn.wind.clear.constant.StatusConstant;
import cn.wind.clear.context.RedisContext;
import cn.wind.clear.dto.TodoDTO;
import cn.wind.clear.dto.TodoPageQueryDTO;
import cn.wind.clear.dto.UpdateTodoDTO;
import cn.wind.clear.entity.Todo;
import cn.wind.clear.exception.BaseException;
import cn.wind.clear.mapper.TodoMapper;
import cn.wind.clear.result.PageResult;
import cn.wind.clear.service.CategoryService;
import cn.wind.clear.service.TodoService;
import cn.wind.clear.vo.TodoVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class TodoServiceImpl extends ServiceImpl<TodoMapper, Todo>
        implements TodoService {
    @Resource
    CategoryService categoryService;

    /**
     * 添加to do
     *
     * @param todoDTO
     */
    public void addTodo(TodoDTO todoDTO) {
        if (todoDTO.getTitle() == null || todoDTO.getTitle().isEmpty()) {
            throw new BaseException(MessageConstant.EMPTY_TITLE);
        }

        if (todoDTO.getDueDate() != null && todoDTO.getDueDate().isBefore(LocalDateTime.now())) {
            throw new BaseException(MessageConstant.DATE_EXPIRE);
        }

        Todo todo = new Todo();
        BeanUtils.copyProperties(todoDTO, todo);
        todo.setCategoryId(todoDTO.getCategoryId() != null
                ? todoDTO.getCategoryId()
                : categoryService.getDefaultCategoryId(RedisContext.getCurrentId(), CategoryConstant.DEFAULT_CATEGORY));
        todo.setDueDate(todoDTO.getDueDate() == null ? null : todoDTO.getDueDate());
        todo.setStatus(StatusConstant.DISABLED);
        todo.setUserId(RedisContext.getCurrentId());

        boolean isOk = this.save(todo);
        if (!isOk) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    @Override
    public PageResult<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO) {
        log.info("Todo分页查询: {}", todoPageQueryDTO);
        LambdaQueryWrapper<Todo> queryWrapper = new LambdaQueryWrapper<>();
        String userId = RedisContext.getCurrentId();
        Integer status = todoPageQueryDTO.getStatus();
        String categoryId = todoPageQueryDTO.getCategoryId();
        queryWrapper.eq(userId != null, Todo::getUserId, userId)
                .eq(categoryId != null,Todo::getCategoryId, categoryId)
                .eq(status != null, Todo::getStatus, status)
                .orderByDesc(Todo::getCreatedAt);
        Page<Todo> page =
                new Page<>(todoPageQueryDTO.getPage(), todoPageQueryDTO.getPageSize());
        Page<Todo> res = this.page(page, queryWrapper);
        List<TodoVO> todoList = res.getRecords().stream()
                .map(todo -> {
                    TodoVO todoVO = new TodoVO();
                    BeanUtils.copyProperties(todo, todoVO);
                    String categoryName = categoryService.getCategoryNameById(todo.getCategoryId());
                    todoVO.setCategoryName(categoryName);
                    return todoVO;
                })
                .toList();
        PageResult<TodoVO> result = new PageResult<>();
        BeanUtils.copyProperties(res, result);
        result.setRecords(todoList);
        return result;
    }

    /**
     * 删除to do
     *
     * @param id
     */
    public void deleteTodo(String id) {
        boolean isOk = this.removeById(id);
        if (!isOk) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    /**
     * 更新to do
     *
     * @param updateTodoDTO
     */
    public void udpateTodo(UpdateTodoDTO updateTodoDTO) {
        Todo todo = new Todo();
        BeanUtils.copyProperties(updateTodoDTO, todo);
        todo.setUserId(RedisContext.getCurrentId());
        boolean isOk = this.updateById(todo);
        if (!isOk) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    @Override
    public Long getNumOfDoneOrUndone(String currentId, Integer enabled) {
        return this.lambdaQuery()
                .eq(Todo::getUserId, currentId)
                .eq(Todo::getStatus, enabled)
                .count();
    }
}
