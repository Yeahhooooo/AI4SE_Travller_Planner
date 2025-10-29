import { ref } from 'vue';

// 创建一个响应式的 ref 来存储用户信息
export const user = ref(null);
export const profile = ref(null);

// 设置用户信息的函数
export function setUser(userData) {
  user.value = userData;
}

// 设置用户个人资料的函数
export function setProfile(profileData) {
  profile.value = profileData;
}

// 清除用户信息的函数
export function clearUser() {
  user.value = null;
  profile.value = null;
}
