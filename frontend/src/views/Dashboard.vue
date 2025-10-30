<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <el-icon :size="28"><MapLocation /></el-icon>
          </div>
          <h1 class="brand-title">AI 旅行规划助手</h1>
        </div>
        
        <div class="user-menu">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-avatar">
              <div class="avatar-circle">
                <span class="avatar-text">{{ user?.email?.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="user-email">{{ user?.email }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="custom-dropdown">
                <el-dropdown-item command="profile" class="dropdown-item">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided class="dropdown-item">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="content-container">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <div class="welcome-content">
            <h2 class="welcome-title">你好，旅行者！👋</h2>
            <p class="welcome-subtitle">准备好开始你的下一次智能旅行了吗？让 AI 为你规划完美的行程。</p>
          </div>
          <div class="welcome-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>
        </section>

        <!-- Action Cards -->
        <section class="action-cards">
          <div class="card-grid">
            <!-- Planning Card -->
            <div class="action-card primary-card" @click="goToPlan">
              <div class="card-header">
                <div class="card-icon primary-icon">
                  <el-icon :size="24"><MapLocation /></el-icon>
                </div>
                <div class="card-badge">开始创建</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">智能行程规划</h3>
                <p class="card-description">
                  使用 AI 技术生成个性化旅行计划，包含详细的行程安排、预算建议和实时路线规划。
                </p>
              </div>
              <div class="card-footer">
                <div class="card-action">
                  <span>开始规划</span>
                  <el-icon class="action-arrow"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>

            <!-- My Trips Card -->
            <div class="action-card secondary-card" @click="goToTripList">
              <div class="card-header">
                <div class="card-icon secondary-icon">
                  <el-icon :size="24"><Collection /></el-icon>
                </div>
                <div class="card-badge">管理计划</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">我的旅行计划</h3>
                <p class="card-description">
                  查看、编辑和管理你的所有旅行计划，跟踪预算使用情况，随时调整行程安排。
                </p>
              </div>
              <div class="card-footer">
                <div class="card-action">
                  <span>查看计划</span>
                  <el-icon class="action-arrow"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Stats -->
        <section class="quick-stats">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-label">智能规划</div>
                <div class="stat-description">AI 驱动的个性化行程</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🗣️</div>
              <div class="stat-content">
                <div class="stat-label">语音输入</div>
                <div class="stat-description">自然语言描述需求</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">预算管理</div>
                <div class="stat-description">智能费用分析预测</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🗺️</div>
              <div class="stat-content">
                <div class="stat-label">路线规划</div>
                <div class="stat-description">实时地图导航集成</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { ArrowDown, MapLocation, Collection, User, SwitchButton, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();
const user = ref(null);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
});

const goToPlan = () => {
  router.push({ name: 'Plan' });
};

const goToTripList = () => {
  router.push({ name: 'TripList' });
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

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

/* Header */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-menu {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-email {
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.user-avatar:hover .dropdown-icon {
  transform: rotate(180deg);
}

.custom-dropdown {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.dropdown-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 8px;
  margin: 0.25rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* Main Content */
.dashboard-main {
  padding: 3rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Welcome Section */
.welcome-section {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
}

.welcome-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 50px;
  right: 100px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: -50px;
  right: 50px;
}

/* Action Cards */
.action-cards {
  margin-bottom: 3rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.primary-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.secondary-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.card-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-content {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.card-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  transition: gap 0.3s ease;
}

.action-card:hover .card-action {
  gap: 0.75rem;
}

.action-arrow {
  transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

/* Quick Stats */
.quick-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.stat-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .content-container {
    padding: 0 1rem;
  }
  
  .welcome-section {
    padding: 2rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .action-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .user-email {
    display: none;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 2rem 0;
  }
  
  .welcome-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.75rem;
  }
  
  .card-grid {
    gap: 1rem;
  }
  
  .action-card {
    padding: 1.25rem;
  }
}
</style>
