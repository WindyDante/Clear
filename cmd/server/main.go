package main

import (
	"clear/config"
	"clear/internal/database"
	"clear/internal/models"
	routers "clear/internal/router"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func printGreetings(port string) {
	fmt.Printf("---\nGin Server Starting\nport: %s\n---\n", port)
	fmt.Print(models.GreetingBanner)
	fmt.Printf("Server has started on port %s\n", port)
	fmt.Printf("---\n📦 Version: %s\n", models.Version)
	fmt.Printf("🧙 Author: EastWind\n")
	fmt.Printf("👉 Website: https://clear.1wind.cn/\n")
	fmt.Printf("👉 GitHub: https://github.com/WindyDante/Clear\n---\n")
}

func main() {
	// 加载系统配置
	var err error
	if err = config.InitConfig(); err != nil {
		log.Fatalf(models.LoadConfigErrorMessage+":%v", err)
	}

	// 初始化数据库
	if err = database.InitDB(); err != nil {
		log.Fatalf(models.DatabaseInitErrorMessage+": %v", err)
	}

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
	r := routers.SetupRouters()

	// 启动服务
	address := config.Config.Server.Host + ":" + config.Config.Server.Port
	printGreetings(config.Config.Server.Port)
	if err = r.Run(address); err != nil {
		log.Fatalf(models.ServerLaunchErrorMessage+": %v", err)
	}
}
