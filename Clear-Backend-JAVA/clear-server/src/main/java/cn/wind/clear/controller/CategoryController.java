package cn.wind.clear.controller;

import cn.wind.clear.dto.CategoryDTO;
import cn.wind.clear.result.Result;
import cn.wind.clear.service.CategoryService;
import cn.wind.clear.vo.CategoryVO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Category
 */
@RestController
@RequestMapping("/category")
@Slf4j
public class CategoryController {

    @Resource
    private CategoryService categoryService;

    /**
     * 获取用户的分类数据
     * <p>
     * 检索并返回当前登录用户的所有分类信息
     *
     * @return 包含分类列表的结果对象，成功时返回CategoryVO列表
     */
    @GetMapping("/categories")
    public Result<List<CategoryVO>> getCategories() {
        log.info("获取用户分类数据...");
        List<CategoryVO> list = categoryService.getCategories();
        return Result.success(list);
    }

    /**
     * 添加新分类
     * <p>
     * 为当前登录用户创建新的分类项
     *
     * @param categoryDTO 包含分类信息的数据传输对象
     * @return 包含操作结果的响应对象，成功时返回成功消息
     */
    @PostMapping("/add")
    public Result<String> addCategory(@RequestBody CategoryDTO categoryDTO) {
        categoryService.addCategory(categoryDTO);
        return Result.success("添加成功");
    }

    /**
     * 更新现有分类
     * <p>
     * 根据提供的信息更新指定的分类
     *
     * @param categoryDTO 包含更新后分类信息的数据传输对象
     * @return 包含操作结果的响应对象，成功时返回成功消息
     */
    @PutMapping("/update")
    public Result<String> updateCategory(@RequestBody CategoryDTO categoryDTO) {
        categoryService.updateCategory(categoryDTO);
        return Result.success("修改成功");
    }

    /**
     * 删除指定分类
     * <p>
     * 根据ID删除指定的分类
     *
     * @param id 要删除的分类ID
     * @return 包含操作结果的响应对象，成功时返回成功消息
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> deleteCategory(@PathVariable Long id) {
        categoryService.removeById(id);
        return Result.success("删除成功");
    }
}
