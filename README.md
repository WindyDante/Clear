# Clear

> **简洁之美，效率之选 | Simplicity meets efficiency**

Clear是一款极简而强大的待办事项管理应用，专为注重效率和简洁的用户设计。通过精心打造的界面和强大的功能，帮助您轻松管理日常任务，提高工作效率。

Clear is a powerful yet minimalist todo list application designed for efficiency-focused users. With its elegantly crafted interface and robust features, it helps you effortlessly manage daily tasks and boost productivity.

## 为什么选择Clear? | Why Choose Clear?

- 🚀 **高效简洁** - 专注于核心功能，没有繁琐干扰
- 🎨 **美观定制** - 多种主题和自定义选项满足个性需求
- 🔒 **安全可靠** - 数据安全存储，支持账户系统
- 🔄 **跨平台同步** - 随时随地访问您的任务列表
- 💡 **智能提醒** - 不错过任何重要待办事项

- 🚀 **Efficient & Clean** - Focus on core functionality without distractions
- 🎨 **Beautiful & Customizable** - Multiple themes and personalization options
- 🔒 **Secure & Reliable** - Safe data storage with account system
- 🔄 **Cross-platform Sync** - Access your tasks from anywhere
- 💡 **Smart Reminders** - Never miss an important task

## 功能特性 | Features

- 📝 添加、编辑和删除任务 | Add, edit, and delete tasks
- ✅ 将任务标记为已完成 | Mark tasks as completed
- 📅 简洁清晰的界面设计 | Simple and clean interface
- 🎭 多种主题选择 | Multiple themes
- 📊 任务分类与标签管理 | Task categorization and tag management
- 🔍 强大的搜索与筛选功能 | Powerful search and filtering
- 💾 后端数据持久化存储 | Backend with data persistence
- ⚡ 轻量快速的用户体验 | Lightweight and fast user experience
- 📱 响应式设计，适配各种设备 | Responsive design for all devices

## 技术栈 | Tech Stack

### 当前版本 | Current Version
- **前端 | Frontend**: Vue 3 + Vite + TypeScript + Pinia
- **后端 | Backend**: Spring Boot 3 + Redis + MySQL 8
- **部署 | Deployment**: Docker Compose

### 即将推出 | Coming Soon
- **个人版 | Personal Version**: Go + SQLite (极简数据库，低内存占用)
- **邮件在线提醒**

## 开始使用 | Getting Started

### 选项1：使用Docker（推荐） | Option 1: Docker (Recommended)

```bash
# 克隆仓库 | Clone the repository
git clone https://github.com/WindyDante/Clear.git
cd Clear

# 使用Docker Compose运行 | Run with Docker Compose
docker-compose up -d
```

运行后，通过以下地址访问应用 | After running, access the application at:
- http://localhost:3668

### 选项2：开发环境设置 | Option 2: Development Setup

```bash
# 克隆仓库 | Clone the repository
git clone https://github.com/WindyDante/Clear.git
cd Clear

# 前端设置 | Frontend setup
cd Clear-Web
pnpm install
pnpm run dev

# 后端设置（需要Java 17+和Maven） | Backend setup (requires Java 17+ and Maven)
cd ../Clear-Backend
mvn clean package
java -jar clear-server/target/clear-server-1.0.0.jar
```

## 致谢 | Acknowledgements

项目基于[Tika](https://github.com/lin-snow/Tika)模板进行修改开发。在此特别感谢原作者[lin-snow](https://github.com/lin-snow)的开源贡献，提供了这个优秀的项目。

本项目在Tika的基础上进行了个性化定制和功能扩展，旨在满足特定需求。保留了原项目的精髓，同时融入了新的设计理念和功能特性。

This project is developed based on the [Tika](https://github.com/lin-snow/Tika) template. Special thanks to the original author [lin-snow](https://github.com/lin-snow) for their open-source contribution and excellent project.

Clear builds upon Tika with personalized customizations and feature extensions to meet specific needs. It preserves the essence of the original project while incorporating new design philosophies and functional features.

## 支持项目 | Support the Project

如果您喜欢这个项目，请考虑给我一个Star⭐，这将是对我最大的支持！后续会推出个人版的Go后端+SQLite极简数据库，将极度压缩内存占用，为个人用户提供更轻量级的解决方案。

If you like this project, please consider giving it a Star⭐, which would be the greatest support for me! In the future, we'll release a personal version with Go backend + SQLite minimalist database, which will greatly reduce memory usage and provide a more lightweight solution for individual users.

