// 📄 ARQUIVO NOVO: src/pages/Dashboards/EnfermeiroDashboard.vue
<template>
  <div class="dashboard-container">
    <div class="card">
      <div class="card-header">
        <h1>Dashboard do Enfermeiro</h1>
        <p>Acompanhe o status das suas produções mensais.</p>
      </div>
      <div class="card-body">
        <p>Módulos de produção serão exibidos aqui em breve.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nenhuma lógica necessária por enquanto.
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 2rem;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    margin: 4px 0 0;
    color: #666;
  }
}
.card-body {
  padding: 24px;
}
</style>
