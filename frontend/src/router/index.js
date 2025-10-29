import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase';

import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Plan from '../views/Plan.vue';
import TripDetails from '../views/TripDetails.vue';
import Profile from '../views/Profile.vue'; // 引入 Profile 组件
import TripList from '../views/TripList.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/plan',
    name: 'Plan',
    component: Plan,
    meta: { requiresAuth: true },
  },
  {
    path: '/trip/:id',
    name: 'TripDetails',
    component: TripDetails,
    meta: { requiresAuth: true },
  },
  {
    path: '/trips',
    name: 'TripList',
    component: TripList,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const isLoggedIn = !!data.session;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
