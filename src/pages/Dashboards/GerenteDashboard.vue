<template>
  <div class="dashboard-gerente">
    <header class="dashboard-header">
      <h1>Dashboard Gerencial</h1>
      <div class="form-group">
        <label for="competencia">Filtrar por Competência:</label>
        <input type="month" id="competencia" v-model="competencia" />
      </div>
    </header>

    <BaseSpinner v-if="store.loading" text="Buscando status das equipes..." />
    <div
      v-else-if="store.equipesComStatus.length === 0"
      class="aviso-container"
    >
      <div class="card aviso">
        Nenhuma produção encontrada para a competência selecionada.
      </div>
    </div>
    <div v-else class="cards-container">
      <ModuloStatusCard
        v-for="modulo in store.modulos"
        :key="modulo.chave"
        :modulo="modulo"
        :equipes="store.equipesComStatus"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStatusGerencialStore } from "@/store/statusGerencialStore";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
// ✅ Importa o novo componente de Card
import ModuloStatusCard from "@/components/gerente/ModuloStatusCard.vue";

const store = useStatusGerencialStore();

const competencia = computed({
  get: () => store.competenciaAtual,
  set: (value) => store.setCompetencia(value),
});
</script>

<style lang="scss" scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h1 {
  margin: 0;
  font-size: 1.8rem;
}
.form-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-group input[type="month"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.aviso-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}
.card.aviso {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
</style>
