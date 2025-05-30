package models

// 成功相关
const (
	SuccessMessage      = "操作成功"
	LoginSuccessMessage = "登录成功"
)

// 失败相关
const (
	LoadConfigErrorMessage    = "加载系统配置失败"
	ServerLaunchErrorMessage  = "服务器启动失败"
	DirCreateErrorMessage     = "创建目录失败"
	InvalidRequestBodyMessage = "无效的请求体"
	GenerateTokenErrorMessage = "生成令牌失败"
	InvalidTokenMessage       = "无效的令牌"
)

// 数据库相关
const (
	DatabaseMigrateError     = "数据库迁移失败"
	DatabaseInitErrorMessage = "数据库初始化失败"
	DatabaseTypeError        = "不支持的数据库类型"
	DatabaseConnectError     = "数据库连接失败"
)

// 用户相关
const (
	UsernameOrPasswordEmptyMessage = "用户名或密码不能为空"
	UserNotFoundMessage            = "用户不存在"
	PasswordErrorMessage           = "密码错误"
)

// Todo 状态枚举
const (
	TodoStatusPending   = iota // 0: pending
	TodoStatusCompleted        // 1: completed
)

// Version
const (
	Version = "0.0.5" // 当前版本号
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
