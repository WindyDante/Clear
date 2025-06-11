package routers

import (
	"clear/internal/controllers"
	"clear/internal/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRouter(r *gin.Engine) {
	authRoutes := r.Group("/api")
	authRoutes.Use(middleware.JWTAuthMiddleware())

	user(authRoutes)
	category(authRoutes)
	todo(authRoutes)
}

func todo(rg *gin.RouterGroup) {
	rg.GET("/todo", controllers.PageTodo)
	rg.POST("/todo", controllers.CreateOrUpdateTodo)
	rg.DELETE("/todo/:id", controllers.DelTodo)
}

func category(rg *gin.RouterGroup) {
	rg.GET("/category", controllers.GetCategorys)
	rg.POST("/category", controllers.CreateOrUpdateCategory)
	rg.DELETE("/category/:id", controllers.DelCategory)
}

func user(rg *gin.RouterGroup) {
	rg.GET("/user/status", controllers.UserStatus)
	rg.POST("/user/check/:email/:code", controllers.CheckEmail)
	rg.POST("/user/send/:email", controllers.SendMail)
	rg.PUT("/user/theme/:theme", controllers.UpdateTheme)
	rg.PUT("/user/pwd", controllers.UpdatePwd)
}
