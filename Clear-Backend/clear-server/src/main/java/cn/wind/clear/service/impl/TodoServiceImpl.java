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

import java.time.LocalDate;
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
                .like(todoPageQueryDTO.getKeyword() != null, Todo::getContent, todoPageQueryDTO.getKeyword());
        // 如果只有开始日期，则查询开始日期后的数据
        if (todoPageQueryDTO.getStartDate() != null && todoPageQueryDTO.getEndDate() == null) {
            LocalDate startOfDay = todoPageQueryDTO.getStartDate();
            LocalDate endOfDay = LocalDate.of(2099, 12, 31); // 使用固定的未来日期作为终点
            queryWrapper.ge(Todo::getDueDate, startOfDay)
                    .lt(Todo::getDueDate, endOfDay);
        }
        // 如果只有结束日期，则查询结束日期前的数据
        else if(todoPageQueryDTO.getStartDate() == null && todoPageQueryDTO.getEndDate() != null){
            LocalDate startOfDay = LocalDate.of(1970, 1, 1); // 使用一个较早的日期作为起点
            LocalDate endOfDay = todoPageQueryDTO.getEndDate().plusDays(1); // 结束日期加1天，以包含整个结束日期
            queryWrapper.ge(Todo::getDueDate, startOfDay)
                    .lt(Todo::getDueDate, endOfDay);
        }
        else if (todoPageQueryDTO.getStartDate() != null) {
            // 有开始和结束日期，查询日期范围
            queryWrapper.ge(Todo::getDueDate, todoPageQueryDTO.getStartDate())
                    .lt(Todo::getDueDate, todoPageQueryDTO.getEndDate().plusDays(1));
        }
        queryWrapper.orderByDesc(Todo::getDueDate);
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
