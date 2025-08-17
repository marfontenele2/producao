<template>
  <transition name="slide-fade">
    <div v-if="notification.show" :class="['notification', notification.type]">
      <component :is="icon" :size="20" class="icon" />
      <p>{{ notification.message }}</p>
      <button @click="notification.hideNotification()" class="close-button">
        <X :size="18" />
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '@/store/notificationStore';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-vue-next';

const notification = useNotificationStore();

const icon = computed(() => {
  if (notification.type === 'error') return XCircle;
  if (notification.type === 'warning') return AlertTriangle;
  return CheckCircle2; // default to success
});
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  padding: 12px 18px;
  border-radius: 6px;
  color: white;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.icon {
  margin-right: 12px;
  flex-shrink: 0;
}

p {
  margin: 0;
  flex-grow: 1;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 16px;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
}

.success { background-color: #4caf50; }
.error { background-color: #f44336; }
.warning { background-color: #ff9800; }

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style> 
