<template>
  <el-container class="h-screen">
    <el-header class="flex items-center justify-between bg-white border-b">
      <div class="flex items-center cursor-pointer" @click="goHome">
        <el-icon :size="24" class="mr-2 text-blue-500"><MapLocation /></el-icon>
        <span class="text-xl font-semibold">AI 旅行规划助手</span>
      </div>
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
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">创建新的旅行计划</h1>
        <p class="text-gray-500 mb-8">请详细描述您的旅行想法，AI 将为您生成一份个性化的行程安排。</p>

        <el-card shadow="never">
          <el-form @submit.prevent="generateTrip">
            <el-form-item label="您的旅行需求">
              <el-input
                v-model="prompt"
                type="textarea"
                :rows="6"
                placeholder="例如：我想去东京玩5天，预算大概5000元，喜欢动漫和美食，希望能去秋叶原和浅草寺。"
              />
            </el-form-item>
            
            <!-- 预留的语音输入按钮位置 -->
            <div class="flex justify-between items-center mt-4">
                <el-button type="info" plain :icon="Microphone" @click="handleVoiceInput">
                    语音输入 (待实现)
                </el-button>
                <el-button type="primary" @click="generateTrip" :loading="isLoading">
                    <span v-if="!isLoading">生成行程</span>
                    <span v-else>正在为您规划中...</span>
                </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification } from 'element-plus';
import { ArrowDown, MapLocation, Microphone } from '@element-plus/icons-vue';

const router = useRouter();
const user = ref(null);
const prompt = ref('');
const isLoading = ref(false);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    user.value = data.user;
  } else {
    router.push({ name: 'Login' });
  }
});

const goHome = () => {
  router.push({ name: 'Dashboard' });
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push({ name: 'Login' });
};

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  }
};

const handleVoiceInput = () => {
    // 预留功能
    ElMessage.info('语音输入功能正在开发中...');
};

const generateTrip = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入您的旅行需求！');
    return;
  }

  isLoading.value = true;

  try {
    // 调用后端的 generate 接口，该接口只生成数据，不存入数据库
    const response = await fetch('http://localhost:3001/api/trips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.value }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const tripData = await response.json();

    // 将返回的完整行程数据存储在 sessionStorage 中，用于预览
    sessionStorage.setItem('tripPreview', JSON.stringify(tripData));

    ElNotification({
      title: '规划成功！',
      message: '您的专属行程已生成，即将跳转到预览页。',
      type: 'success',
    });

    // 跳转到行程详情页进行预览，使用一个特殊的 ID 'preview'
    router.push({ name: 'TripDetails', params: { id: 'preview' } });

  } catch (error) {
    ElMessage.error(`行程生成失败: ${error.message}`);
    console.error('Error generating trip:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
