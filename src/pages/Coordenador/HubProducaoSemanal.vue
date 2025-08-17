<template>
  <div class="hub-container">
    <h1>Relatórios de Produção Semanal</h1>
    <p>
      Selecione um relatório para visualizar os dados consolidados com filtros.
    </p>
    <div class="card-grid">
      <div class="report-card placeholder">Relatório de MDDA (em breve)</div>
      <div class="report-card placeholder">
        Relatório de Notificação (em breve)
      </div>
      <div class="report-card placeholder">Relatório de Sarampo (em breve)</div>
    </div>
  </div>
</template>

<style scoped>
.hub-container {
  padding: 2rem;
}
h1 {
  margin-top: 0;
}
p {
  color: #666;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
.report-card {
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.report-card.placeholder {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}
</style>
