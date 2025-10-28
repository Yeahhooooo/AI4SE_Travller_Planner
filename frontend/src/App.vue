<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { supabase } from './supabase';
import { setUser, clearUser } from './store/userStore';

onMounted(() => {
  // 监听 Supabase 的认证状态变化
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      // 如果用户已登录，将用户信息存储到全局状态
      setUser(session.user);
    } else {
      // 如果用户已退出，清除全局状态中的用户信息
      clearUser();
    }
  });
});
</script>

