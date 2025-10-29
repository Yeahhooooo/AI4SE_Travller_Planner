<template>
  <div class="p-8 max-w-2xl mx-auto">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center">
          <el-icon :size="24" class="mr-2"><User /></el-icon>
          <span class="text-xl font-bold">个人资料</span>
        </div>
      </template>
      
      <div v-if="isLoading" class="text-center">
        <el-skeleton :rows="5" animated />
      </div>

      <el-form 
        v-else-if="profile" 
        :model="profile" 
        ref="profileForm" 
        label-width="100px"
        @submit.prevent="updateProfile"
      >
        <el-form-item label="邮箱">
          <el-input :value="userEmail" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="username" :rules="{ required: true, message: '用户名不能为空', trigger: 'blur' }">
          <el-input v-model="profile.username" />
        </el-form-item>
        <el-form-item label="旅行偏好" prop="travel_preferences">
          <el-input 
            v-model="profile.travel_preferences" 
            type="textarea"
            :rows="4"
            placeholder="例如：喜欢自然风光，对历史建筑感兴趣，预算有限，偏好经济型住宿..."
          />
        </el-form-item>

        <el-divider>API 密钥管理</el-divider>

        <el-form-item label="讯飞APPID" prop="xf_appid">
          <el-input v-model="profile.xf_appid" placeholder="请输入讯飞语音服务的 APPID" />
        </el-form-item>
        <el-form-item label="讯飞APISecret" prop="xf_apisecret">
          <el-input v-model="profile.xf_apisecret" type="password" show-password placeholder="请输入讯飞语音服务的 APISecret" />
        </el-form-item>
        <el-form-item label="讯飞APIKey" prop="xf_apikey">
          <el-input v-model="profile.xf_apikey" type="password" show-password placeholder="请输入讯飞语音服务的 APIKey" />
        </el-form-item>
        <el-form-item label="LLM APIKey" prop="llm_apikey">
          <el-input v-model="profile.llm_apikey" type="password" show-password placeholder="请输入大语言模型服务的 APIKey" />
        </el-form-item>
        <el-form-item label="地图 APIKey" prop="map_apikey">
          <el-input v-model="profile.map_apikey" type="password" show-password placeholder="请输入地图服务的 APIKey" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="updateProfile" :loading="isUpdating">
            保存更改
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>

      <el-empty v-else description="无法加载个人资料，或用户资料不存在。">
        <el-button type="primary" @click="fetchProfile">重试</el-button>
      </el-empty>

    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User } from '@element-plus/icons-vue';
import { user as globalUser } from '../store/userStore';

const router = useRouter();
const profile = ref(null);
const isLoading = ref(true);
const isUpdating = ref(false);
const profileForm = ref(null);

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
