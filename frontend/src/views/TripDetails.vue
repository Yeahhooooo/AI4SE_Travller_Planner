<template>
  <div class="trip-details-container">
    <!-- 现代化头部 -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-left" @click="goHome">
          <el-icon :size="24" class="header-logo"><MapLocation /></el-icon>
          <span class="app-title">AI 旅行规划助手</span>
        </div>
        
        <div class="header-actions">
          <el-tooltip content="有新想法？让AI帮你进一步完善行程" placement="bottom">
            <button 
              class="ai-enhance-btn"
              @click="drawerVisible = true"
            >
              <el-icon :size="18"><ChatDotRound /></el-icon>
              <span>AI智能完善</span>
            </button>
          </el-tooltip>
          
          <button 
            v-if="isPreview"
            class="save-btn primary"
            @click="saveTrip"
            :disabled="isSaving"
          >
            <div v-if="isSaving" class="loading-spinner"></div>
            <el-icon v-else :size="18"><Finished /></el-icon>
            <span>{{ isSaving ? '保存中...' : '保存到我的计划' }}</span>
          </button>
          
          <button 
            v-if="!isPreview"
            class="save-btn"
            :class="'warning'"
            @click="updateTrip"
            :disabled="isSaving"
          >
            <div v-if="isSaving" class="loading-spinner"></div>
            <el-icon v-else :size="18"><Finished /></el-icon>
            <span>{{ isSaving ? '保存中...' : '保存更改' }}</span>
          </button>
          
          <button class="back-btn" @click="goBack">
            <el-icon :size="18"><Back /></el-icon>
            <span>返回</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主要布局容器 -->
    <div class="main-layout">
      <!-- 左侧地图区域 -->
      <div class="map-section">
        <div class="map-card">
          <div class="map-header">
            <el-icon :size="20" class="map-icon"><MapLocation /></el-icon>
            <span class="map-title">路线地图</span>
          </div>
          <div id="map-container" class="map-container">
            <div v-if="mapLoadingText" class="map-loading">
              <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">{{ mapLoadingText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-section" v-loading="isLoading" element-loading-text="正在加载行程详情...">
        <div v-if="!isLoading && trip" class="trip-content">
          <!-- 行程头部信息 -->
          <div class="trip-header-card">
            <div class="trip-header-icon">
              <el-icon :size="24"><Finished /></el-icon>
            </div>
            <div class="trip-header-content">
              <h1 class="trip-title">{{ trip.name }}</h1>
              <div class="trip-meta">
                <div class="trip-dates">
                  <span>{{ formatDate(trip.start_date) }}</span>
                  <el-icon class="date-separator"><Right /></el-icon>
                  <span>{{ formatDate(trip.end_date) }}</span>
                </div>
                <div class="trip-budget-section">
                  <!-- 预算显示/编辑 -->
                  <div class="budget-display" v-if="!isEditingBudget">
                    <div class="budget-item">
                      <span class="budget-label">预算:</span>
                      <strong class="budget-amount">¥{{ trip.budget }}</strong>
                      <button type="button" class="edit-budget-btn" @click="startEditBudget" title="编辑预算">
                        <el-icon :size="14"><Edit /></el-icon>
                      </button>
                    </div>
                    <div class="expenses-summary">
                      <span class="expenses-label">已花费:</span>
                      <strong class="expenses-amount" :class="{ 'over-budget': isOverBudget }">
                        ¥{{ totalExpenses }}
                      </strong>
                    </div>
                    <div v-if="isOverBudget" class="budget-warning">
                      <el-icon :size="14" class="warning-icon"><Warning /></el-icon>
                      <span>超出预算 ¥{{ totalExpenses - Number(trip.budget) }}</span>
                    </div>
                  </div>
                  
                  <!-- 预算编辑模式 -->
                  <div class="budget-edit" v-else>
                    <div class="edit-input-group">
                      <span class="budget-label">预算:</span>
                      <el-input-number 
                        v-model="editBudget" 
                        :min="0" 
                        :precision="0"
                        class="budget-input"
                        size="small"
                      />
                    </div>
                    <div class="edit-actions">
                      <button type="button" class="save-budget-btn" @click="saveBudget">
                        <el-icon :size="12"><Check /></el-icon>
                      </button>
                      <button type="button" class="cancel-budget-btn" @click="cancelEditBudget">
                        <el-icon :size="12"><Close /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间线按天分组 -->
          <div class="timeline-container">
            <div v-for="(day, date) in groupedEvents" :key="date" class="day-section">
              <div class="day-header">
                <div class="day-marker"></div>
                <h3 class="day-title">{{ formatDate(date, true) }}</h3>
              </div>
              
              <div class="events-timeline">
                <div 
                  v-for="event in day" 
                  :key="event.tempId" 
                  class="event-item"
                >
                  <div class="event-time">
                    {{ formatTimestamp(event.start_time) }}
                  </div>
                  <div class="event-connector">
                    <div class="event-dot" :class="getEventType(event.type)">
                      <el-icon :size="16">
                        <component :is="getEventIcon(event.type)" />
                      </el-icon>
                    </div>
                    <div class="event-line"></div>
                  </div>
                  <div class="event-content">
                    <div class="event-card">
                      <div class="event-header">
                        <h4 class="event-title">{{ event.description }}</h4>
                        <div class="event-actions">
                          <button class="action-btn edit" @click="openEditDialog(event)">
                            <el-icon :size="14"><Edit /></el-icon>
                          </button>
                          <button class="action-btn delete" @click="handleDeleteEvent(event.tempId)">
                            <el-icon :size="14"><Delete /></el-icon>
                          </button>
                        </div>
                      </div>
                      
                      <div class="event-location">
                        <el-icon class="location-icon"><Location /></el-icon>
                        <span>{{ event.location }}</span>
                      </div>
                      
                      <!-- 显示预期费用 -->
                      <div v-if="event.expenses && event.expenses.length > 0" class="event-expenses">
                        <div class="expense-summary">
                          <span class="expense-label">预期消费:</span>
                          <span class="expense-amount">¥{{ calculateTotalExpense(event.expenses) }}</span>
                        </div>
                        <div class="expense-details">
                          <div 
                            v-for="(expense, expIndex) in event.expenses" 
                            :key="expIndex"
                            class="expense-tag"
                            :title="expense.description || ''"
                          >
                            <span class="expense-category">{{ getCategoryLabel(expense.category) }}</span>
                            <span class="expense-value">¥{{ expense.amount }}</span>
                            <span v-if="expense.description" class="expense-desc">
                              ({{ expense.description }})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="add-event-section">
                <button class="add-event-btn" @click="openAddDialog(date)">
                  <el-icon :size="16"><Plus /></el-icon>
                  <span>在 {{ formatDate(date) }} 添加新事件</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!isLoading && !trip" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><Warning /></el-icon>
          </div>
          <h3 class="empty-title">行程不存在或加载失败</h3>
          <p class="empty-subtitle">请检查链接是否正确或稍后重试</p>
        </div>
      </div>
    </div>

    <!-- 事件编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
      class="modern-dialog"
    >
      <div class="dialog-content">
        <el-form :model="currentEvent" ref="eventForm" class="event-form">
          <!-- 描述和地点使用全宽布局 -->
          <div class="form-section">
            <div class="form-item full-width">
              <label class="form-label">活动描述 *</label>
              <textarea 
                v-model="currentEvent.description" 
                class="modern-textarea"
                placeholder="请详细描述您的活动内容，如：参观故宫博物院，了解中国古代文化..."
                rows="1"
                maxlength="200"
                required
              ></textarea>
              <div class="char-counter">{{ (currentEvent.description || '').length }}/200</div>
            </div>
            
            <div class="form-item full-width">
              <label class="form-label">地点 *</label>
              <textarea 
                v-model="currentEvent.location" 
                class="modern-textarea"
                placeholder="请输入详细地址，如：北京市东城区景山前街4号故宫博物院"
                rows="1"
                maxlength="100"
                required
              ></textarea>
              <div class="char-counter">{{ (currentEvent.location || '').length }}/100</div>
            </div>
          </div>

          <!-- 时间和类型使用网格布局 -->
          <div class="form-grid">
            <div class="form-item">
              <label class="form-label">开始时间 *</label>
              <el-date-picker
                v-model="currentEvent.start_time"
                type="datetime"
                placeholder="选择日期和时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                class="modern-date-picker"
              />
            </div>
            
            <div class="form-item">
              <label class="form-label">事件类型</label>
              <el-select v-model="currentEvent.type" placeholder="请选择类型" class="modern-select">
                <el-option label="活动" value="activity"></el-option>
                <el-option label="住宿" value="accommodation"></el-option>
                <el-option label="交通" value="transport"></el-option>
                <el-option label="餐饮" value="dining"></el-option>
              </el-select>
            </div>
          </div>

          <div class="expense-section">
            <div class="section-header">
              <h4 class="section-title">预期消费</h4>
            </div>
            
            <div class="expense-list">
              <div v-for="(expense, index) in currentEvent.expenses" :key="index" class="expense-item">
                <div class="expense-row">
                  <el-select v-model="expense.category" placeholder="选择费用类别" class="expense-category">
                    <el-option label="交通" value="transport"></el-option>
                    <el-option label="餐饮" value="food"></el-option>
                    <el-option label="门票" value="tickets"></el-option>
                    <el-option label="购物" value="shopping"></el-option>
                    <el-option label="住宿" value="lodging"></el-option>
                    <el-option label="娱乐" value="entertainment"></el-option>
                    <el-option label="其他" value="other"></el-option>
                  </el-select>
                  <el-input-number 
                    v-model="expense.amount" 
                    :min="0" 
                    placeholder="金额" 
                    class="expense-amount"
                  />
                  <button type="button" class="delete-expense-btn" @click="removeExpense(index)">
                    <el-icon :size="16"><Delete /></el-icon>
                  </button>
                </div>
                <input 
                  v-model="expense.description" 
                  placeholder="费用描述 (如: 地铁票、门票等)" 
                  class="expense-description"
                />
              </div>
            </div>
            
            <button type="button" class="add-expense-btn" @click="addExpense">
              <el-icon :size="16"><Plus /></el-icon>
              <span>添加消费项</span>
            </button>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="cancel-btn" @click="dialogVisible = false">取消</button>
          <button type="button" class="confirm-btn" @click="handleSaveEvent">保存</button>
        </div>
      </template>
    </el-dialog>

    <!-- AI 对话抽屉 -->
    <el-drawer
      title="AI 旅行助手"
      v-model="drawerVisible"
      width="420px"
      :with-header="false"
      class="ai-drawer"
      @open="loadChatHistory"
    >
      <div class="drawer-content">
        <div class="drawer-header">
          <div class="drawer-title">
            <el-icon :size="22" class="drawer-icon"><ChatDotRound /></el-icon>
            <span class="title-text">AI 旅行助手</span>
          </div>
          <button class="close-drawer-btn" @click="drawerVisible = false">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
        
        <div class="chat-container">
          <div class="chat-list">
            <template v-if="chatHistory.length">
              <div v-for="(chat, index) in chatHistory" :key="index" class="chat-message" :class="chat.role">
                <div class="message-bubble">
                  <div class="message-content" v-html="chat.content"></div>
                </div>
                <div class="message-meta">
                  {{ chat.role === 'user' ? '我' : 'AI助手' }}
                </div>
              </div>
            </template>
            <div v-else class="empty-chat">
              <el-icon :size="48" class="empty-icon"><ChatDotRound /></el-icon>
              <p class="empty-text">暂无对话记录</p>
              <p class="empty-hint">向AI描述您想要的行程调整</p>
            </div>
          </div>
        </div>
        
        <div class="chat-input-area">
          <div class="input-wrapper">
            <textarea
              v-model="newUserPrompt"
              class="chat-input"
              rows="3"
              maxlength="200"
              placeholder="请输入你对当前行程的修改要求..."
              @keyup.enter.ctrl="handleAiRefine"
            ></textarea>
            <div class="input-actions">
              <span class="char-count">{{ newUserPrompt.length }}/200</span>
              <button 
                class="send-btn"
                @click="handleAiRefine" 
                :disabled="isRefining || !newUserPrompt.trim()"
              >
                <div v-if="isRefining" class="loading-spinner"></div>
                <el-icon v-else :size="16"><ChatDotRound /></el-icon>
                <span>{{ isRefining ? '发送中...' : '发送' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { user, profile } from '../store/userStore';
import { 
  MapLocation, Right, Location, Ship, ForkSpoon, ShoppingCart, House, Finished, Back, Edit, Delete, Plus, ChatDotRound, Close, Warning, Check
} from '@element-plus/icons-vue';
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'

const route = useRoute();
const router = useRouter();

const trip = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const mapLoadingText = ref(null); // 初始为null，避免阻挡其他元素
let map = null; // 地图实例

// 预算编辑相关
const isEditingBudget = ref(false);
const editBudget = ref(0);

// --- AI 对话抽屉相关 ---
const drawerVisible = ref(false);
const chatHistory = ref([]);
const newUserPrompt = ref('');
const isRefining = ref(false);
const isModified = ref(false);
let originalTripJSON = ''; // 用于存储原始行程的JSON字符串


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

// 计算所有事件的总花销
const totalExpenses = computed(() => {
  if (!trip.value || !trip.value.events) return 0;
  const events = trip.value.events || trip.value.trip_events || [];
  return events.reduce((total, event) => {
    if (event.expenses && Array.isArray(event.expenses)) {
      const eventTotal = event.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      return total + eventTotal;
    }
    return total;
  }, 0);
});

// 检查是否超预算
const isOverBudget = computed(() => {
  return trip.value && totalExpenses.value > Number(trip.value.budget || 0);
});

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

watch(trip, (newTrip) => {
      console.log('originalTripJSON:', originalTripJSON);
  console.log('newTripJSON:', JSON.stringify(newTrip));
  if (!isPreview && originalTripJSON !== '') {

    const newTripJSON = JSON.stringify(newTrip);
    isModified.value = newTripJSON !== originalTripJSON;
    console.log('isModified:', isModified.value);
  }
}, { deep: true });

onMounted(async () => {
  // onMounted 不再需要手动获取用户，由 App.vue 的监听器自动处理
  
  // 加载历史对话
  const storedHistory = sessionStorage.getItem('chatHistory');
  if (storedHistory) {
    chatHistory.value = JSON.parse(storedHistory);
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
    // 确保预览数据也有 tempId
    if (trip.value.events && Array.isArray(trip.value.events)) {
        trip.value.events.forEach((event, index) => {
            if (!event.tempId) {
                event.tempId = `temp_${Date.now()}_${index}`;
            }
        });
    }
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
    
    // 权限检查：确保当前用户是行程的所有者
    if (user.value && data.user_id !== user.value.id) {
        ElMessage.error('您没有权限查看此行程。');
        router.push({ name: 'Dashboard' });
        return;
    }

    trip.value = data;
    // 为从数据库加载的事件添加 tempId，使用数据库的 id
    if (trip.value.events && Array.isArray(trip.value.events)) {
        trip.value.events.forEach(event => {
            event.tempId = event.id;
        });
    }
    
    // 在处理完数据结构后再存储原始状态，确保一致性
    originalTripJSON = JSON.stringify(trip.value);
    isModified.value = false; // 重置修改状态
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
  mapLoadingText.value = '正在加载地图...'; // 开始加载时显示
  
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
    // waypoints = waypoints.slice(0, 10);
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
    tempId: `temp_${Date.now()}`, // 添加临时ID
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
  currentEditingEventId.value = event.tempId; // 保存正在编辑的事件的 tempId
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
  currentEvent.value.expenses.push({ category: 'other', amount: 0, description: '' });
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
      // 检查地图 API Key 是否存在
      if (!profile.value?.map_apikey) {
        ElMessage.error('未找到地图 API Key，请在个人资料页面设置。');
        return;
      }

      const response = await fetch('http://localhost:3001/api/map/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: currentEvent.value.location,
          apiKey: profile.value.map_apikey // 传递地图 API Key
        }),
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
      const index = events.findIndex(e => e.tempId === currentEditingEventId.value);
      if (index !== -1) {
        // 更新事件时保留原始ID
        events[index] = { ...eventToSave, tempId: currentEditingEventId.value };
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

const handleAiRefine = async () => {
  if (!newUserPrompt.value.trim()) {
    ElMessage.warning('请输入您的要求。');
    return;
  }
  // 检查 API Key
  if (!profile.value?.llm_apikey) {
    ElMessage.error('未找到 LLM API Key，请在个人资料页面设置。');
    return;
  }
  isRefining.value = true;

  // 构造发送给后端的请求体
  const requestBody = {
    prompt: newUserPrompt.value,
    currentTrip: trip.value,
    chatHistory: chatHistory.value,
    apiKey: profile.value.llm_apikey, // 传递 API Key
  };

  try {
    const response = await fetch('http://localhost:3001/api/trips/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI 优化行程失败');
    }

    const refinedTripData = await response.json();

    // 更新前端的 trip 数据
    trip.value = refinedTripData;

    // 为AI优化后的新行程事件添加 tempId
    if (trip.value.events && Array.isArray(trip.value.events)) {
        trip.value.events.forEach((event, index) => {
            // 如果事件已经有 id（来自数据库），则用它作为 tempId，否则创建新的
            event.tempId = event.id || `temp_${Date.now()}_${index}`;
        });
    }

    // 更新对话历史
    chatHistory.value.push({ role: 'user', content: newUserPrompt.value });
    chatHistory.value.push({ role: 'assistant', content: '已根据您的要求更新行程计划。' }); // 可以用更详细的AI回复
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory.value));

    // 清空输入框
    newUserPrompt.value = '';

    // 更新行程缓存
    sessionStorage.setItem('tripPreview', JSON.stringify(refinedTripData));


    ElNotification({
      title: 'AI 优化成功',
      message: '行程已根据您的新要求更新。',
      type: 'success',
    });

    // 刷新地图和视图
    sortAndRefresh();

  } catch (error) {
    console.error('Error refining trip with AI:', error);
    ElMessage.error(`AI 优化失败: ${error.message}`);
  } finally {
    isRefining.value = false;
  }
};

const handleDeleteEvent = (tempId) => {
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
        const eventIndex = events.findIndex(e => e.tempId === tempId);
        
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

const updateTrip = async () => {
  isSaving.value = true;
  try {
    const response = await fetch(`http://localhost:3001/api/trips/${tripId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tripData: trip.value }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update the trip.');
    }

    ElNotification({
      title: '更新成功',
      message: '您的行程更改已成功保存。',
      type: 'success',
    });

    // 重新获取数据以同步状态并重置 isModified
    await fetchTripDetails();

  } catch (error) {
    console.error('Error updating trip:', error);
    ElMessage.error(`更新失败: ${error.message}`);
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

// 费用类别中英文映射
const getCategoryLabel = (category) => {
  const categoryMap = {
    'transport': '交通',
    'food': '餐饮', 
    'tickets': '门票',
    'shopping': '购物',
    'lodging': '住宿',
    'entertainment': '娱乐',
    'other': '其他'
  };
  return categoryMap[category] || category;
};

// 预算编辑相关方法
const startEditBudget = () => {
  editBudget.value = Number(trip.value.budget || 0);
  isEditingBudget.value = true;
};

const cancelEditBudget = () => {
  isEditingBudget.value = false;
  editBudget.value = 0;
};

const saveBudget = () => {
  if (editBudget.value < 0) {
    ElMessage.error('预算不能为负数');
    return;
  }
  trip.value.budget = editBudget.value;
  isEditingBudget.value = false;
  ElMessage.success('预算已更新');
};

// 新增方法：加载对话历史
const loadChatHistory = () => {
  const storedHistory = sessionStorage.getItem('chatHistory');
  if (storedHistory) {
    chatHistory.value = JSON.parse(storedHistory);
  } else {
    chatHistory.value = [];
  }
};
</script>

<style scoped>
/* 基础容器样式 */
.trip-details-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.trip-details-container::before {
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
  max-width: 1400px;
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

.header-logo {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 12px;
  transition: all 0.3s ease;
}

.header-left:hover .header-logo {
  color: white;
  transform: translateX(-2px);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-enhance-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(90deg, #2563eb 60%, #38b2ac 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.ai-enhance-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn.warning {
  background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
}

.save-btn.secondary {
  background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(113, 128, 150, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 主布局容器 */
.main-layout {
  display: flex;
  height: calc(100vh - 70px);
  position: relative;
  z-index: 10;
}

/* 地图区域样式 */
.map-section {
  width: 500px;
  min-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.map-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.map-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.map-icon {
  color: #667eea;
  margin-right: 12px;
  padding: 8px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.map-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.map-container {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #f7fafc;
  position: relative;
  pointer-events: auto;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 250, 252, 0.9);
  z-index: 10;
  pointer-events: auto;
}

.loading-content {
  text-align: center;
}

.loading-text {
  margin-top: 12px;
  color: #718096;
  font-size: 14px;
}

/* 内容区域样式 */
.content-section {
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  padding: 24px;
}

.trip-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* 行程头部卡片 */
.trip-header-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.trip-header-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 178, 172, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #48bb78;
  margin-right: 24px;
}

.trip-header-content {
  flex: 1;
}

.trip-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 16px;
  color: #718096;
}

.trip-dates {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: #a0aec0;
  font-size: 14px;
}

.trip-budget {
  font-weight: 600;
}

/* 预算编辑区域样式 */
.trip-budget-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.budget-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.budget-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-label {
  font-size: 16px;
  color: #718096;
  font-weight: 500;
}

.budget-amount {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.edit-budget-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-budget-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.expenses-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.expenses-label {
  color: #718096;
  font-weight: 500;
}

.expenses-amount {
  font-weight: 600;
  color: #38b2ac;
  transition: color 0.3s ease;
}

.expenses-amount.over-budget {
  color: #e53e3e;
}

.budget-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  border-left: 3px solid #e53e3e;
}

.warning-icon {
  color: #e53e3e;
}

.budget-edit {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-input {
  width: 120px;
}

.edit-actions {
  display: flex;
  gap: 4px;
}

.save-budget-btn,
.cancel-budget-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-budget-btn {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.save-budget-btn:hover {
  background: rgba(72, 187, 120, 0.2);
  transform: scale(1.1);
}

.cancel-budget-btn {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.cancel-budget-btn:hover {
  background: rgba(229, 62, 62, 0.2);
  transform: scale(1.1);
}

/* 时间线容器 */
.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.day-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.day-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.day-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  margin-right: 16px;
}

.day-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

/* 事件时间线样式 */
.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.event-item {
  display: grid;
  grid-template-columns: 80px 40px 1fr;
  gap: 16px;
  align-items: flex-start;
}

.event-time {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.event-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.event-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  z-index: 2;
}

.event-dot.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.event-dot.success {
  background: linear-gradient(135deg, #48bb78, #38b2ac);
}

.event-dot.warning {
  background: linear-gradient(135deg, #f6ad55, #ed8936);
}

.event-dot.info {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.event-line {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, rgba(102, 126, 234, 0.3), transparent);
}

.event-content {
  flex: 1;
}

.event-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: all 0.3s ease;
}

.event-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.event-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.event-card:hover .event-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.edit:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.action-btn.delete {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.action-btn.delete:hover {
  background: rgba(229, 62, 62, 0.2);
  transform: scale(1.1);
}

.event-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
}

.location-icon {
  font-size: 14px;
  color: #a0aec0;
}

/* 费用显示样式 */
.event-expenses {
  background: rgba(246, 173, 85, 0.05);
  border: 1px solid rgba(246, 173, 85, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.expense-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.expense-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.expense-amount {
  font-size: 16px;
  font-weight: 700;
  color: #ed8936;
}

.expense-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.expense-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(246, 173, 85, 0.3);
  border-radius: 8px;
  font-size: 12px;
}

.expense-category {
  font-weight: 600;
  color: #667eea;
}

.expense-value {
  color: #ed8936;
  font-weight: 600;
}

.expense-desc {
  color: #718096;
  font-style: italic;
}

/* 添加事件按钮 */
.add-event-section {
  margin-top: 24px;
  text-align: center;
}

.add-event-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-event-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 20px auto;
  max-width: 500px;
}

.empty-icon {
  margin-bottom: 24px;
  color: #f6ad55;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 16px;
  color: #718096;
}

/* 对话框样式 */
.modern-dialog .el-dialog {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.dialog-content {
  padding: 20px 0;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item.full-width {
  width: 100%;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.modern-input {
  padding: 12px 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-textarea {
  padding: 12px 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.modern-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-textarea::placeholder {
  color: #a0aec0;
  line-height: 1.5;
}

.char-counter {
  align-self: flex-end;
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
  padding: 0 4px;
}

.modern-date-picker,
.modern-select {
  border-radius: 12px;
}

.expense-section {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.expense-item {
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.5);
}

.expense-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.expense-category {
  flex: 1;
}

.expense-amount {
  width: 120px;
}

.delete-expense-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-expense-btn:hover {
  background: rgba(229, 62, 62, 0.2);
  transform: scale(1.1);
}

.expense-description {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
}

.add-expense-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-expense-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0;
}

.cancel-btn {
  padding: 10px 20px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* AI 抽屉样式 */
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7fafc;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-icon {
  color: #667eea;
}

.title-text {
  font-weight: 600;
  font-size: 18px;
  color: #2d3748;
}

.close-drawer-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(226, 232, 240, 0.5);
  color: #718096;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-drawer-btn:hover {
  background: rgba(226, 232, 240, 0.8);
  color: #2d3748;
}

.chat-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-message {
  display: flex;
  flex-direction: column;
}

.chat-message.user {
  align-items: flex-end;
}

.chat-message.assistant {
  align-items: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.chat-message.assistant .message-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.message-meta {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
  padding: 0 16px;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  color: #a0aec0;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #a0aec0;
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #a0aec0;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .map-section {
    width: 400px;
    min-width: 400px;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }
  
  .map-section {
    width: 100%;
    min-width: auto;
    height: 300px;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .ai-enhance-btn,
  .save-btn,
  .back-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .trip-header-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .trip-header-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .trip-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .event-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .event-connector {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 现有样式保持不变 */
.ai-drawer .el-drawer__body {
  padding: 0 !important;
  background: #f7fafc;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.ai-drawer .chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  background: #f7fafc;
}
.ai-drawer .chat-bubble {
  max-width: 70%;
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}
.ai-drawer .chat-bubble.user {
  background: #2563eb;
  color: #fff;
  border-radius: 18px 4px 18px 18px;
  margin-left: auto;
  padding: 10px 16px;
}
.ai-drawer .chat-bubble.ai {
  background: #fff;
  color: #222;
  border-radius: 4px 18px 18px 18px;
  margin-right: auto;
  border: 1px solid #e5e7eb;
  padding: 10px 16px;
}
.ai-drawer .chat-meta {
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 4px;
  text-align: right;
}
.ai-drawer .chat-meta.ai {
  text-align: left;
}
.ai-drawer .input-area {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
</style>
