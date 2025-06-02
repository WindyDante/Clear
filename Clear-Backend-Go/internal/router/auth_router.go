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
}

func category(rg *gin.RouterGroup) {

}

func user(rg *gin.RouterGroup) {
	rg.GET("/user/status", controllers.UserStatus)
	rg.POST("/user/check/:mail/:code", controllers.CheckEmail)
	rg.POST("/user/send/:mail", controllers.SendMail)
	rg.PUT("/user/theme/:theme", controllers.UpdateTheme)
}
