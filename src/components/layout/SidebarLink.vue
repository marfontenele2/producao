<template>
  <router-link
    :to="isLinkActive ? to : ''"
    class="nav-item"
    :class="{ 'is-disabled': !isLinkActive }"
  >
    <component v-if="icon" :is="icon" :size="20" />
    <div class="link-text-group">
      <span>{{ label }}</span>
      <span v-if="status && status.prazoInfo" class="prazo-info">
        {{ status.prazoInfo }}
      </span>
    </div>
    <StatusBadge v-if="status" :status="status" />
  </router-link>
</template>

<script setup>
import { computed, defineProps } from "vue";
import StatusBadge from "@/components/shared/StatusBadge.vue";

const props = defineProps({
  to: { type: [String, Object], required: true },
  label: { type: String, required: true },
  icon: { type: [Object, Function], default: null },
  status: { type: Object, default: null },
});

const isLinkActive = computed(() => {
  if (!props.status) {
    return true;
  }
  return props.status.isAberto;
});
</script>

<style lang="scss" scoped>
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
  gap: 12px;

  &:hover,
  &.router-link-exact-active {
    background-color: #1890ff;
    color: white;
  }
}

.link-text-group {
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  span {
    line-height: 1.3;
  }

  .prazo-info {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none; /* Impede eventos de clique */

  &:hover,
  &.router-link-exact-active {
    background-color: transparent; /* Remove o efeito hover */
    color: rgba(255, 255, 255, 0.85);
  }
}
</style>
