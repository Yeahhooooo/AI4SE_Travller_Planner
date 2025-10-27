<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <el-card class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
          <p class="text-gray-500">{{ subtitle }}</p>
        </div>
      </template>

      <!-- 注册表单 -->
      <div v-if="!registrationCompleted">
        <el-form ref="registerFormRef" :model="registerForm" :rules="rules" @submit.prevent="handleRegister">
          <el-form-item prop="email">
            <el-input v-model="registerForm.email" placeholder="邮箱" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="密码" show-password size="large" />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" show-password
              size="large" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister(registerFormRef)" class="w-full" size="large"
              :loading="loading">
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="text-center mt-4">
          <router-link to="/login" class="text-sm text-blue-500 hover:underline">
            已有账户？直接登录
          </router-link>
        </div>
      </div>

      <!-- 注册成功提示 -->
      <div v-else class="text-center">
        <el-icon :size="60" color="#67C23A" class="mb-4"><CircleCheckFilled /></el-icon>
        <p class="text-gray-600 mb-6">
          一封确认邮件已发送至您的邮箱
          <strong class="text-gray-800">{{ registerForm.email }}</strong>。
          请点击邮件中的链接以完成注册。
        </p>
        <el-button type="primary" @click="goToLogin" class="w-full" size="large">
          返回登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage } from 'element-plus';
import { CircleCheckFilled } from '@element-plus/icons-vue';

const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);
const registrationCompleted = ref(false);

const title = computed(() => registrationCompleted.value ? '请检查您的邮箱' : '创建新账户');
const subtitle = computed(() => registrationCompleted.value ? '完成最后一步以激活账户' : '加入我们，开启智能旅行新体验');

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
