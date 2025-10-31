require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabase'); // 从新文件中导入

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const mapRoutes = require('./routes/map');
const profileRoutes = require('./routes/profiles'); // 引入 profile 路由

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/profiles', profileRoutes); // 使用 profile 路由

// 根路由
app.get('/', (req, res) => {
  res.send('AI Traveler Planner Backend is running!');
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 不要立即退出，记录错误但继续运行
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 不要立即退出，记录错误但继续运行
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
