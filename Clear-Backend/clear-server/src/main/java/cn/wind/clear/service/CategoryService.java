package cn.wind.clear.service;

import cn.wind.clear.dto.CategoryDTO;
import cn.wind.clear.entity.Category;
import cn.wind.clear.vo.CategoryVO;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface CategoryService extends IService<Category> {
    String getDefaultCategoryId(String currentId, String defaultCategory);

    List<Category> getCategoriesByUserId(String currentId);

    List<CategoryVO> getCategories();

    void addCategory(CategoryDTO categoryDTO);

    void updateCategory(CategoryDTO categoryDTO);

    String getCategoryNameById(String categoryId);
}
