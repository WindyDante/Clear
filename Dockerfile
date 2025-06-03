# 使用 Node.js Alpine 镜像作为前端构建阶段
FROM node:20-alpine AS frontend-build

# 设置时区为上海
ENV TZ=Asia/Shanghai

# 设置前端工作目录
WORKDIR /app/web

# 安装pnpm
RUN npm install -g pnpm

# 复制前端依赖文件
COPY web/package.json web/pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --no-frozen-lockfile

# 复制前端源代码（排除node_modules）
COPY web/src ./src/
COPY web/public ./public/
COPY web/index.html ./
COPY web/vite.config.ts ./
COPY web/tsconfig*.json ./
COPY web/.env* ./

# 构建项目
RUN pnpm build

# 复制构建后的文件到临时目录
RUN mv dist /app/template

# 使用 Golang Alpine 镜像作为后端构建阶段
FROM golang:1.24.3-alpine AS backend-build

# 设置后端工作目录
WORKDIR /app

# 安装构建时所需的工具
RUN apk add --no-cache gcc musl-dev

# 设置环境变量启用 cgo
ENV CGO_ENABLED=1

# 复制Go模块文件（现在在根目录）
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码（现在在根目录）
COPY cmd ./cmd/
COPY internal ./internal/
COPY pkg ./pkg/
COPY config ./config/

# 创建并设置权限
RUN mkdir -p /app/data && chmod -R 777 /app/data

# 构建 Go 后端应用
RUN go build -o /app/clear ./cmd/server/main.go

# 使用更轻量的 Alpine 镜像作为运行时阶段
FROM alpine:latest AS final

# 设置时区为上海
ENV TZ=Asia/Shanghai

WORKDIR /app

# 安装系统根证书，避免 HTTPS 请求失败
RUN apk add --no-cache ca-certificates tzdata

# 复制构建阶段的文件
COPY --from=backend-build /app/config /app/config
COPY --from=backend-build /app/clear /app/clear
COPY --from=frontend-build /app/template /app/template

# 创建数据目录
RUN mkdir -p /app/data && chmod -R 777 /app/data

# 暴露端口
EXPOSE 6633

# 运行后端服务
CMD ["/app/clear"]