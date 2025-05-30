package routers

import (
	"clear/internal/controllers"
	"clear/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouters() *gin.Engine {
	r := gin.Default()

	// 设置CORS
	r.Use(middleware.Cors())

	// 设置路由组
	publicRoutes := r.Group("/api")
	{
		// 公共路由
		publicRoutes.POST("/user/login", controllers.Login)
	}

	// 需要鉴权的路由
	// authRoutes := r.Group("/api")

	return r
}
