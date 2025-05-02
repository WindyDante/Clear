package cn.wind.clear.mapper;

import cn.wind.clear.entity.Category;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper {

    /**
     * 创建分类
     * @param category
     */
    @Insert("INSERT INTO category (user_id, name, created_at, updated_at) VALUES (#{userId}, #{name}, #{createdAt}, #{updatedAt})")
    void insert(Category category);

    /**
     * 根据用户id获取分类数据
     * @param currentId
     * @return
     */
    @Select("Select * from category where user_id = #{userId}")
    List<Category> getCategoriesByUserId(Long userId);

    @Select("SELECT * from category c where c.user_id = #{userId} and c.name = #{name}")
    Long getDefaultCategoryId(Long userId, String name);
}
