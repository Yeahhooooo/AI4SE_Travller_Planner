<template>
  <div class="profile-container">
    <!-- 现代化头部 -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-left" @click="goBack">
          <el-icon :size="24" class="back-icon"><ArrowLeftBold /></el-icon>
          <span class="app-title">个人资料</span>
        </div>
        
        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">{{ userEmail?.charAt(0).toUpperCase() }}</div>
            <span class="user-email">{{ userEmail }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 页面标题区域 -->
        <div class="page-header">
          <div class="header-content-section">
            <h1 class="page-title">个人资料设置</h1>
            <p class="page-subtitle">管理您的个人信息和 API 密钥配置</p>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-card">
            <el-skeleton :rows="8" animated />
          </div>
        </div>

        <!-- 个人资料表单 -->
        <div v-else-if="profile" class="profile-form-container">
          <el-form 
            :model="profile" 
            ref="profileForm" 
            @submit.prevent="updateProfile"
            class="modern-form"
          >
            <!-- 基本信息卡片 -->
            <div class="form-section">
              <div class="section-header">
                <el-icon class="section-icon" :size="24"><User /></el-icon>
                <h3 class="section-title">基本信息</h3>
              </div>
              
              <div class="form-grid">
                <div class="form-item">
                  <label class="form-label">邮箱地址</label>
                  <div class="input-wrapper disabled">
                    <el-icon class="input-icon"><Message /></el-icon>
                    <input 
                      :value="userEmail" 
                      disabled 
                      class="modern-input disabled"
                    />
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label">用户名 *</label>
                  <div class="input-wrapper">
                    <el-icon class="input-icon"><User /></el-icon>
                    <input 
                      v-model="profile.username" 
                      placeholder="请输入用户名"
                      class="modern-input"
                      required
                    />
                  </div>
                </div>

                <div class="form-item full-width">
                  <label class="form-label">旅行偏好</label>
                  <div class="textarea-wrapper">
                    <textarea
                      v-model="profile.travel_preferences"
                      class="modern-textarea"
                      rows="4"
                      placeholder="例如：喜欢自然风光，对历史建筑感兴趣，预算有限，偏好经济型住宿..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- API 密钥管理卡片 -->
            <div class="form-section">
              <div class="section-header">
                <el-icon class="section-icon" :size="24"><Key /></el-icon>
                <h3 class="section-title">API 密钥管理</h3>
                <p class="section-description">配置各种服务的 API 密钥以启用相关功能</p>
              </div>
              
              <div class="api-keys-grid">
                <!-- 讯飞语音服务 -->
                <div class="api-group">
                  <h4 class="api-group-title">
                    <el-icon><Microphone /></el-icon>
                    讯飞语音服务
                  </h4>
                  
                  <div class="form-item">
                    <label class="form-label">APPID</label>
                    <div class="input-wrapper">
                      <el-icon class="input-icon"><Key /></el-icon>
                      <input 
                        v-model="profile.xf_appid" 
                        placeholder="请输入讯飞语音服务的 APPID"
                        class="modern-input"
                      />
                    </div>
                  </div>

                  <div class="form-item">
                    <label class="form-label">API Secret</label>
                    <div class="input-wrapper">
                      <el-icon class="input-icon"><Lock /></el-icon>
                      <input 
                        v-model="profile.xf_apisecret" 
                        :type="showXfSecret ? 'text' : 'password'"
                        placeholder="请输入讯飞语音服务的 APISecret"
                        class="modern-input"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showXfSecret = !showXfSecret"
                      >
                        <el-icon><View v-if="!showXfSecret" /><Hide v-else /></el-icon>
                      </button>
                    </div>
                  </div>

                  <div class="form-item">
                    <label class="form-label">API Key</label>
                    <div class="input-wrapper">
                      <el-icon class="input-icon"><Lock /></el-icon>
                      <input 
                        v-model="profile.xf_apikey" 
                        :type="showXfKey ? 'text' : 'password'"
                        placeholder="请输入讯飞语音服务的 APIKey"
                        class="modern-input"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showXfKey = !showXfKey"
                      >
                        <el-icon><View v-if="!showXfKey" /><Hide v-else /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 大语言模型服务 -->
                <div class="api-group">
                  <h4 class="api-group-title">
                    <el-icon><ChatDotRound /></el-icon>
                    大语言模型服务
                  </h4>
                  
                  <div class="form-item">
                    <label class="form-label">LLM API Key</label>
                    <div class="input-wrapper">
                      <el-icon class="input-icon"><Lock /></el-icon>
                      <input 
                        v-model="profile.llm_apikey" 
                        :type="showLlmKey ? 'text' : 'password'"
                        placeholder="请输入大语言模型服务的 APIKey"
                        class="modern-input"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showLlmKey = !showLlmKey"
                      >
                        <el-icon><View v-if="!showLlmKey" /><Hide v-else /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 地图服务 -->
                <div class="api-group">
                  <h4 class="api-group-title">
                    <el-icon><MapLocation /></el-icon>
                    地图服务
                  </h4>
                  
                  <div class="form-item">
                    <label class="form-label">地图 API Key</label>
                    <div class="input-wrapper">
                      <el-icon class="input-icon"><Lock /></el-icon>
                      <input 
                        v-model="profile.map_apikey" 
                        :type="showMapKey ? 'text' : 'password'"
                        placeholder="请输入地图服务的 APIKey"
                        class="modern-input"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showMapKey = !showMapKey"
                      >
                        <el-icon><View v-if="!showMapKey" /><Hide v-else /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button
                type="submit"
                class="save-button"
                :disabled="isUpdating"
                @click="updateProfile"
              >
                <div v-if="isUpdating" class="loading-spinner"></div>
                <el-icon v-else :size="20"><Check /></el-icon>
                <span>{{ isUpdating ? '保存中...' : '保存更改' }}</span>
              </button>
              
              <button
                type="button"
                class="cancel-button"
                @click="goBack"
              >
                <el-icon :size="20"><Close /></el-icon>
                <span>取消</span>
              </button>
            </div>
          </el-form>
        </div>

        <!-- 错误状态 -->
        <div v-else class="error-state">
          <div class="error-card">
            <div class="error-icon">
              <el-icon :size="64"><Warning /></el-icon>
            </div>
            <h3 class="error-title">无法加载个人资料</h3>
            <p class="error-subtitle">用户资料不存在或网络连接有问题</p>
            <button class="retry-button" @click="fetchProfile">
              <el-icon :size="20"><Refresh /></el-icon>
              <span>重试</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, ArrowLeftBold, Key, Lock, View, Hide, Message, Microphone, ChatDotRound, MapLocation, Check, Close, Warning, Refresh } from '@element-plus/icons-vue';
import { user as globalUser } from '../store/userStore';

const router = useRouter();
const profile = ref(null);
const isLoading = ref(true);
const isUpdating = ref(false);
const profileForm = ref(null);

// 密码显示状态
const showXfSecret = ref(false);
const showXfKey = ref(false);
const showLlmKey = ref(false);
const showMapKey = ref(false);

const userEmail = computed(() => globalUser.value?.email || '未知');

const fetchProfile = async () => {
  if (!globalUser.value) {
    ElMessage.error('用户未登录，无法获取个人资料。');
    router.push({ name: 'Login' });
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/profiles/${globalUser.value.id}`);
    if (!response.ok) {
      throw new Error('获取个人资料失败');
    }
    profile.value = await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    ElMessage.error(error.message);
    profile.value = null;
  } finally {
    isLoading.value = false;
  }
};

const updateProfile = async () => {
  const isValid = await profileForm.value.validate();
  if (!isValid) return;

  isUpdating.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/profiles/${globalUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: profile.value.username,
        travel_preferences: profile.value.travel_preferences,
        xf_appid: profile.value.xf_appid,
        xf_apisecret: profile.value.xf_apisecret,
        xf_apikey: profile.value.xf_apikey,
        llm_apikey: profile.value.llm_apikey,
        map_apikey: profile.value.map_apikey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '更新失败');
    }

    ElMessage.success('个人资料已更新！');
    router.push({ name: 'Dashboard' });

  } catch (error) {
    console.error('Error updating profile:', error);
    ElMessage.error(`更新失败: ${error.message}`);
  } finally {
    isUpdating.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.profile-container::before {
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

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 10;
  padding: 40px 24px;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
}

.loading-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 表单容器 */
.profile-form-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 表单分组 */
.form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.section-icon {
  color: #667eea;
  margin-right: 12px;
  padding: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
}

.section-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  margin-left: auto;
}

/* 表单网格 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

/* API 密钥网格 */
.api-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.api-group {
  padding: 24px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  background: rgba(102, 126, 234, 0.02);
}

.api-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 20px;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-wrapper.disabled {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(226, 232, 240, 0.5);
}

.input-icon {
  color: #a0aec0;
  margin-right: 12px;
  font-size: 16px;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

.modern-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 0;
  font-size: 16px;
  color: #2d3748;
  background: transparent;
}

.modern-input::placeholder {
  color: #a0aec0;
}

.modern-input.disabled {
  color: #a0aec0;
  cursor: not-allowed;
}

.password-toggle {
  border: none;
  background: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 文本域样式 */
.textarea-wrapper {
  position: relative;
}

.modern-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.8);
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
  color: #a0aec0;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 32px;
}

.save-button {
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
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #667eea;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
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

/* 错误状态 */
.error-state {
  display: flex;
  justify-content: center;
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  margin-bottom: 24px;
  color: #f6ad55;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.error-subtitle {
  font-size: 16px;
  color: #718096;
  margin-bottom: 32px;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .form-section {
    padding: 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .api-keys-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-button,
  .cancel-button {
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
  .page-title {
    font-size: 24px;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .api-group {
    padding: 20px;
  }
  
  .modern-input,
  .modern-textarea {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>
