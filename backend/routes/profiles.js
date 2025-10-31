const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

// 获取用户 Profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: '用户ID不能为空' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        console.log('Fetched profile for userId:', userId, data, error);

        if (error && error.code === 'PGRST116') { // PGRST116 = no rows found
            console.log('Profile not found, creating new one for userId:', userId);
            // 没有找到就需要创建一条新的记录
            const { data: newData, error: newError } = await supabase
                .from('profiles')
                .insert([{ 
                    id: userId,
                    username: '用户' + userId.slice(0, 5),
                    travel_preferences: '无' // 添加默认旅行偏好
                }])
                .select()
                .single();

            console.log('Created new profile for userId:', userId, newData, newError);
            
            if (newError) {
                console.error('Error creating profile:', newError);
                return res.status(500).json({ error: '创建用户信息失败', details: newError.message });
            }

            return res.json(newData);
        } else if (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: '获取用户信息失败', details: error.message });
        }
        
        if (!data) {
            return res.status(404).json({ error: '未找到用户信息' });
        }

        res.json(data);
    } catch (err) {
        console.error('Unexpected error in GET profile:', err);
        res.status(500).json({ error: '服务器内部错误', details: err.message });
    }
});

// 更新用户 Profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            username, 
            travel_preferences,
            xf_appid,
            xf_apisecret,
            xf_apikey,
            llm_apikey,
            map_apikey 
        } = req.body;

        if (!userId) {
            return res.status(400).json({ error: '用户ID不能为空' });
        }

        if (!username) {
            return res.status(400).json({ error: '用户名不能为空' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                username, 
                travel_preferences,
                xf_appid,
                xf_apisecret,
                xf_apikey,
                llm_apikey,
                map_apikey,
                updated_at: new Date(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ error: '更新用户信息失败', details: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Unexpected error in PUT profile:', err);
        res.status(500).json({ error: '服务器内部错误', details: err.message });
    }
});

module.exports = router;
