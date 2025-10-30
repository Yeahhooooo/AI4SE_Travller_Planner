<template>
  <el-container class="h-screen">
    <el-header class="flex items-center justify-between bg-white border-b">
      <div class="flex items-center cursor-pointer" @click="goHome">
        <el-icon :size="24" class="mr-2 text-blue-500"><ArrowLeftBold /></el-icon>
        <span class="text-xl font-semibold">AI 旅行规划助手</span>
      </div>
      <div class="flex items-center space-x-4">

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
      </div>
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
                <el-button :type="isRecording ? 'danger' : 'info'" plain :icon="Microphone" @click="handleVoiceInput">
                    {{ isRecording ? '正在录音...' : '语音输入' }}
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification } from 'element-plus';
import { ArrowDown, MapLocation, Microphone, ArrowLeftBold } from '@element-plus/icons-vue';
import { XfVoiceDictation } from '@muguilin/xf-voice-dictation';
import { user, profile } from '../store/userStore';


const router = useRouter();
const prompt = ref('');
const isLoading = ref(false);
const isRecording = ref(false);
let xfVoice = null;
const isVoiceServiceReady = ref(false);

onMounted(async () => {
  // 用户状态现在由全局 userStore 管理，不需要本地获取
  if (!user.value) {
    router.push({ name: 'Login' });
  }
  initXfVoice();
});

onUnmounted(() => {
  if (xfVoice && typeof xfVoice.destroy === 'function') {
    try {
      xfVoice.destroy();
    } catch (error) {
      console.error('Error destroying XF Voice Service:', error);
    }
  }
});

const initXfVoice = () => {
  try {
    // 检查是否有必要的 API 凭证
    if (!profile.value?.xf_appid || !profile.value?.xf_apisecret || !profile.value?.xf_apikey) {
      isVoiceServiceReady.value = false;
      console.warn('讯飞语音 API 凭证未完整设置，语音服务将不可用。');
      return;
    }

    // 请替换为您的讯飞开放平台凭证
    xfVoice = new XfVoiceDictation({
      APPID: profile.value.xf_appid,
      APISecret: profile.value.xf_apisecret,
      APIKey: profile.value.xf_apikey,

      // 监听录音状态变化回调
      onWillStatusChange: (oldStatus, newStatus) => {
        if (newStatus === 'ing') {
          isRecording.value = true;
        } else if (newStatus === 'end') {
          isRecording.value = false;
        }
      },

      // 监听识别结果的变化回调
      onTextChange: (text) => {
        prompt.value = text;
      },

      // 监听识别错误回调
      onError: (error) => {
        ElMessage.error(`语音识别失败: ${error.message}`);
        console.error('XF Voice Error:', error);
        isRecording.value = false;
      }
    });

    // 如果代码执行到这里没有抛出异常，说明基础初始化成功
    isVoiceServiceReady.value = true;

  } catch (error) {
    isVoiceServiceReady.value = false;
    ElMessage.error('语音服务初始化失败，请检查浏览器兼容性或刷新页面重试。');
    console.error('Failed to initialize XF Voice Service:', error);
    // 只有在开发环境或者用户明确尝试使用语音功能时才显示错误消息
    // ElMessage.error('语音服务初始化失败，请检查浏览器兼容性或刷新页面重试。');
  }
};

const goHome = () => {
  router.push({ name: 'Dashboard' });
};

const goBack = () => {
  router.back();
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
    if (!isVoiceServiceReady.value) {
        // 检查是否是因为缺少 API 凭证
        if (!profile.value?.xf_appid || !profile.value?.xf_apisecret || !profile.value?.xf_apikey) {
            ElMessage.error('语音服务需要配置讯飞 API 凭证，请在个人资料页面设置。');
        } else {
            ElMessage.error('语音服务尚未就绪，请稍候或刷新页面。');
        }
        return;
    }
    if (isRecording.value) {
        if (xfVoice && typeof xfVoice.stop === 'function') {
            xfVoice.stop();
        }
    } else {
        if (xfVoice && typeof xfVoice.start === 'function') {
            xfVoice.start();
        }
    }
};

const generateTrip = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入您的旅行需求！');
    return;
  }

  // 检查 API Key 是否存在
  if (!profile.value?.llm_apikey) {
    ElMessage.error('未找到 LLM API Key，请在个人资料页面设置。');
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
      body: JSON.stringify({ 
        prompt: prompt.value,
        apiKey: profile.value.llm_apikey // 传递 API Key
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const tripData = await response.json();

    // 将返回的完整行程数据存储在 sessionStorage 中，用于预览
    sessionStorage.setItem('tripPreview', JSON.stringify(tripData));

    // 新增：将首次大模型请求和响应写入 chatHistory
    const chatHistory = [
      { role: 'user', content: prompt.value },
      { role: 'assistant', content: 'AI 已为您生成初始行程。' }
    ];
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));

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
