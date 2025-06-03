package routers

import (
	"clear/internal/middleware"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func SetupRouters() *gin.Engine {
	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("./template", true)))

	// 设置CORS
	r.Use(middleware.Cors())

	// 设置公共路由
	PublicRouter(r)

	// 需要鉴权的路由
	AuthRouter(r)

	return r
}
