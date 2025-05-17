package cn.wind.clear.context;

import cn.wind.clear.utils.RedisUtils;

public class RedisContext {

    public static void setCurrentId(String id) {
        RedisUtils.setCurrentId(id);
    }

    public static String getCurrentId() {
        return RedisUtils.getCurrentId();
    }

    public static void clearCurrentId() {
        RedisUtils.clearCurrentId();
    }
}
