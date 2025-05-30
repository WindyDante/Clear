package models

// 成功相关
const ()

// 失败相关
const (
	LoadConfigErrorMessage   = "加载系统配置失败"
	ServerLaunchErrorMessage = "服务器启动失败"
	DirCreateErrorMessage    = "创建目录失败"
)

// 数据库相关
const (
	DatabaseMigrateError     = "数据库迁移失败"
	DatabaseInitErrorMessage = "数据库初始化失败"
	DatabaseTypeError        = "不支持的数据库类型"
	DatabaseConnectError     = "数据库连接失败"
)

// Todo 状态枚举
const (
	TodoStatusPending   = iota // 0: pending
	TodoStatusCompleted        // 1: completed
)

// Version
const (
	Version = "0.0.1" // 当前版本号
)

// console Banner
const (
	GreetingBanner = `
 ██████╗██╗     ███████╗ █████╗ ██████╗ 
██╔════╝██║     ██╔════╝██╔══██╗██╔══██╗
██║     ██║     █████╗  ███████║██████╔╝
██║     ██║     ██╔══╝  ██╔══██║██╔══██╗
╚██████╗███████╗███████╗██║  ██║██║  ██║
 ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
`
)
