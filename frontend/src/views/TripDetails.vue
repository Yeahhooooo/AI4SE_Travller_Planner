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
      <el-aside width="500px" class="bg-white p-6 border-r flex flex-col">
        <h2 class="text-2xl font-bold mb-4 flex-shrink-0">路线地图</h2>
        <div id="map-container" class="w-full rounded-lg flex-grow bg-gray-200">
          <div v-if="mapLoadingText" class="flex items-center justify-center h-full">
            <p class="text-gray-500">{{ mapLoadingText }}</p>
          </div>
        </div>
      </el-aside>

      <el-main class="bg-gray-50 p-8" v-loading="isLoading" element-loading-text="正在加载行程详情...">
        <div v-if="!isLoading && trip" class="max-w-5xl mx-auto">
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
                  <div class="mt-2 flex justify-end space-x-2">
                    <el-button size="small" :icon="Edit" circle @click="openEditDialog(event)" />
                    <el-button size="small" :icon="Delete" type="danger" circle @click="handleDeleteEvent(event.id)" />
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div class="mt-4 pl-10">
                <el-button type="primary" plain :icon="Plus" @click="openAddDialog(date)">
                    在 {{ formatDate(date) }} 添加新事件
                </el-button>
            </div>
          </div>

        </div>
        <el-empty v-if="!isLoading && !trip" description="行程不存在或加载失败"></el-empty>
      </el-main>
    </el-container>

    <!-- 事件编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="currentEvent" ref="eventForm" label-width="80px">
        <el-form-item label="活动描述" prop="description" :rules="{ required: true, message: '请输入活动描述', trigger: 'blur' }">
          <el-input v-model="currentEvent.description"></el-input>
        </el-form-item>
        <el-form-item label="地点" prop="location" :rules="{ required: true, message: '请输入地点', trigger: 'blur' }">
          <el-input v-model="currentEvent.location"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time" :rules="{ required: true, message: '请选择开始时间', trigger: 'change' }">
          <el-date-picker
            v-model="currentEvent.start_time"
            type="datetime"
            placeholder="选择日期和时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="currentEvent.type" placeholder="请选择类型">
            <el-option label="活动" value="activity"></el-option>
            <el-option label="住宿" value="accommodation"></el-option>
            <el-option label="交通" value="transport"></el-option>
            <el-option label="餐饮" value="dining"></el-option>
          </el-select>
        </el-form-item>

        <el-divider content-position="left">预期消费</el-divider>
        
        <div v-for="(expense, index) in currentEvent.expenses" :key="index" class="flex items-center space-x-2 mb-2">
          <el-input v-model="expense.category" placeholder="费用类别 (如门票)" class="flex-1"></el-input>
          <el-input-number v-model="expense.amount" :min="0" placeholder="金额" class="w-32"></el-input-number>
          <el-button :icon="Delete" type="danger" circle plain @click="removeExpense(index)"></el-button>
        </div>
        
        <el-button :icon="Plus" @click="addExpense" class="w-full">添加消费项</el-button>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEvent">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification } from 'element-plus';
import { 
  MapLocation, Right, Location, Ship, ForkSpoon, ShoppingCart, House, Finished, Back, Edit, Delete, Plus
} from '@element-plus/icons-vue';
import 'element-plus/es/components/message/style/css'

const route = useRoute();
const router = useRouter();

const user = ref(null);
const trip = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const mapLoadingText = ref('正在加载地图...');
let map = null; // 地图实例

// --- 对话框和表单相关 ---
const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentEvent = ref({});
const eventForm = ref(null);
const isEditing = ref(false);
const originalLocation = ref(''); // 用于跟踪编辑前的地址
const currentEditingEventId = ref(null); // 显式跟踪正在编辑的事件ID

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
    // 使用 nextTick 确保 DOM 已经更新
    nextTick(() => {
      initMap(); // 直接初始化地图
    });
  } else {
    ElMessage.error('找不到预览数据，请返回重新生成。');
    router.push({ name: 'Plan' });
    isLoading.value = false;
  }
};

const fetchTripDetails = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/trips/${tripId.value}`);
    if (!response.ok) {
        throw new Error('行程加载失败');
    }
    const data = await response.json();
    trip.value = data;
    // 使用 nextTick 确保 DOM 已经更新
    nextTick(() => {
      initMap(); // 直接初始化地图
    });
  } catch (error) {
    console.error('Failed to fetch trip details:', error);
    ElMessage.error(error.message);
    trip.value = null;
  } finally {
    isLoading.value = false;
  }
};

const initMap = () => {
  const events = trip.value?.events || trip.value?.trip_events;
  if (!events || events.length < 2) {
    mapLoadingText.value = '地点不足，无法规划路线';
    return;
  }

  const locationsWithCoords = events
    .map(event => ({ lat: event.latitude, lng: event.longitude, description: event.description }))
    .filter(loc => loc.lat && loc.lng);

  if (locationsWithCoords.length < 2) {
    mapLoadingText.value = '有效的地理位置不足，无法规划路线';
    return;
  }

  mapLoadingText.value = null; // Ready to draw, hide loading text

  if (!window.BMapGL) {
    mapLoadingText.value = '百度地图脚本加载失败';
    console.error('BMapGL not found on window object.');
    return;
  }

  map = new BMapGL.Map('map-container');
  const startPoint = new BMapGL.Point(locationsWithCoords[0].lng, locationsWithCoords[0].lat);
  map.centerAndZoom(startPoint, 12);
  map.enableScrollWheelZoom(true);

  const endPoint = new BMapGL.Point(locationsWithCoords[locationsWithCoords.length - 1].lng, locationsWithCoords[locationsWithCoords.length - 1].lat);
  
  let waypoints = locationsWithCoords
    .slice(1, -1)
    .map(loc => new BMapGL.Point(loc.lng, loc.lat));

  // 百度地图API限制：最多支持10个途经点
  if (waypoints.length > 10) {
    ElMessage.warning('途经点超过10个，地图上仅显示部分路线。');
    waypoints = waypoints.slice(0, 10);
  }

  const driving = new BMapGL.DrivingRoute(map, {
    renderOptions: { 
      map: map, 
      autoViewport: true 
    },
    onSearchComplete: function(results) {
      // BMAP_STATUS_SUCCESS 的值为 0
      if (driving.getStatus() !== 0) {
        console.error("路线规划失败: ", driving.getStatus());
        mapLoadingText.value = `路线规划失败 (代码: ${driving.getStatus()})`;
      }
    }
  });


  // driving.search(startPoint, endPoint, { waypoints: waypoints });
};

// --- 事件操作 ---

const openAddDialog = (date) => {
  isEditing.value = false;
  dialogTitle.value = '添加新事件';
  currentEvent.value = {
    id: Date.now(), // 临时ID
    description: '',
    location: '',
    start_time: `${date}T12:00:00`, // 默认中午12点
    type: 'activity',
    expenses: []
  };
  dialogVisible.value = true;
};

const openEditDialog = (event) => {
  console.log('Editing event:', event);
  isEditing.value = true;
  dialogTitle.value = '编辑事件';
  currentEditingEventId.value = event.id; // 保存正在编辑的事件ID
  // 深拷贝事件对象，确保 expenses 也是新的数组
  currentEvent.value = JSON.parse(JSON.stringify(event));
  originalLocation.value = event.location; // 保存原始地址
  // 确保 expenses 数组存在
  if (!currentEvent.value.expenses) {
    currentEvent.value.expenses = [];
  }
  dialogVisible.value = true;
};

const addExpense = () => {
  if (!currentEvent.value.expenses) {
    currentEvent.value.expenses = [];
  }
  currentEvent.value.expenses.push({ category: '', amount: 0 });
};

const removeExpense = (index) => {
  currentEvent.value.expenses.splice(index, 1);
};

const resetForm = () => {
  currentEvent.value = {};
  if (eventForm.value) {
    eventForm.value.resetFields();
  }
};

const handleSaveEvent = async () => {
  const isValid = await eventForm.value.validate();
  if (!isValid) {
    ElMessage.error('请填写所有必填项');
    return;
  }

  try {
    let lat = currentEvent.value.latitude;
    let lng = currentEvent.value.longitude;

    const locationChanged = currentEvent.value.location !== originalLocation.value;

    if (!isEditing.value || locationChanged) {
      const response = await fetch('http://localhost:3001/api/map/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: currentEvent.value.location }),
      });

      if (!response.ok) {
        // Explicitly show error and stop if geocoding fails.
        console.error('Geocoding failed:', response.statusText);
        ElMessage.error('无法解析该地址，请输入更详细的地址信息。');
        return; 
      }
      
      const coords = await response.json();
      lat = coords.lat;
      lng = coords.lng;
    }

    const eventToSave = {
      ...currentEvent.value,
      latitude: lat,
      longitude: lng,
    };

    const events = trip.value.events || trip.value.trip_events;

    if (isEditing.value) {
      // 使用保存的ID来查找事件
      const index = events.findIndex(e => e.id === currentEditingEventId.value);
      if (index !== -1) {
        // 更新事件时保留原始ID
        events[index] = { ...eventToSave, id: currentEditingEventId.value };
      }
    } else {
      events.push(eventToSave);
    }

    dialogVisible.value = false;
    ElMessage.success(`事件已${isEditing.value ? '更新' : '添加'}`);
    sortAndRefresh();

  } catch (error) {
    console.error('Error saving event:', error);
    ElMessage.error(error.message || '保存事件时发生网络错误。');
  }
};

const handleDeleteEvent = (eventId) => {
    ElMessageBox.confirm(
        '确定要删除这个事件吗？此操作无法撤销。',
        '警告',
        {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        const events = trip.value.events || trip.value.trip_events;
        const eventIndex = events.findIndex(e => e.id === eventId);
        
        if (eventIndex > -1) {
            events.splice(eventIndex, 1);
            ElMessage.success('事件已删除');
            
            // 重新排序并更新地图
            sortAndRefresh();
        }
    }).catch(() => {
        // 用户取消删除
    });
};

const sortAndRefresh = () => {
    const events = trip.value.events || trip.value.trip_events;
    // 按开始时间重新排序所有事件
    events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
    // 强制 Vue 更新视图
    trip.value.events = [...events];

    // 延迟更新地图以确保 DOM 更新
    nextTick(() => {
        initMap();
    });
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

    const response = await fetch('http://localhost:3001/api/trips', {
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

  console.log('Save trip function executed, current trip plan :', trip.value);
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
