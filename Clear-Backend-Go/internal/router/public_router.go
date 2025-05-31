package routers

import (
	"clear/internal/controllers"

	"github.com/gin-gonic/gin"
)

func PublicRouter(r *gin.Engine) {
	// 设置路由组
	publicRoutes := r.Group("/api")
	{
		// 公共路由
		publicRoutes.POST("/user/login", controllers.Login)
		publicRoutes.POST("/user/register", controllers.Register)
	}
}
