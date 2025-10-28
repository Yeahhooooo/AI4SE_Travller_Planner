require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Supabase 初始化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 检查环境变量是否加载成功
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase URL or Anon Key is missing. Please check your .env file.");
  process.exit(1); // 退出进程
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

// 路由
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const mapRoutes = require('./routes/map');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/map', mapRoutes);


app.get('/', (req, res) => {
  res.send('AI Traveler Planner Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { supabase };
