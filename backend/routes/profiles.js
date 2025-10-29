const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

// 获取用户 Profile
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: '获取用户信息失败' });
    }

    if (!data) {
        return res.status(404).json({ error: '未找到用户信息' });
    }

    res.json(data);
});

// 更新用户 Profile
router.put('/:userId', async (req, res) => {
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
        return res.status(500).json({ error: '更新用户信息失败' });
    }

    res.json(data);
});

module.exports = router;
