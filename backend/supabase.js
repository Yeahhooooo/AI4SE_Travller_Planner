const { createClient } = require('@supabase/supabase-js');

// 从环境变量中获取 Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 创建并导出 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };
