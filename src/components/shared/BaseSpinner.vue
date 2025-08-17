// 📄 ARQUIVO: src/components/shared/BaseSpinner.vue
<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "Carregando...",
  },
});
</script>

<style lang="scss" scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: #6c757d;
  width: 100%;
}

.spinner {
  border: 4px solid #f3f3f3; /* Cinza claro */
  border-top: 4px solid #001529; /* Azul escuro do tema */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.spinner-text {
  margin-top: 16px;
  font-size: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
