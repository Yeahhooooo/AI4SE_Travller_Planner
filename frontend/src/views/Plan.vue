<template>
  <div class="plan-container">
    <!-- 现代化头部 -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-left" @click="goHome">
          <el-icon :size="24" class="back-icon"><ArrowLeftBold /></el-icon>
          <span class="app-title">AI 旅行规划助手</span>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-info">
              <div class="user-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</div>
              <span class="user-email">{{ user?.email }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" class="profile-item">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" class="logout-item" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 欢迎区域 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h1 class="main-title">创建新的旅行计划</h1>
            <p class="main-subtitle">详细描述您的旅行想法，AI 将为您生成个性化的行程安排</p>
          </div>
          <div class="welcome-decoration">
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
          </div>
        </div>

        <!-- 输入表单卡片 -->
        <div class="input-card">
          <div class="card-header">
            <el-icon class="card-icon" :size="24"><MapLocation /></el-icon>
            <h3 class="card-title">描述您的旅行需求</h3>
          </div>
          
          <div class="input-section">
            <div class="textarea-wrapper">
              <textarea
                v-model="prompt"
                class="modern-textarea"
                rows="8"
                placeholder="例如：我想去东京玩5天，预算大概5000元，喜欢动漫和美食，希望能去秋叶原和浅草寺..."
              />
            </div>
            
            <div class="action-buttons">
              <button 
                :class="['voice-button', { 'recording': isRecording }]"
                @click="handleVoiceInput"
                :disabled="!isVoiceServiceReady"
              >
                <el-icon :size="20"><Microphone /></el-icon>
                <span>{{ isRecording ? '正在录音...' : '语音输入' }}</span>
                <div v-if="isRecording" class="recording-indicator"></div>
              </button>
              
              <button 
                class="generate-button"
                @click="generateTrip" 
                :disabled="isLoading"
              >
                <div v-if="isLoading" class="loading-spinner"></div>
                <el-icon v-else :size="20"><ArrowRight /></el-icon>
                <span>{{ isLoading ? '正在为您规划中...' : '生成行程' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification } from 'element-plus';
import { ArrowDown, MapLocation, Microphone, ArrowLeftBold, SwitchButton, ArrowRight, User } from '@element-plus/icons-vue';
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
  } else if (command === 'profile') {
    router.push({ name: 'Profile' });
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

<style scoped>
.plan-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.plan-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

/* 现代化头部样式 */
.modern-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-left:hover {
  transform: translateX(-2px);
}

.back-icon {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 12px;
  transition: all 0.3s ease;
}

.header-left:hover .back-icon {
  color: white;
  transform: translateX(-2px);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
}

.user-email {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-right: 8px;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: translateY(1px);
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 10;
  padding: 40px 24px;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.welcome-content {
  position: relative;
  z-index: 10;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.main-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.welcome-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  width: 100px;
  height: 100px;
  top: -200px;
  left: -300px;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  width: 60px;
  height: 60px;
  top: -100px;
  right: -250px;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  width: 80px;
  height: 80px;
  bottom: -150px;
  left: -200px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
}

/* 输入卡片样式 */
.input-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.input-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.card-icon {
  color: #667eea;
  margin-right: 16px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.textarea-wrapper {
  margin-bottom: 32px;
  position: relative;
}

.modern-textarea {
  width: 93%;
  min-height: 180px;
  padding: 20px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.6;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.modern-textarea::placeholder {
  color: rgba(45, 55, 72, 0.5);
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}

.voice-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.voice-button:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.voice-button.recording {
  border-color: #e53e3e;
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.voice-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-indicator {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e53e3e;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: translateY(-50%) scale(1); }
  50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
  100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
}

.generate-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.generate-button:active {
  transform: translateY(0);
}

.generate-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 下拉菜单样式 */
.profile-item,
.logout-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .main-title {
    font-size: 36px;
  }
  
  .main-subtitle {
    font-size: 16px;
  }
  
  .input-card {
    padding: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .voice-button,
  .generate-button {
    width: 100%;
    justify-content: center;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .user-email {
    display: none;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 28px;
  }
  
  .input-card {
    padding: 20px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .modern-textarea {
    min-height: 150px;
    padding: 16px;
  }
}
</style>