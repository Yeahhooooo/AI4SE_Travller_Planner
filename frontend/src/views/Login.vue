<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <el-card class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800">登录</h2>
          <p class="text-gray-500">欢迎回来！</p>
        </div>
      </template>
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" @submit.prevent="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="loginForm.email" placeholder="邮箱" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" show-password size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin(loginFormRef)" class="w-full" size="large" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="text-center mt-4">
        <router-link to="/register" class="text-sm text-blue-500 hover:underline">
          还没有账户？立即注册
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loginFormRef = ref();
const loading = ref(false);

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
        const { error } = await supabase.auth.signInWithPassword({
          email: loginForm.email,
          password: loginForm.password,
        });
        if (error) throw error;
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
