<template>
  <el-container class="h-screen">
    <el-header class="flex items-center justify-between bg-white border-b px-8">
      <div class="flex items-center cursor-pointer" @click="goHome">
        <el-icon :size="24" class="mr-2 text-blue-500"><MapLocation /></el-icon>
        <span class="text-xl font-semibold">AI 旅行规划助手</span>
      </div>
      <div>
        <el-button 
          v-if="isPreview"
          type="primary" 
          :icon="Finished"
          @click="saveTrip"
          :loading="isSaving"
        >
          保存到我的计划
        </el-button>
        <el-button :icon="Back" @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-container>
      <el-aside width="350px" class="bg-white p-6 border-r">
        <h2 class="text-2xl font-bold mb-4">地图规划 (预留)</h2>
        <div class="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">百度地图 API 位置</p>
        </div>
      </el-aside>

      <el-main class="bg-gray-50 p-8" v-loading="isLoading" element-loading-text="正在加载行程详情...">
        <div v-if="!isLoading && trip" class="max-w-7xl mx-auto">
          <!-- 行程头部信息 -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">{{ trip.name }}</h1>
            <div class="flex items-center text-gray-500 mt-2">
              <span>{{ formatDate(trip.start_date) }}</span>
              <el-icon class="mx-2"><Right /></el-icon>
              <span>{{ formatDate(trip.end_date) }}</span>
              <el-divider direction="vertical" />
              <span>预算: <strong>¥{{ trip.budget }}</strong></span>
            </div>
          </div>

          <!-- 时间线按天分组 -->
          <div v-for="(day, date) in groupedEvents" :key="date">
            <h3 class="text-xl font-semibold my-4 pb-2 border-b">{{ formatDate(date, true) }}</h3>
            <el-timeline>
              <el-timeline-item 
                v-for="event in day" 
                :key="event.id" 
                :timestamp="formatTimestamp(event.start_time)" 
                placement="top"
                :type="getEventType(event.type)"
                :icon="getEventIcon(event.type)"
              >
                <el-card>
                  <h4 class="font-semibold text-lg">{{ event.description }}</h4>
                  <p class="text-gray-600 mt-1">
                    <el-icon><Location /></el-icon>
                    {{ event.location }}
                  </p>
                  <!-- 显示预期费用 -->
                  <div v-if="event.expenses && event.expenses.length > 0" class="mt-2 text-sm text-orange-600">
                    <el-tag type="warning" size="small" effect="light">
                      预期消费: ¥{{ calculateTotalExpense(event.expenses) }}
                    </el-tag>
                  </div>
                  <div class="mt-2">
                    <el-button size="small" type="primary" plain>记录实际开销</el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>

        </div>
        <el-empty v-if="!isLoading && !trip" description="行程不存在或加载失败"></el-empty>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification } from 'element-plus';
import { 
  MapLocation, Right, Location, Ship, ForkSpoon, ShoppingCart, House, Finished, Back 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const user = ref(null);
const trip = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);

const tripId = computed(() => route.params.id);
const isPreview = computed(() => tripId.value === 'preview');

// 将事件按日期分组
const groupedEvents = computed(() => {
  if (!trip.value || !trip.value.events) return {};
  // 预览数据和持久化数据的字段名可能不同，做兼容
  const events = trip.value.events || trip.value.trip_events || [];
  return events.reduce((acc, event) => {
    const date = event.start_time.split('T')[0]; // 获取 YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});
});

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user) {
    user.value = authData.user;
  } else {
    router.push({ name: 'Login' });
    return;
  }
  
  if (isPreview.value) {
    loadPreviewData();
  } else {
    await fetchTripDetails();
  }
});

const loadPreviewData = () => {
  isLoading.value = true;
  const previewData = sessionStorage.getItem('tripPreview');
  if (previewData) {
    const parsedData = JSON.parse(previewData);
    // 构造一个与 fetchTripDetails 返回结构一致的对象
    trip.value = {
        name: parsedData.trip_name,
        start_date: parsedData.start_date,
        end_date: parsedData.end_date,
        budget: parsedData.budget,
        events: parsedData.events
    };
    isLoading.value = false;
  } else {
    ElMessage.error('找不到预览数据，请返回重新生成。');
    router.push({ name: 'Plan' });
    isLoading.value = false;
  }
};

const fetchTripDetails = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/trips/${tripId.value}`);
    if (!response.ok) {
        throw new Error('行程加载失败');
    }
    const data = await response.json();
    trip.value = data;
  } catch (error) {
    console.error('Failed to fetch trip details:', error);
    ElMessage.error(error.message);
    trip.value = null;
  } finally {
    isLoading.value = false;
  }
};

const saveTrip = async () => {
  isSaving.value = true;
  try {
    if (!user.value) {
      ElMessage.error('用户未登录，无法保存！');
      router.push({ name: 'Login' });
      return;
    }

    // 从 trip.value 构造后端需要的 tripData
    const tripDataToSave = {
        trip_name: trip.value.name,
        start_date: trip.value.start_date,
        end_date: trip.value.end_date,
        budget: trip.value.budget,
        events: trip.value.events
    };

    const response = await fetch('http://localhost:3000/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tripData: tripDataToSave,
        userId: user.value.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save the trip.');
    }

    const { tripId: newTripId } = await response.json();

    // 清除 sessionStorage 中的预览数据
    sessionStorage.removeItem('tripPreview');

    ElNotification({
      title: '保存成功',
      message: '您的行程已成功保存到计划中。',
      type: 'success',
    });

    // 使用 replace 防止用户回退到预览页
    router.replace({ name: 'TripDetails', params: { id: newTripId } });

  } catch (error) {
    console.error('Error saving trip:', error);
    ElMessage.error(`保存失败: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

const goHome = () => router.push({ name: 'Dashboard' });
const goBack = () => router.back();

// --- Helper Functions ---
const formatDate = (dateStr, withWeekday = false) => {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (withWeekday) {
    options.weekday = 'long';
  }
  return new Date(dateStr).toLocaleDateString('zh-CN', options);
};
const formatTimestamp = (ts) => new Date(ts).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

const getEventType = (type) => {
  const map = { activity: 'primary', accommodation: 'success', transport: 'info', dining: 'warning' };
  return map[type] || 'primary';
};

const getEventIcon = (type) => {
  const map = { activity: ShoppingCart, accommodation: House, transport: Ship, dining: ForkSpoon };
  return map[type] || ShoppingCart;
};

const calculateTotalExpense = (expenses) => {
  if (!expenses) return 0;
  return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
};
</script>
