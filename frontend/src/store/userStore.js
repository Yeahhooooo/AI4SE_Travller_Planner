import { ref } from 'vue';

// 创建一个响应式的 ref 来存储用户信息
export const user = ref(null);

// 设置用户信息的函数
export function setUser(userData) {
  user.value = userData;
}

// 清除用户信息的函数
export function clearUser() {
  user.value = null;
}
