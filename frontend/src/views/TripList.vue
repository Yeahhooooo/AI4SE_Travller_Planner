<template>
  <div class="trip-list-container">
    <!-- 现代化头部 -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-left" @click="goBack">
          <el-icon :size="24" class="back-icon"><ArrowLeftBold /></el-icon>
          <span class="app-title">我的旅行计划</span>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-info">
              <div class="user-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</div>
              <span class="user-email">{{ user?.email }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" class="profile-item">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" class="logout-item" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 页面标题区域 -->
        <div class="page-header">
          <div class="header-content-section">
            <h1 class="page-title">我的旅行计划</h1>
            <p class="page-subtitle">管理您保存的所有旅行计划</p>
          </div>
          <div class="stats-info">
            <div class="stat-item">
              <span class="stat-number">{{ trips.length }}</span>
              <span class="stat-label">总计划数</span>
            </div>
          </div>
        </div>

        <!-- 旅行计划卡片网格 -->
        <div class="trips-grid" v-if="trips.length > 0">
          <div 
            v-for="trip in trips" 
            :key="trip.id" 
            class="trip-card"
            @click="viewTrip(trip.id)"
          >
            <div class="card-header">
              <div class="trip-icon">
                <el-icon :size="24"><MapLocation /></el-icon>
              </div>
              <div class="card-actions">
                <button 
                  class="action-btn view-btn"
                  @click.stop="viewTrip(trip.id)"
                >
                  <el-icon :size="16"><View /></el-icon>
                </button>
                <button 
                  class="action-btn delete-btn"
                  @click.stop="deleteTrip(trip.id)"
                >
                  <el-icon :size="16"><Delete /></el-icon>
                </button>
              </div>
            </div>
            
            <div class="card-content">
              <h3 class="trip-title">{{ trip.name || '未命名计划' }}</h3>
              <div class="trip-dates">
                <div class="date-item">
                  <el-icon class="date-icon"><Calendar /></el-icon>
                  <span>{{ formatDate(trip.start_date) }}</span>
                </div>
                <div class="date-separator">→</div>
                <div class="date-item">
                  <el-icon class="date-icon"><Calendar /></el-icon>
                  <span>{{ formatDate(trip.end_date) }}</span>
                </div>
              </div>
              <div class="trip-meta">
                <span class="created-date">创建于 {{ formatDateTime(trip.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><MapLocation /></el-icon>
          </div>
          <h3 class="empty-title">暂无旅行计划</h3>
          <p class="empty-subtitle">开始创建您的第一个旅行计划吧</p>
          <button class="create-plan-btn" @click="createNewPlan">
            <el-icon :size="20"><Plus /></el-icon>
            <span>创建计划</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ArrowDown, ArrowLeftBold, MapLocation, Calendar, View, Delete, User, SwitchButton, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { user } from '../store/userStore';

const router = useRouter();
const trips = ref([]);

onMounted(async () => {
  if (!user.value) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push({ name: 'Login' });
      return;
    }
  }
  fetchTrips();
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

const formatDate = (dateString) => {
  if (!dateString) return '未设定';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const createNewPlan = () => {
  router.push({ name: 'Plan' });
};
</script>

<style scoped>
.trip-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.trip-list-container::before {
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
  max-width: 1200px;
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

.back-icon {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 12px;
  transition: all 0.3s ease;
}

.header-left:hover .back-icon {
  color: white;
  transform: translateX(-2px);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
}

.user-email {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-right: 8px;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: translateY(1px);
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 10;
  padding: 40px 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-content-section {
  flex: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-info {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 旅行计划网格 */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.trip-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.trip-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.trip-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trip-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.card-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.trip-card:hover .card-actions {
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

.view-btn {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.view-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.delete-btn:hover {
  background: rgba(229, 62, 62, 0.2);
  transform: scale(1.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  line-height: 1.3;
}

.trip-dates {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.date-icon {
  font-size: 14px;
}

.date-separator {
  color: #a0aec0;
  font-weight: 600;
}

.trip-meta {
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.created-date {
  font-size: 12px;
  color: #a0aec0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  margin-bottom: 24px;
  color: rgba(102, 126, 234, 0.6);
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 16px;
  color: #a0aec0;
  margin-bottom: 32px;
}

.create-plan-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.create-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

/* 下拉菜单样式 */
.profile-item,
.logout-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .trips-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .trip-card {
    padding: 20px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .user-email {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }
  
  .trip-card {
    padding: 16px;
  }
  
  .trip-dates {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .date-separator {
    display: none;
  }
  
  .card-actions {
    opacity: 1;
  }
}
</style>
