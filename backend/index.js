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


app.get('/', (req, res) => {
  res.send('AI Traveler Planner Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { supabase };
