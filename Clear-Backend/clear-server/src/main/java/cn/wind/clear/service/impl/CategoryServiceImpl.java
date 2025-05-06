package cn.wind.clear.service.impl;

import cn.wind.clear.entity.Category;
import cn.wind.clear.mapper.CategoryMapper;
import cn.wind.clear.service.CategoryService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category>
        implements CategoryService {
    @Override
    public Long getDefaultCategoryId(Long currentId, String defaultCategory) {
        return this.lambdaQuery()
                .eq(Category::getUserId, currentId)
                .eq(Category::getName, defaultCategory)
                .one().getId();
    }

    @Override
    public List<Category> getCategoriesByUserId(Long currentId) {
        return this.lambdaQuery()
                .eq(Category::getUserId, currentId)
                .list();
    }
}
