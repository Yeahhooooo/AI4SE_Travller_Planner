# 使用官方 Node.js 20 的轻量级 Alpine 镜像
FROM node:20-alpine AS base

# 设置工作目录
WORKDIR /app

# 设置 npm 镜像源为国内源，提高下载速度
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 生产环境构建阶段
FROM base AS production

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 创建非 root 用户运行应用
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 修改文件所有者
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3001

# # 健康检查 - 使用wget（Alpine默认包含）
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# 启动命令
CMD ["npm", "start"]