<template>
  <div class="hub-container">
    <h1>Relatórios de Produção Mensal</h1>
    <p>
      Selecione um relatório para visualizar os dados consolidados com filtros.
    </p>
    <div class="card-grid">
      <router-link to="/coordenador/relatorios/scnes" class="report-card">
        <ClipboardPaste :size="32" />
        <span>SCNES</span>
      </router-link>
      <router-link
        to="/coordenador/relatorios/saude-mental"
        class="report-card"
      >
        <BrainCircuit :size="32" />
        <span>Saúde Mental</span>
      </router-link>
      <router-link to="/coordenador/relatorios/adolescente" class="report-card">
        <Baby :size="32" />
        <span>Adolescente</span>
      </router-link>

      <div class="report-card placeholder">Produção ACS (em breve)</div>
      <div class="report-card placeholder">Cronograma (em breve)</div>
      <div class="report-card placeholder">Boletim de Testes (em breve)</div>
      <div class="report-card placeholder">Suplementos (em breve)</div>
      <div class="report-card placeholder">Educação Permanente (em breve)</div>
      <div class="report-card placeholder">Gestantes (em breve)</div>
    </div>
  </div>
</template>

<script setup>
import { ClipboardPaste, BrainCircuit, Baby } from "lucide-vue-next";
</script>

<style scoped>
/* Estilos permanecem os mesmos */
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
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #333;
  text-decoration: none;
}
.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}
.report-card.placeholder {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #ddd;
}
.report-card.placeholder:hover {
  transform: none;
  box-shadow: none;
}
</style>
