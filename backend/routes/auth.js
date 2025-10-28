const express = require('express');
const router = express.Router();
const { supabase } = require('../index');

// 用户注册
router.post('/register', async (req, res) => {

  console.log('Register request body:', req.body); // 调试日志
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 可选：在 profiles 表中创建一条记录
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                id: data.user.id, 
                username: email.split('@')[0],
                travel_preferences: '无' // 添加默认旅行偏好
            }]);
        
        if (profileError) {
            // 即便 profile 创建失败，注册本身也算成功，这里只记录错误
            console.error('Error creating profile:', profileError.message);
        }
    }

    res.status(201).json({ message: 'User registered successfully. Please check your email for verification.', user: data.user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Login successful.', session: data.session, user: data.user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
