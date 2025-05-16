package cn.wind.clear.context;

public class BaseContext {
    public static ThreadLocal<String> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(String id) {
        threadLocal.set(id);
    }

    public static String getCurrentId() {
        return threadLocal.get();
    }

    public static void clearCurrentId() {
        threadLocal.remove();
    }
}
