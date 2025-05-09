package cn.wind.clear.service.impl;

import cn.wind.clear.constant.CategoryConstant;
import cn.wind.clear.constant.MessageConstant;
import cn.wind.clear.constant.StatusConstant;
import cn.wind.clear.context.BaseContext;
import cn.wind.clear.dto.TodoDTO;
import cn.wind.clear.dto.TodoPageQueryDTO;
import cn.wind.clear.dto.UpdateTodoDTO;
import cn.wind.clear.entity.Category;
import cn.wind.clear.entity.Todo;
import cn.wind.clear.exception.BaseException;
import cn.wind.clear.mapper.TodoMapper;
import cn.wind.clear.result.PageResult;
import cn.wind.clear.service.CategoryService;
import cn.wind.clear.service.TodoService;
import cn.wind.clear.vo.CategoryVO;
import cn.wind.clear.vo.TodoVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

        Todo todo = new Todo();
        BeanUtils.copyProperties(todoDTO, todo);
        todo.setCategoryId(todoDTO.getCategoryId() != null
                ? todoDTO.getCategoryId()
                : categoryService.getDefaultCategoryId(BaseContext.getCurrentId(), CategoryConstant.DEFAULT_CATEGORY));
        todo.setDueDate(todoDTO.getDueDate() == null ? null : todoDTO.getDueDate());
        todo.setStatus(StatusConstant.ENABLED);
        todo.setUserId(BaseContext.getCurrentId());

        boolean isOk = this.save(todo);
        if (!isOk) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    @Override
    public PageResult<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO) {
        log.info("Todo分页查询: {}", todoPageQueryDTO);
        todoPageQueryDTO.setUserId(BaseContext.getCurrentId());
        LambdaQueryWrapper<Todo> queryWrapper = new LambdaQueryWrapper<>();
        Long userId = todoPageQueryDTO.getUserId();
        Integer status = todoPageQueryDTO.getStatus();
        queryWrapper.eq(userId != null, Todo::getUserId, userId)
                .eq(status != null, Todo::getStatus, status)
                .orderByDesc(Todo::getCreatedAt);
        Page<Todo> page =
                new Page<>(todoPageQueryDTO.getPage(), todoPageQueryDTO.getPageSize());
        Page<Todo> res = this.page(page, queryWrapper);
        List<TodoVO> todoList = res.getRecords().stream()
                .map(todo -> {
                    TodoVO todoVO = new TodoVO();
                    BeanUtils.copyProperties(todo, todoVO);
                    // 如果需要设置 categoryName，可以在此处处理
                    return todoVO;
                })
                .toList();
        return new PageResult<TodoVO>(res.getTotal(), todoList);
    }

    /**
     * 删除to do
     *
     * @param id
     */
    public void deleteTodo(Long id) {
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
        todo.setUserId(BaseContext.getCurrentId());
        boolean isOk = this.updateById(todo);
        if (!isOk) {
            throw new BaseException(MessageConstant.SYSTEM_ERROR);
        }
    }

    /**
     * 获取用户的分类数据
     *
     * @return
     */
    public List<CategoryVO> getCategories() {
        List<Category> categories = categoryService.getCategoriesByUserId(BaseContext.getCurrentId());

        return categories.stream()
                .map(category -> new CategoryVO(category.getId(), category.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public Long getNumOfDoneOrUndone(Long currentId, Integer enabled) {
        return this.lambdaQuery()
                .eq(Todo::getUserId, currentId)
                .eq(Todo::getStatus, enabled)
                .count();
    }
}
