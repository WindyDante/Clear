package models

// 成功相关
const (
	SuccessMessage            = "操作成功"
	LoginSuccessMessage       = "登录成功"
	RegisterSuccessMessage    = "注册成功"
	UpdateThemeSuccessMessage = "主题更新成功"
	UpdatePwdSuccessMessage   = "密码更新成功"
)

// 失败相关
const (
	MethodDevelopmentErrorMessage = "当前功能正在开发中,请耐心等待"
	LoadConfigErrorMessage        = "加载系统配置失败"
	ServerLaunchErrorMessage      = "服务器启动失败"
	DirCreateErrorMessage         = "创建目录失败"
	InvalidRequestBodyMessage     = "无效的请求体"
	GenerateTokenErrorMessage     = "生成令牌失败"
	InvalidTokenMessage           = "无效的令牌"
	MissingTokenMessage           = "缺少令牌"
	SystemErrorMessage            = "系统错误，请稍后再试"
	InvalidParameterMessage       = "无效的参数"
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
	UserExistMessage               = "用户已存在"
	UserStatusMessage              = "获取用户状态成功"
	EmailOrCodeRequiredMessage     = "邮箱或验证码不能为空"
	EmailRequiredMessage           = "邮箱不能为空"
	ThemeEmptyMessage              = "主题不能为空"
	InvalidThemeMessage            = "无效的主题值，请选择正确的主题"
	PasswordEmptyMessage           = "密码不能为空"
)

// 分类相关
const (
	CategoryListMessage          = "获取分类列表成功"
	CategorySuccessMessage       = "分类处理成功"
	CategoryNameExistsMessage    = "分类名称已存在"
	CategoryNameNotExistsMessage = "分类名称不能为空"
	CategoryIdNotExistsMessage   = "分类ID不能为空"
)

// Todo 相关
const (
	TodoCreatedMessage       = "任务操作成功"
	TodoTitleNotEmptyMessage = "任务标题"
	TodoDeletedMessage       = "任务删除成功"
	TodoNotExistsMessage     = "任务不存在"
)

// Todo 状态枚举
const (
	TodoStatusPending   = 1
	TodoStatusCompleted = 2
)

// Version
const (
	Version = "0.1.0" // 当前版本号
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
