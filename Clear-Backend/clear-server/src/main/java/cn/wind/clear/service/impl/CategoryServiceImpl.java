package cn.wind.clear.service.impl;

import cn.wind.clear.context.BaseContext;
import cn.wind.clear.dto.CategoryDTO;
import cn.wind.clear.entity.Category;
import cn.wind.clear.exception.BaseException;
import cn.wind.clear.mapper.CategoryMapper;
import cn.wind.clear.service.CategoryService;
import cn.wind.clear.vo.CategoryVO;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static cn.wind.clear.constant.MessageConstant.SYSTEM_ERROR;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category>
        implements CategoryService {
    @Override
    public String getDefaultCategoryId(String currentId, String defaultCategory) {
        return this.lambdaQuery()
                .eq(Category::getUserId, currentId)
                .eq(Category::getName, defaultCategory)
                .one().getId();
    }

    @Override
    public List<Category> getCategoriesByUserId(String currentId) {
        return this.lambdaQuery()
                .eq(Category::getUserId, currentId)
                .list();
    }

    @Override
    /**
     * 获取用户的分类数据
     *
     * @return
     */
    public List<CategoryVO> getCategories() {
        List<Category> categories = this.getCategoriesByUserId(BaseContext.getCurrentId());

        return categories.stream()
                .map(category -> new CategoryVO(category.getId(), category.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public void addCategory(CategoryDTO categoryDTO) {
        List<Category> categories = this.getCategoriesByUserId(BaseContext.getCurrentId());
        categories.stream()
                .filter(category -> category.getName().equals(categoryDTO.getName()))
                .findFirst()
                .ifPresent(category -> {
                    throw new BaseException("分类已存在");
                });
        Category category = new Category();
        category.setUserId(BaseContext.getCurrentId());
        BeanUtils.copyProperties(categoryDTO, category);
        boolean isOk = this.save(category);
        if (!isOk) {
            throw new BaseException(SYSTEM_ERROR);
        }
    }

    @Override
    public void updateCategory(CategoryDTO categoryDTO) {
        Category category = this.getById(categoryDTO.getId());
        if (category == null) {
            throw new BaseException("分类不存在");
        }
        List<Category> categories = this.getCategoriesByUserId(BaseContext.getCurrentId());
        categories.stream()
                .filter(c -> c.getName().equals(categoryDTO.getName()) && !c.getId().equals(categoryDTO.getId()))
                .findFirst()
                .ifPresent(c -> {
                    throw new BaseException("分类已存在");
                });
        BeanUtils.copyProperties(categoryDTO, category);
        boolean isOk = this.updateById(category);
        if (!isOk) {
            throw new BaseException(SYSTEM_ERROR);
        }
    }
}
