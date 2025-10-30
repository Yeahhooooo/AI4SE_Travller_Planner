<template>
  <div class="auth-container">
    <!-- 背景装饰 -->
    <div class="auth-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="auth-content">
      <div class="auth-card">
        <!-- 顶部标题区域 -->
        <div class="auth-header">
          <div class="app-logo">
            <el-icon :size="48" class="logo-icon"><MapLocation /></el-icon>
          </div>
          <h1 class="auth-title">欢迎回来</h1>
          <p class="auth-subtitle">登录您的账户，继续您的智能旅行之旅</p>
        </div>

        <!-- 登录表单 -->
        <div class="auth-form">
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" @submit.prevent="handleLogin">
            <el-form-item prop="email" class="form-item">
              <div class="input-wrapper">
                <el-icon class="input-icon"><Message /></el-icon>
                <input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  class="modern-input"
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="password" class="form-item">
              <div class="input-wrapper">
                <el-icon class="input-icon"><Lock /></el-icon>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="modern-input"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <el-icon><View v-if="!showPassword" /><Hide v-else /></el-icon>
                </button>
              </div>
            </el-form-item>

            <button
              type="submit"
              class="auth-button"
              :disabled="loading"
              @click="handleLogin(loginFormRef)"
            >
              <div v-if="loading" class="loading-spinner"></div>
              <span>{{ loading ? '登录中...' : '登录' }}</span>
            </button>
          </el-form>
        </div>

        <!-- 底部链接 -->
        <div class="auth-footer">
          <p class="switch-text">
            还没有账户？
            <router-link to="/register" class="switch-link">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage } from 'element-plus';
import { setUser } from '../store/userStore'; // 引入 setUser
import { MapLocation, Message, Lock, View, Hide } from '@element-plus/icons-vue';

const router = useRouter();
const loginFormRef = ref();
const loading = ref(false);
const showPassword = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const handleLogin = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginForm.email,
          password: loginForm.password,
        });
        if (error) throw error;
        
        // 登录成功后，将用户信息存储到全局状态
        if (data.user) {
          setUser(data.user);
        }

        ElMessage.success('登录成功！');
        router.push({ name: 'Dashboard' });
      } catch (error) {
        ElMessage.error(error.message || '登录失败');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 20%;
  right: 30%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
  33% { transform: translateY(-20px) rotate(120deg); opacity: 0.8; }
  66% { transform: translateY(20px) rotate(240deg); opacity: 0.3; }
}

.auth-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-logo {
  margin-bottom: 24px;
}

.logo-icon {
  color: #667eea;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 16px;
  color: #718096;
  line-height: 1.5;
}

.auth-form {
  margin-bottom: 32px;
}

.form-item {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-icon {
  color: #a0aec0;
  margin-right: 12px;
  font-size: 18px;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #667eea;
}

.modern-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 16px 0;
  font-size: 16px;
  color: #2d3748;
  background: transparent;
}

.modern-input::placeholder {
  color: #a0aec0;
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

.auth-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button:disabled {
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

.auth-footer {
  text-align: center;
}

.switch-text {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.switch-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.switch-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 32px 24px;
  }
  
  .auth-title {
    font-size: 28px;
  }
  
  .auth-subtitle {
    font-size: 14px;
  }
  
  .modern-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>
