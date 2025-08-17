// 📄 ARQUIVO: src/layouts/PrintLayout.vue
<template>
  <div class="print-layout">
    <router-view />
  </div>
</template>

<style lang="scss">
// Estilos globais para o layout de impressão, se necessário
body {
  background-color: #fff; // Garante um fundo branco para impressão
}
.print-layout {
  padding: 1rem;
}
</style>
