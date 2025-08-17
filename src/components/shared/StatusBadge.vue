// 📄 ARQUIVO: src/components/shared/StatusBadge.vue
<template>
  <span
    v-if="status && status.texto"
    class="status-badge"
    :style="{ backgroundColor: status.cor }"
  >
    {{ status.texto }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: Object,
    required: true,
    default: () => ({ texto: "...", cor: "#cccccc" }),
  },
});
</script>

<style lang="scss" scoped>
.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  text-transform: uppercase;
  min-width: 80px; /* Garante que os selos tenham um tamanho mínimo consistente */
  text-align: center;
  white-space: normal;
  line-height: 1.2;
}
</style>
