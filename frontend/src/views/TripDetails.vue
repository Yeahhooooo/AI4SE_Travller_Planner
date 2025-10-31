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
                <!-- 日期显示/编辑 -->
                <div class="trip-dates-section">
                  <div class="dates-display" v-if="!isEditingDates">
                    <div class="trip-dates">
                      <span>{{ formatDate(trip.start_date) }}</span>
                      <el-icon class="date-separator"><Right /></el-icon>
                      <span>{{ formatDate(trip.end_date) }}</span>
                      <button type="button" class="edit-dates-btn" @click="startEditDates" title="编辑日期">
                        <el-icon :size="14"><Edit /></el-icon>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 日期编辑模式 -->
                  <div class="dates-edit" v-else>
                    <div class="edit-dates-group">
                      <div class="date-input-item">
                        <span class="date-label">开始:</span>
                        <el-date-picker
                          v-model="editStartDate"
                          type="date"
                          placeholder="选择开始日期"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          size="small"
                          class="date-picker-small"
                        />
                      </div>
                      <div class="date-input-item">
                        <span class="date-label">结束:</span>
                        <el-date-picker
                          v-model="editEndDate"
                          type="date"
                          placeholder="选择结束日期"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          size="small"
                          class="date-picker-small"
                        />
                      </div>
                    </div>
                    <div class="edit-dates-actions">
                      <button type="button" class="save-dates-btn" @click="saveDates">
                        <el-icon :size="12"><Check /></el-icon>
                      </button>
                      <button type="button" class="cancel-dates-btn" @click="cancelEditDates">
                        <el-icon :size="12"><Close /></el-icon>
                      </button>
                    </div>
                  </div>
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
                  @click="focusOnEvent(event)"
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
                        <div class="event-title-wrapper">
                          <h4 class="event-title">{{ event.description }}</h4>
                          <el-tooltip content="点击查看地图位置" placement="top" v-if="event.latitude && event.longitude">
                            <el-icon class="map-focus-icon" :size="16">
                              <LocationInformation />
                            </el-icon>
                          </el-tooltip>
                        </div>
                        <div class="event-actions">
                          <button class="action-btn edit" @click.stop="openEditDialog(event)">
                            <el-icon :size="14"><Edit /></el-icon>
                          </button>
                          <button class="action-btn delete" @click.stop="handleDeleteEvent(event.tempId)">
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
              <button 
                :class="['voice-button', { 'recording': isRecording }]"
                @click="handleVoiceInput"
                :disabled="!isVoiceServiceReady"
                :title="isRecording ? '正在录音...' : '语音输入'"
              >
                <el-icon :size="16"><Microphone /></el-icon>
                <div v-if="isRecording" class="recording-indicator"></div>
              </button>
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
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { user, profile } from '../store/userStore';
import { 
  MapLocation, Right, Location, Ship, ForkSpoon, ShoppingCart, House, Finished, Back, Edit, Delete, Plus, ChatDotRound, Close, Warning, Check, LocationInformation, Microphone
} from '@element-plus/icons-vue';
import { XfVoiceDictation } from '@muguilin/xf-voice-dictation';
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

// 日期编辑相关
const isEditingDates = ref(false);
const editStartDate = ref('');
const editEndDate = ref('');

// --- AI 对话抽屉相关 ---
const drawerVisible = ref(false);
const chatHistory = ref([]);
const newUserPrompt = ref('');
const isRefining = ref(false);
const isModified = ref(false);
let originalTripJSON = ''; // 用于存储原始行程的JSON字符串

// --- 语音输入相关 ---
const isRecording = ref(false);
let xfVoice = null;
const isVoiceServiceReady = ref(false);


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
  if (!trip.value) return {};
  
  // 预览数据和持久化数据的字段名可能不同，做兼容
  const events = trip.value.events || trip.value.trip_events || [];
  
  // 生成行程日期范围内的所有日期
  const grouped = {};
  if (trip.value.start_date && trip.value.end_date) {
    const startDate = new Date(trip.value.start_date);
    const endDate = new Date(trip.value.end_date);
    
    // 创建行程范围内每一天的条目
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]; // 获取 YYYY-MM-DD
      grouped[dateStr] = [];
    }
  }
  
  // 将事件分配到对应日期
  events.forEach(event => {
    const date = event.start_time.split('T')[0]; // 获取 YYYY-MM-DD
    if (grouped[date]) {
      grouped[date].push(event);
    }
  });
  
  // 对每个日期内的事件按时间排序
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  });

  return grouped;
});

watch(trip, (newTrip) => {
  if (!isPreview && originalTripJSON !== '') {
    const newTripJSON = JSON.stringify(newTrip);
    isModified.value = newTripJSON !== originalTripJSON;
  }
}, { deep: true });

onMounted(async () => {
  // onMounted 不再需要手动获取用户，由 App.vue 的监听器自动处理
  
  // 加载历史对话
  const storedHistory = sessionStorage.getItem('chatHistory');
  if (storedHistory) {
    chatHistory.value = JSON.parse(storedHistory);
  }

  // 初始化语音服务
  initXfVoice();

  if (isPreview.value) {
    loadPreviewData();
  } else {
    await fetchTripDetails();
  }
});

onUnmounted(() => {
  // 清理语音服务
  if (xfVoice && typeof xfVoice.destroy === 'function') {
    try {
      xfVoice.destroy();
    } catch (error) {
      console.error('Error destroying XF Voice Service:', error);
    }
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
    // 确保预览数据也有 tempId 并标准化时间格式
    if (trip.value.events && Array.isArray(trip.value.events)) {
        trip.value.events.forEach((event, index) => {
            if (!event.tempId) {
                event.tempId = `temp_${Date.now()}_${index}`;
            }
            // 标准化时间格式
            if (event.start_time) {
                event.start_time = normalizeDateTime(event.start_time);
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
  mapLoadingText.value = '正在加载地图...'; 
  
  const events = trip.value?.events || trip.value?.trip_events;
  if (!events || events.length === 0) {
    mapLoadingText.value = '暂无地点信息';
    return;
  }

  const eventsWithCoords = events
    .filter(event => event.latitude && event.longitude)
    .map(event => ({
      ...event,
      lat: event.latitude,
      lng: event.longitude,
      date: event.start_time.split('T')[0] // 获取日期用于分组
    }));

  if (eventsWithCoords.length === 0) {
    mapLoadingText.value = '暂无有效的地理位置信息';
    return;
  }

  mapLoadingText.value = null;

  if (!window.BMapGL) {
    mapLoadingText.value = '百度地图脚本加载失败';
    console.error('BMapGL not found on window object.');
    return;
  }

  map = new BMapGL.Map('map-container');
  
  // 先设置一个初始中心点，避免显示世界地图
  const firstEvent = eventsWithCoords[0];
  const initialPoint = new BMapGL.Point(firstEvent.lng, firstEvent.lat);
  map.centerAndZoom(initialPoint, 12);
  
  // 按日期分组事件
  const eventsByDate = {};
  eventsWithCoords.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  // 为每天的路线定义不同颜色
  const dayColors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#45B7D1', // 蓝色
    '#96CEB4', // 绿色
    '#FFEAA7', // 黄色
    '#DDA0DD', // 紫色
    '#FFA07A', // 橙色
    '#98D8C8', // 薄荷绿
    '#F7DC6F', // 金黄色
    '#BB8FCE'  // 淡紫色
  ];

  const allPoints = [];
  let colorIndex = 0;
  let routePlanningPromises = []; // 存储路线规划的Promise

  // 为每一天创建路线和标记
  Object.keys(eventsByDate).sort().forEach((date, dayIndex) => {
    const dayEvents = eventsByDate[date];
    const dayColor = dayColors[colorIndex % dayColors.length];
    colorIndex++;

    // 对当天事件按时间排序
    dayEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // 为每个事件添加标记
    dayEvents.forEach((event, eventIndex) => {
      const point = new BMapGL.Point(event.lng, event.lat);
      allPoints.push(point);

      // 创建自定义图标标记，增加天数标识
      const icon = new BMapGL.Icon(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <!-- 主标记 -->
            <path d="M20 0C8.954 0 0 8.954 0 20c0 20 20 30 20 30s20-10 20-30C40 8.954 31.046 0 20 0z" 
                  fill="${dayColor}" filter="url(#shadow)"/>
            <circle cx="20" cy="20" r="12" fill="white"/>
            
            <!-- 天数标识 -->
            <rect x="3" y="3" width="34" height="12" rx="6" fill="rgba(0,0,0,0.8)"/>
            <text x="20" y="12" text-anchor="middle" fill="white" font-size="8" font-weight="bold">第${dayIndex + 1}天</text>
            
            <!-- 序号 -->
            <text x="20" y="27" text-anchor="middle" fill="${dayColor}" font-size="12" font-weight="bold">${eventIndex + 1}</text>
          </svg>
        `)}`,
        new BMapGL.Size(40, 50),
        { anchor: new BMapGL.Size(20, 50) }
      );

      const marker = new BMapGL.Marker(point, { icon });
      map.addOverlay(marker);

      // 添加地点名称标签


      // 添加信息窗口
      const infoWindow = new BMapGL.InfoWindow(`
        <div style="width: 280px; padding: 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${dayColor}; margin-right: 10px;"></div>
            <h4 style="margin: 0; color: ${dayColor}; font-size: 16px; font-weight: 600;">
              第${dayIndex + 1}天 · 第${eventIndex + 1}个地点
            </h4>
          </div>
          
          <div style="margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2c3e50; font-weight: 700;">
              📍 ${event.description || '未知地点'}
            </h3>
            ${event.location ? `<p style="margin: 0 0 8px 0; color: #7f8c8d; font-size: 13px;">📌 ${event.location}</p>` : ''}
          </div>
          
          <div style="background: ${dayColor}15; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <p style="margin: 0; color: #34495e; font-size: 14px; font-weight: 500;">
              🕒 ${new Date(event.start_time).toLocaleString('zh-CN', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'short'
              })}
            </p>
          </div>
          
          ${event.notes ? `
            <div style="border-left: 3px solid ${dayColor}; padding-left: 10px; margin-top: 10px;">
              <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.4;">
                💭 ${event.notes}
              </p>
            </div>
          ` : ''}
        </div>
      `, {
        width: 320,
        height: 'auto',
        maxHeight: 200
      });

      marker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, point);
      });
    });

    // 如果当天有多个地点，使用路线规划API获取实际道路路线
    if (dayEvents.length > 1) {
      const routePromise = new Promise((resolve) => {
        const dayPoints = dayEvents.map(event => new BMapGL.Point(event.lng, event.lat));
        
        // 创建驾车路线规划实例，不显示默认的路线（我们要自定义样式）
        const driving = new BMapGL.DrivingRoute(map, {
          renderOptions: null, // 不使用默认渲染
          onSearchComplete: function(results) {
            if (driving.getStatus() === 0) { // 成功
              const result = results.getPlan(0); // 获取第一个方案
              if (result) {
                // 获取路线的所有路径点
                const routes = [];
                for (let i = 0; i < result.getNumRoutes(); i++) {
                  const route = result.getRoute(i);
                  routes.push(...route.getPath());
                }
                
                if (routes.length > 0) {
                  // 创建自定义样式的路线
                  const polyline = new BMapGL.Polyline(routes, {
                    strokeColor: dayColor,
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid'
                  });
                  
                  map.addOverlay(polyline);

                  // 添加方向箭头
                  const arrowSymbol = new BMapGL.Symbol(BMapGL.Symbol_SHAPE_FORWARD_CLOSED_ARROW, {
                    scale: 0.8,
                    fillColor: dayColor,
                    fillOpacity: 0.8,
                    strokeWeight: 1,
                    strokeColor: dayColor
                  });

                  const iconSequence = {
                    icon: arrowSymbol,
                    offset: '15%',
                    repeat: '25%',
                    fixedRotation: true
                  };

                  polyline.setOptions({ icons: [iconSequence] });
                }
              }
            } else {
              // 如果路线规划失败，回退到直线连接
              console.warn(`第${dayIndex + 1}天的路线规划失败，使用直线连接`);
              const polyline = new BMapGL.Polyline(dayPoints, {
                strokeColor: dayColor,
                strokeWeight: 3,
                strokeOpacity: 0.6,
                strokeStyle: 'dashed' // 使用虚线表示直线连接
              });
              map.addOverlay(polyline);
            }
            resolve();
          }
        });

        // 进行路线搜索
        if (dayPoints.length === 2) {
          // 两个点之间的直接路线
          driving.search(dayPoints[0], dayPoints[1]);
        } else {
          // 多个点的路线，使用第一个点作为起点，最后一个点作为终点，中间的作为途经点
          const startPoint = dayPoints[0];
          const endPoint = dayPoints[dayPoints.length - 1];
          const waypoints = dayPoints.slice(1, -1);
          
          driving.search(startPoint, endPoint, { waypoints: waypoints });
        }
      });
      
      routePlanningPromises.push(routePromise);
    }
  });

  // 等待所有路线规划完成后调整地图视野
  Promise.all(routePlanningPromises).then(() => {
    // 自动调整地图视野以显示所有点
    if (allPoints.length > 0) {
      if (allPoints.length === 1) {
        map.centerAndZoom(allPoints[0], 16);
      } else {
        // 计算所有点的边界
        let minLng = allPoints[0].lng, maxLng = allPoints[0].lng;
        let minLat = allPoints[0].lat, maxLat = allPoints[0].lat;
        
        allPoints.forEach(point => {
          minLng = Math.min(minLng, point.lng);
          maxLng = Math.max(maxLng, point.lng);
          minLat = Math.min(minLat, point.lat);
          maxLat = Math.max(maxLat, point.lat);
        });
        
        const sw = new BMapGL.Point(minLng, minLat);
        const ne = new BMapGL.Point(maxLng, maxLat);
        const bounds = new BMapGL.Bounds(sw, ne);
        
        // 设置视野，包含所有点并添加合适的边距
        map.setViewport(bounds, {
          enableAnimation: true,
          margins: [60, 60, 60, 60],
          zoomFactor: -1  // 稍微缩小一点以确保所有点都可见
        });
      }
    }
  });

  // 添加地图图例
  const legendControl = new BMapGL.Control();
  legendControl.defaultAnchor = BMapGL.ANCHOR_TOP_LEFT;
  legendControl.defaultOffset = new BMapGL.Size(10, 10);
  
  legendControl.initialize = function(map) {
    const legendDiv = document.createElement('div');
    legendDiv.style.cssText = `
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      font-size: 13px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      max-width: 220px;
      backdrop-filter: blur(10px);
      border-left: 4px solid #3b82f6;
    `;
    
    let legendHTML = `
      <div style="font-weight: bold; margin-bottom: 12px; color: #1e293b; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🗺️</span>
        行程路线图例
      </div>
    `;
    
    Object.keys(eventsByDate).sort().forEach((date, index) => {
      const color = dayColors[index % dayColors.length];
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
      const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];
      
      legendHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 6px; border-radius: 6px; background: rgba(255,255,255,0.5);">
          <div style="width: 20px; height: 4px; background: ${color}; margin-right: 10px; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #374151; font-size: 13px;">第${index + 1}天</div>
            <div style="color: #6b7280; font-size: 11px;">${formattedDate} ${dayName}</div>
          </div>
        </div>
      `;
    });
    
    legendHTML += `
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
        💡 点击标记查看详情
      </div>
    `;
    
    legendDiv.innerHTML = legendHTML;
    return legendDiv;
  };
  
  map.addControl(legendControl);

  map.enableScrollWheelZoom(true);
};

// 地图对焦到指定事件
const focusOnEvent = (event) => {
  if (!map || !event.latitude || !event.longitude) {
    ElMessage.warning('该事件没有地理位置信息');
    return;
  }
  
  const point = new BMapGL.Point(event.longitude, event.latitude);
  
  // 显示加载提示
  ElMessage.info('正在定位到地图位置...');
  
  // 平滑移动到目标点
  map.panTo(point);
  
  // 设置合适的缩放级别
  setTimeout(() => {
    map.setZoom(17);
  }, 300);
  
  // 查找并显示对应标记的信息窗口
  setTimeout(() => {
    const overlays = map.getOverlays();
    let found = false;
    
    overlays.forEach(overlay => {
      if (overlay instanceof BMapGL.Marker) {
        const position = overlay.getPosition();
        // 检查坐标是否匹配（允许小的误差）
        if (Math.abs(position.lng - event.longitude) < 0.0001 && 
            Math.abs(position.lat - event.latitude) < 0.0001) {
          // 模拟点击事件显示信息窗口
          overlay.dispatchEvent(new Event('click'));
          found = true;
        }
      }
    });
    
    if (found) {
      ElMessage.success('已定位到该地点');
    }
  }, 800);
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
  currentEvent.value.expenses.push({ category: 'other', amount: 0, description: '', expense_date: currentEvent.value.start_time });
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

// 时间格式标准化函数
const normalizeDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return dateTimeStr;
  
  // 如果包含时区信息（如 +08:00、+00:00 或 Z），需要转换为统一格式
  if (dateTimeStr.includes('+') || dateTimeStr.includes('Z')) {
    if(dateTimeStr.endsWith('08:00')) {
      // 将 +08:00 转换为 +00:00
      return dateTimeStr.replace('+08:00', '+00:00');
    }
    return dateTimeStr;
  }
  
  // 如果是标准格式（不带时区），添加 +00:00 时区后缀以保持一致性
  if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
    return `${dateTimeStr}+00:00`;
  }
  
  // 其他格式直接返回
  return dateTimeStr;
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
      start_time: normalizeDateTime(currentEvent.value.start_time), // 统一时间格式
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

// 初始化讯飞语音服务
const initXfVoice = () => {
  try {
    // 检查是否有必要的 API 凭证
    if (!profile.value?.xf_appid || !profile.value?.xf_apisecret || !profile.value?.xf_apikey) {
      isVoiceServiceReady.value = false;
      console.warn('讯飞语音 API 凭证未完整设置，语音服务将不可用。');
      return;
    }

    // 初始化语音识别服务
    xfVoice = new XfVoiceDictation({
      APPID: profile.value.xf_appid,
      APISecret: profile.value.xf_apisecret,
      APIKey: profile.value.xf_apikey,

      // 监听录音状态变化回调
      onWillStatusChange: (oldStatus, newStatus) => {
        if (newStatus === 'ing') {
          isRecording.value = true;
        } else if (newStatus === 'end') {
          isRecording.value = false;
        }
      },

      // 监听识别结果的变化回调
      onTextChange: (text) => {
        newUserPrompt.value = text;
      },

      // 监听识别错误回调
      onError: (error) => {
        ElMessage.error(`语音识别失败: ${error.message}`);
        console.error('XF Voice Error:', error);
        isRecording.value = false;
      }
    });

    // 如果代码执行到这里没有抛出异常，说明基础初始化成功
    isVoiceServiceReady.value = true;

  } catch (error) {
    isVoiceServiceReady.value = false;
    console.error('Failed to initialize XF Voice Service:', error);
  }
};

// 处理语音输入
const handleVoiceInput = () => {
    if (!isVoiceServiceReady.value) {
        // 检查是否是因为缺少 API 凭证
        if (!profile.value?.xf_appid || !profile.value?.xf_apisecret || !profile.value?.xf_apikey) {
            ElMessage.error('语音服务需要配置讯飞 API 凭证，请在个人资料页面设置。');
        } else {
            ElMessage.error('语音服务尚未就绪，请稍候或刷新页面。');
        }
        return;
    }
    if (isRecording.value) {
        if (xfVoice && typeof xfVoice.stop === 'function') {
            xfVoice.stop();
        }
    } else {
        if (xfVoice && typeof xfVoice.start === 'function') {
            xfVoice.start();
        }
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

    // 为AI优化后的新行程事件添加 tempId 并标准化时间格式
    if (trip.value.events && Array.isArray(trip.value.events)) {
        trip.value.events.forEach((event, index) => {
            // 如果事件已经有 id（来自数据库），则用它作为 tempId，否则创建新的
            event.tempId = event.id || `temp_${Date.now()}_${index}`;
            // 标准化时间格式，确保存储一致性
            if (event.start_time) {
                event.start_time = normalizeDateTime(event.start_time);
            }
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
        start_date: normalizeDateTime(trip.value.start_date),
        end_date: normalizeDateTime(trip.value.end_date),
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

const formatTimestamp = (ts) => {
  if (!ts) return '';
  // 直接从ISO字符串中提取时间部分，避免时区转换
  // 格式通常是: 2024-01-01T14:30:00 或 2024-01-01T14:30:00.000Z
  const timePart = ts.split('T')[1];
  if (timePart) {
    // 提取小时和分钟部分 (HH:mm)
    const timeOnly = timePart.split(':').slice(0, 2).join(':');
    return timeOnly;
  }
  // 如果格式不匹配，回退到原来的方法
  return new Date(ts).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

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

// 日期编辑相关方法
const startEditDates = () => {
  editStartDate.value = trip.value.start_date;
  editEndDate.value = trip.value.end_date;
  isEditingDates.value = true;
};

const cancelEditDates = () => {
  isEditingDates.value = false;
  editStartDate.value = '';
  editEndDate.value = '';
};

const saveDates = () => {
  if (!editStartDate.value || !editEndDate.value) {
    ElMessage.error('请选择开始和结束日期');
    return;
  }
  
  if (new Date(editStartDate.value) > new Date(editEndDate.value)) {
    ElMessage.error('开始日期不能晚于结束日期');
    return;
  }
  
  const oldStartDate = trip.value.start_date;
  const oldEndDate = trip.value.end_date;
  
  // 更新行程日期
  trip.value.start_date = editStartDate.value;
  trip.value.end_date = editEndDate.value;
  
  // 如果日期范围改变了，需要调整事件日期
  if (oldStartDate !== editStartDate.value || oldEndDate !== editEndDate.value) {
    adjustEventDates(oldStartDate, oldEndDate, editStartDate.value, editEndDate.value);
  }
  
  isEditingDates.value = false;
  ElMessage.success('行程日期已更新');
};

// 调整事件日期以适应新的行程日期范围
const adjustEventDates = (oldStart, oldEnd, newStart, newEnd) => {
  if (!trip.value.events || !Array.isArray(trip.value.events)) return;
  
  const oldStartDate = new Date(oldStart);
  const oldEndDate = new Date(oldEnd);
  const newStartDate = new Date(newStart);
  const newEndDate = new Date(newEnd);
  
  const oldDuration = Math.ceil((oldEndDate - oldStartDate) / (1000 * 60 * 60 * 24)) + 1;
  const newDuration = Math.ceil((newEndDate - newStartDate) / (1000 * 60 * 60 * 24)) + 1;
  
  trip.value.events.forEach(event => {
    console.log('From old event date:', event.start_time);
    const eventDateTime = new Date(event.start_time);
    
    // 使用UTC时间来避免时区影响，确保日期计算准确
    const eventDate = new Date(Date.UTC(
      eventDateTime.getUTCFullYear(), 
      eventDateTime.getUTCMonth(), 
      eventDateTime.getUTCDate()
    ));
    
    // 同样使用UTC时间来处理开始日期，确保计算一致性
    const oldStartUTC = new Date(Date.UTC(
      oldStartDate.getUTCFullYear(),
      oldStartDate.getUTCMonth(), 
      oldStartDate.getUTCDate()
    ));
    
    // 计算事件在原始行程中的相对天数（从0开始）
    const dayOffset = Math.floor((eventDate - oldStartUTC) / (1000 * 60 * 60 * 24));
    
    let newDayOffset;
    if (newDuration >= oldDuration) {
      // 如果新行程等于或更长，严格保持事件在原来的天数上
      // 只有当事件本身就超出了原始范围时才需要调整
      if (dayOffset < 0) {
        newDayOffset = 0; // 如果事件在原始开始日期之前，移到第一天
      } else if (dayOffset >= oldDuration) {
        newDayOffset = oldDuration - 1; // 如果事件在原始结束日期之后，移到原始最后一天
      } else {
        newDayOffset = dayOffset; // 保持原来的相对位置
      }
    } else {
      // 如果新行程更短，按比例压缩到新范围内
      const ratio = (newDuration - 1) / (oldDuration - 1);
      newDayOffset = Math.round(dayOffset * ratio);
    }
    
    // 最终确保不超出新的日期范围
    newDayOffset = Math.max(0, Math.min(newDayOffset, newDuration - 1));
    
    // 计算新的事件日期，使用UTC时间确保准确性
    const newEventDate = new Date(Date.UTC(
      newStartDate.getUTCFullYear(),
      newStartDate.getUTCMonth(),
      newStartDate.getUTCDate() + newDayOffset
    ));
    
    // 保持原有的时间部分，只更新日期部分
    const timeStr = event.start_time.split('T')[1]; // 获取时间部分
    const newDateStr = newEventDate.toISOString().split('T')[0]; // 获取新日期部分
    
    console.log('Calculated new date string:', newDateStr);

    console.log('to new event date:', event.start_time);

    event.start_time = normalizeDateTime(`${newDateStr}T${timeStr}`);

  });
  
  ElMessage.info(`已自动调整 ${trip.value.events.length} 个事件的日期`);
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

/* 日期编辑区域样式 */
.trip-dates-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dates-display {
  display: flex;
  align-items: center;
}

.trip-dates {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #718096;
}

.edit-dates-btn {
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
  margin-left: 8px;
}

.edit-dates-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.dates-edit {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-dates-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-input-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
  min-width: 40px;
}

.date-picker-small {
  width: 140px;
}

.edit-dates-actions {
  display: flex;
  gap: 4px;
}

.save-dates-btn,
.cancel-dates-btn {
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

.save-dates-btn {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.save-dates-btn:hover {
  background: rgba(72, 187, 120, 0.2);
  transform: scale(1.1);
}

.cancel-dates-btn {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.cancel-dates-btn:hover {
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
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 12px;
  margin: 4px 0;
}

.event-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}

.event-item:active {
  transform: translateX(8px) scale(0.98);
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

.event-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.map-focus-icon {
  color: #667eea;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: pointer;
}

.map-focus-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #4c63d2;
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
  gap: 8px;
}

.voice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.voice-button:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.voice-button.recording {
  border-color: #e53e3e;
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
  animation: pulse-border 1.5s ease-in-out infinite;
}

.voice-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e53e3e;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.6; transform: scale(1); }
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
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
