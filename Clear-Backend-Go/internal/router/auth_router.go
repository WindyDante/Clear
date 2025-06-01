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
}

func user(rg *gin.RouterGroup) {
	rg.GET("/user/status", controllers.UserStatus)
}
