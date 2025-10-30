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
        <!-- 注册表单 -->
        <div v-if="!registrationCompleted">
          <!-- 顶部标题区域 -->
          <div class="auth-header">
            <div class="app-logo">
              <el-icon :size="48" class="logo-icon"><MapLocation /></el-icon>
            </div>
            <h1 class="auth-title">创建新账户</h1>
            <p class="auth-subtitle">加入我们，开启智能旅行新体验</p>
          </div>

          <!-- 注册表单 -->
          <div class="auth-form">
            <el-form ref="registerFormRef" :model="registerForm" :rules="rules" @submit.prevent="handleRegister">
              <el-form-item prop="email" class="form-item">
                <div class="input-wrapper">
                  <el-icon class="input-icon"><Message /></el-icon>
                  <input
                    v-model="registerForm.email"
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
                    v-model="registerForm.password"
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

              <el-form-item prop="confirmPassword" class="form-item">
                <div class="input-wrapper">
                  <el-icon class="input-icon"><Lock /></el-icon>
                  <input
                    v-model="registerForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="请确认密码"
                    class="modern-input"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <el-icon><View v-if="!showConfirmPassword" /><Hide v-else /></el-icon>
                  </button>
                </div>
              </el-form-item>

              <button
                type="submit"
                class="auth-button"
                :disabled="loading"
                @click="handleRegister(registerFormRef)"
              >
                <div v-if="loading" class="loading-spinner"></div>
                <span>{{ loading ? '注册中...' : '注册' }}</span>
              </button>
            </el-form>
          </div>

          <!-- 底部链接 -->
          <div class="auth-footer">
            <p class="switch-text">
              已有账户？
              <router-link to="/login" class="switch-link">直接登录</router-link>
            </p>
          </div>
        </div>

        <!-- 注册成功提示 -->
        <div v-else class="success-state">
          <div class="success-header">
            <div class="success-icon">
              <el-icon :size="64" class="check-icon"><CircleCheckFilled /></el-icon>
            </div>
            <h1 class="success-title">请检查您的邮箱</h1>
            <p class="success-subtitle">完成最后一步以激活账户</p>
          </div>
          
          <div class="success-content">
            <div class="email-info">
              <p class="email-text">
                一封确认邮件已发送至
              </p>
              <p class="email-address">{{ registerForm.email }}</p>
              <p class="instruction-text">
                请点击邮件中的链接以完成注册
              </p>
            </div>
          </div>

          <div class="success-footer">
            <button class="auth-button" @click="goToLogin">
              返回登录
            </button>
          </div>
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
import { CircleCheckFilled, MapLocation, Message, Lock, View, Hide } from '@element-plus/icons-vue';

const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);
const registrationCompleted = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
});

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (registerForm.confirmPassword !== '') {
      if (!registerFormRef.value) return
      registerFormRef.value.validateField('confirmPassword', () => null)
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
});

const handleRegister = async (formEl) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const { data, error } = await supabase.auth.signUp({
          email: registerForm.email,
          password: registerForm.password,
        });
        if (error) throw error;
        
        // 只有当 Supabase 返回了用户数据且没有 session 时，才认为是需要邮箱验证的新注册
        if (data.user && !data.session) {
            registrationCompleted.value = true;
        } else {
            // 如果用户已存在或因其他原因直接返回了 session，则提示并跳转
            ElMessage.success('您已登录！');
            router.push({ name: 'Dashboard' });
        }

      } catch (error) {
        ElMessage.error(error.message || '注册失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

const goToLogin = () => {
  router.push({ name: 'Login' });
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

/* 注册成功状态样式 */
.success-state {
  text-align: center;
}

.success-header {
  margin-bottom: 32px;
}

.success-icon {
  margin-bottom: 24px;
}

.check-icon {
  color: #48bb78;
  padding: 16px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 178, 172, 0.1));
  border-radius: 50%;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.success-subtitle {
  font-size: 16px;
  color: #718096;
  line-height: 1.5;
}

.success-content {
  margin-bottom: 32px;
}

.email-info {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.email-text {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.email-address {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
  word-break: break-all;
}

.instruction-text {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 32px 24px;
  }
  
  .auth-title,
  .success-title {
    font-size: 28px;
  }
  
  .auth-subtitle,
  .success-subtitle {
    font-size: 14px;
  }
  
  .modern-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .email-info {
    padding: 20px;
  }
}
</style>
