package cn.wind.clear.service;

import cn.wind.clear.entity.Category;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface CategoryService extends IService<Category> {
    Long getDefaultCategoryId(Long currentId, String defaultCategory);

    List<Category> getCategoriesByUserId(Long currentId);
}
