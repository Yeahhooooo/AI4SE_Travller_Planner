<template>
  <el-container class="h-screen">
    <el-header class="flex items-center justify-between bg-white border-b">
      <div class="flex items-center">
        <el-icon :size="24" class="mr-2 text-blue-500"><MapLocation /></el-icon>
        <span class="text-xl font-semibold">AI 旅行规划助手</span>
      </div>ß
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link flex items-center">
          {{ user?.email }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-main class="bg-gray-50 p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">仪表盘</h1>
        <p class="text-gray-500 mb-8">欢迎回来，开始你的下一次智能旅行吧！</p>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover" class="h-full">
              <template #header>
                <div class="flex items-center">
                  <el-icon :size="20" class="mr-2"><MapLocation /></el-icon>
                  <span class="font-semibold">智能行程规划</span>
                </div>
              </template>
              <p class="text-gray-600 mb-4">通过语音或文字输入你的旅行想法，AI 将为你生成包含预算建议的个性化旅行计划。</p>
              <el-button type="primary" class="w-full">开始规划</el-button>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="h-full">
              <template #header>
                <div class="flex items-center">
                  <el-icon :size="20" class="mr-2"><Collection /></el-icon>
                  <span class="font-semibold">我的旅行计划</span>
                </div>
              </template>
              <p class="text-gray-600 mb-4">查看和管理你所有已保存的旅行计划，随时回顾和修改，并跟踪相关开销。</p>
              <el-button type="primary" class="w-full">查看计划</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ArrowDown, MapLocation, Money, Collection } from '@element-plus/icons-vue';

const router = useRouter();
const user = ref(null);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
});

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push({ name: 'Login' });
};

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  }
};
</script>
