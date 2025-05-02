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
import cn.wind.clear.mapper.CategoryMapper;
import cn.wind.clear.mapper.TodoMapper;
import cn.wind.clear.result.PageResult;
import cn.wind.clear.service.TodoService;
import cn.wind.clear.vo.CategoryVO;
import cn.wind.clear.vo.TodoVO;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TodoServiceImpl implements TodoService {
    @Autowired
    CategoryMapper categoryMapper;
    @Autowired
    TodoMapper todoMapper;


    /**
     * 添加to do
     * @param todoDTO
     */
    public void addTodo(TodoDTO todoDTO) {
        if (todoDTO.getTitle() == null || todoDTO.getTitle().isEmpty()) {
            throw new BaseException(MessageConstant.EMPTY_TITLE);
        }

        Todo todo = Todo.builder()
                .title(todoDTO.getTitle())
                .content(todoDTO.getContent())
                .categoryId(todoDTO.getCategoryId() != null ? todoDTO.getCategoryId() : categoryMapper.getDefaultCategoryId(BaseContext.getCurrentId(), CategoryConstant.DEFAULT_CATEGORY))
                .dueDate(todoDTO.getDueDate() == null ? null : todoDTO.getDueDate())
                .status(StatusConstant.ENABLED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .userId(BaseContext.getCurrentId())
                .build();

        todoMapper.insert(todo);
    }

    @Override
    public PageResult<TodoVO> pageQuery(TodoPageQueryDTO todoPageQueryDTO) {
        log.info("Todo分页查询: {}", todoPageQueryDTO);
        todoPageQueryDTO.setUserId(BaseContext.getCurrentId());
        PageHelper.startPage(todoPageQueryDTO.getPage(), todoPageQueryDTO.getPageSize());
        Page<TodoVO> page = todoMapper.pageQuery(todoPageQueryDTO);
        return new PageResult<TodoVO>(page.getTotal(), page.getResult());
    }

    /**
     * 删除to do
     * @param id
     */
    public void deleteTodo(Long id) {
        todoMapper.deleteTodo(id);
    }

    /**
     * 更新to do
     * @param updateTodoDTO
     */
    public void udpateTodo(UpdateTodoDTO updateTodoDTO) {
        Todo todo = Todo.builder()
                .id(updateTodoDTO.getId())
                .title(updateTodoDTO.getTitle())
                .content(updateTodoDTO.getContent())
                .status(updateTodoDTO.getStatus())
                .dueDate(updateTodoDTO.getDueDate())
                .updatedAt(LocalDateTime.now())
                .categoryId(updateTodoDTO.getCategoryId())
                .userId(BaseContext.getCurrentId())
                .build();

        todoMapper.update(todo);
    }

    /**
     * 获取用户的分类数据
     * @return
     */
    public List<CategoryVO> getCategories() {
        List<Category> categories = categoryMapper.getCategoriesByUserId(BaseContext.getCurrentId());

        return categories.stream()
                .map(category -> new CategoryVO(category.getId(), category.getName()))
                .collect(Collectors.toList());
    }
}
