# Clear

<p align="center">
  <img alt="Clear" src="./docs/img/index.png" width="600">
</p>

<p align="center">
  <strong>简洁之美，效率之选</strong>
</p>

<p align="center">
  <a href="https://clear.1wind.cn/">🌐 在线体验</a> 
</p>

---

## 🎯 项目简介

Clear 是一款现代化的待办事项管理应用，采用全栈架构设计，致力于为用户提供简洁、高效的任务管理体验。无论是个人日常规划还是团队协作，Clear 都能满足您的需求。

### ✨ 核心特性

- **🎨 精美界面** - 响应式设计，支持多种主题切换
- **📝 智能管理** - 任务分类、标签系统、优先级设置
- **🔐 安全可靠** - JWT认证，数据加密存储
- **⚡ 高性能** - 前后端分离，API响应快速
- **💾 极低占用** - 仅需 4MB 内存运行，50MB 硬盘空间
- **🗄️ 数据独立** - SQLite本地存储，数据完全掌控，随时备份迁移
- **🐳 容器化** - Docker部署，一键启动
- **📱 全平台** - 桌面端、移动端完美适配

## 🛠️ 技术栈

### 前端技术
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue.js状态管理库
- **Element Plus** - Vue 3组件库

### 后端技术
- **Go 1.24+** - 高性能后端服务
- **Gin** - 轻量级Web框架
- **GORM** - Go语言ORM库
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证机制

### 开发工具
- **Docker** - 容器化部署
- **Docker Compose** - 多容器应用编排
- **pnpm** - 高效的包管理器

## 🚀 快速开始

## 📦 部署指南

### Docker 部署（推荐）

#### 一键部署
```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 手动构建
```bash
# 构建镜像
docker-compose build
```

## 🔧 配置说明

### JWT 安全配置 🔐

Clear 使用 JWT (JSON Web Token) 进行用户身份认证。您可以通过以下方式配置JWT密钥：

#### 选项1：使用环境变量（推荐）
```bash
# 在 docker-compose.yml 中设置
environment:
  - JWT_SECRET=your-custom-jwt-secret-key

#### 选项2：删除环境变量（自动生成）
如果您不设置 `JWT_SECRET` 环境变量，系统会自动生成一个随机密钥：
```yaml
# docker-compose.yml 中删除或注释掉 JWT_SECRET
environment:
  # - JWT_SECRET=your-custom-jwt-secret-key  # 注释掉这行
```

#### 选项3：修改现有配置
如果您想更改JWT密钥，只需修改环境变量的值：
```yaml
environment:
  - JWT_SECRET=new-super-secure-jwt-key-here
```

#### 🚨 安全建议

- **生产环境**：请务必设置复杂的自定义JWT密钥
- **密钥长度**：建议至少32个字符
- **密钥复杂性**：包含字母、数字和特殊字符
- **定期更换**：定期更新JWT密钥提高安全性

**生产环境示例：**
```bash
JWT_SECRET=Pr0d-Cl3ar-JWT-S3cr3t-K3y-2024!@#$%^&*()
```


## 📖 使用指南

### 用户管理
- **注册账户** - 创建新用户账户
- **用户登录** - JWT身份验证
- **个人资料** - 修改用户信息

### 任务管理
- **创建任务** - 添加新的待办事项
- **任务分类** - 按分类组织任务
- **状态管理** - 标记任务完成状态
- **优先级** - 设置任务重要程度

### 界面定制
- **主题切换** - 多种预设主题
- **布局调整** - 自定义界面布局
- **响应式** - 适配不同设备尺寸


### 前置要求

- Node.js 18+
- Go 1.24+
- Docker & Docker Compose（可选）
- pnpm（推荐）

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/WindyDante/Clear
cd Clear
```

#### 2. 前端开发
```bash
# 进入前端目录
cd web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

#### 3. 后端开发
```bash
# 回到项目根目录
cd ..

# 安装Go依赖
go mod tidy

# 启动后端服务
go run cmd/server/main.go
```

#### 4. 访问应用
- 前端地址：http://localhost:5173
- 后端API：http://localhost:6633


## 📚 API文档

### 认证接口
```
POST /api/auth/register  # 用户注册
POST /api/auth/login     # 用户登录
POST /api/auth/logout    # 用户登出
GET  /api/auth/profile   # 获取用户信息
```

### 任务接口
```
GET    /api/todos        # 获取任务列表
POST   /api/todos        # 创建新任务
PUT    /api/todos/:id    # 更新任务
DELETE /api/todos/:id    # 删除任务
```

### 分类接口
```
GET    /api/categories   # 获取分类列表
POST   /api/categories   # 创建新分类
PUT    /api/categories/:id    # 更新分类
DELETE /api/categories/:id    # 删除分类
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. **Fork** 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 **Pull Request**

### 开发规范
- 遵循 Go 官方代码规范
- 使用 TypeScript 严格模式
- 提交信息采用约定式提交格式
- 添加必要的测试用例

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

- 项目灵感来源于 [Tika](https://github.com/lin-snow/Tika)
- 感谢所有开源社区的贡献者
- 特别感谢 [lin-snow](https://github.com/lin-snow) 的开源贡献

## 📧 联系我们

- 项目主页：https://github.com/WindyDante/Clear
- 在线体验：https://clear.1wind.cn/
- 问题反馈：[Issues](https://github.com/WindyDante/Clear/issues)

---

<p align="center">
  如果这个项目对您有帮助，请考虑给我们一个 ⭐ Star！
</p>

