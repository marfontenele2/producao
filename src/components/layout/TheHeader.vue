<template>
  <header class="header">
    <div class="header-title">
      <h2>{{ currentRouteTitle }}</h2>
    </div>
    <div class="user-info" v-if="userStore.user">
      <span>Olá, {{ userStore.user.nome }} ({{ userStore.user.role }})</span>
      <button @click="handleLogout" class="logout-button">
        <LogOut :size="18" />
        Sair
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { LogOut } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const currentRouteTitle = computed(() => route.name || 'Dashboard');

const handleLogout = async () => {
  await userStore.logout();
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.header {
  height: 64px;
  padding: 0 24px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
  }
}
</style>
