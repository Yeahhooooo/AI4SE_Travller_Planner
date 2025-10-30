<template>
  <el-container class="h-screen">
    <el-header class="flex items-center justify-between bg-white border-b">
      <div class="flex items-center cursor-pointer" @click="goBack">
        <el-icon :size="24" class="mr-2 text-blue-500"><ArrowLeftBold /></el-icon>
        <span class="text-xl font-semibold">我的旅行计划</span>
      </div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link flex items-center">
          {{ user?.email }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人资料</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-main class="bg-gray-50 p-8">
      <div class="max-w-7xl mx-auto">
        <el-table :data="trips" stripe class="w-full">
          <el-table-column prop="name" label="标题"></el-table-column>
          <el-table-column prop="start_date" label="开始日期"></el-table-column>
          <el-table-column prop="end_date" label="结束日期"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="viewTrip(scope.row.id)">查看</el-button>
              <el-button size="small" type="danger" @click="deleteTrip(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ArrowDown, ArrowLeftBold } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const user = ref(null);
const trips = ref([]);

onMounted(async () => {
  const { data: userData } = await supabase.auth.getUser();
  user.value = userData.user;
  if (user.value) {
    fetchTrips();
  }
});

const fetchTrips = async () => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false });

  if (error) {
    ElMessage.error('获取旅行计划失败');
    console.error('Error fetching trips:', error);
  } else {
    trips.value = data;
  }
};

const viewTrip = (id) => {
  router.push({ name: 'TripDetails', params: { id } });
};

const deleteTrip = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个旅行计划吗？此操作不可撤销。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) {
      throw error;
    }
    
    ElMessage.success('旅行计划已删除');
    fetchTrips(); // Refresh the list
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('Error deleting trip:', error);
    }
  }
};

const goBack = () => {
  router.push({ name: 'Dashboard' });
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
</script>
