# 构建阶段
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 清理npm缓存以减小镜像大小
RUN npm cache clean --force

# 安装依赖（不使用本地缓存）
RUN pnpm install --no-frozen-lockfile

# 现在只复制源代码文件，避开node_modules
COPY src/ ./src/
COPY public/ ./public/
COPY *.json ./
COPY *.ts ./
COPY .env.* ./
COPY index.html ./

# 构建项目 - 明确使用生产环境配置
RUN pnpm build:prod

# 生产阶段
FROM nginx:alpine AS production

# 从构建阶段复制生成的静态文件
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（前端单页应用路由配置）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]