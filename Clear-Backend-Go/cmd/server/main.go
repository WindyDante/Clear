package main

import (
	"clear/config"
	"clear/internal/models"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载系统配置
	if err := config.InitConfig(); err != nil {
		log.Fatalf(models.LoadConfigErrorMessage+":%v", err)
	}

	// 初始化数据库

	// 设置Gin模式
	ginMode := config.Config.Server.Mode
	if ginMode == "debug" {
		gin.SetMode(gin.DebugMode)
	} else if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// 设置路由

	// 启动服务
	// address := config.Config.Server.Host + ":" + config.Config.Server.Port

}
