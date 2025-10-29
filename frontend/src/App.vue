<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { supabase } from './supabase';
import { setUser, setProfile, clearUser } from './store/userStore';
import { ElMessage } from 'element-plus';

// 定义一个可复用的函数来获取并设置用户资料
const fetchAndSetUserProfile = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/profiles/${userId}`);
    if (!response.ok) {
      // 如果后端返回404或其它错误，我们不抛出异常，而是设置 profile 为 null
      if (response.status === 404) {
        console.warn(`Profile not found for user: ${userId}`);
        setProfile(null);
      } else {
        throw new Error(`获取用户资料失败，状态码: ${response.status}`);
      }
    } else {
      const profileData = await response.json();
      setProfile(profileData);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    ElMessage.error('加载用户配置失败，部分功能可能受限。');
    setProfile(null); // 出错时也确保 profile 是 null
  }
};

onMounted(() => {
  // 监听 Supabase 的认证状态变化
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session && session.user) {
      // 如果用户已登录，将用户信息存储到全局状态
      setUser(session.user);
      // 紧接着，获取并存储用户的个人资料
      await fetchAndSetUserProfile(session.user.id);
    } else {
      // 如果用户已退出，清除全局状态中的用户信息和资料
      clearUser();
    }
  });
});
</script>

