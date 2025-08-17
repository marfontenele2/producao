<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Painel de Entregas - Produção Semanal</h1>
      <div class="filters-container">
        <div class="filter-group">
          <label>Filtrar por Equipe:</label>
          <MultiSelectDropdown
            v-model="equipesSelecionadas"
            :options="equipeOptions"
            placeholder="Todas as Equipes"
          />
        </div>
        <div class="filter-group">
          <label>Semanas Epidemiológicas:</label>
          <MultiSelectDropdown
            v-model="store.semanasSelecionadas"
            :options="semanaOptions"
            placeholder="Selecione as Semanas"
          />
        </div>
      </div>
    </header>

    <div v-if="store.loading" class="loading-spinner">Carregando...</div>
    <div v-else-if="ubsFiltradas.length === 0" class="no-data">
      Nenhuma UBS ou equipe encontrada com os filtros atuais.
    </div>

    <div class="ubs-list">
      <div v-for="ubs in ubsFiltradas" :key="ubs.id" class="ubs-card">
        <h2>{{ ubs.nome }}</h2>
        <div class="equipes-grid" :style="gridStyle">
          <div class="grid-header-label">Equipe</div>
          <div
            v-for="modulo in store.modulos"
            :key="modulo.chave"
            class="grid-header"
          >
            {{ modulo.nome }}
          </div>
          <template v-for="equipe in ubs.equipes" :key="equipe.id">
            <div class="equipe-name">{{ equipe.nome }}</div>
            <div
              v-for="modulo in store.modulos"
              :key="`${equipe.id}-${modulo.chave}`"
              class="status-cell"
            >
              <span
                class="status-tag"
                :style="{ backgroundColor: equipe.modulos[modulo.chave]?.cor }"
              >
                {{ equipe.modulos[modulo.chave]?.status || "N/D" }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStatusCoordenadorSemanalStore } from "@/store/statusCoordenadorSemanalStore.js";
import MultiSelectDropdown from "@/components/shared/MultiSelectDropdown.vue"; // ✅ Importa o novo componente

const store = useStatusCoordenadorSemanalStore();
const equipesSelecionadas = ref([]);

const equipeOptions = computed(() =>
  store.listaTodasAsEquipes.map((e) => ({ value: e.id, text: e.nome }))
);

const formatarData = (dataStr) => {
  const data = new Date(dataStr + "T00:00:00");
  return data.toLocaleDateString("pt-BR");
};

const semanaOptions = computed(() =>
  store.semanasDisponiveis.map((s) => ({
    value: `${s.year}-W${String(s.week).padStart(2, "0")}`,
    text: `SE ${String(s.week).padStart(2, "0")} (${formatarData(
      s.start
    )} - ${formatarData(s.end)})`,
  }))
);

const gridStyle = computed(() => ({
  gridTemplateColumns: `2fr repeat(${store.modulos.length}, 1fr)`,
}));

const ubsFiltradas = computed(() => {
  if (equipesSelecionadas.value.length === 0) {
    return store.ubsComStatus;
  }
  return store.ubsComStatus
    .map((ubs) => {
      const equipesFiltradas = ubs.equipes.filter((equipe) =>
        equipesSelecionadas.value.includes(equipe.id)
      );
      return { ...ubs, equipes: equipesFiltradas };
    })
    .filter((ubs) => ubs.equipes.length > 0);
});
</script>

<style scoped>
/* Estilos são idênticos ao CoordenadorDashboard.vue */
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.filters-container {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.filter-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
}
.competencia-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #fff;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  height: 41px;
}
.competencia-input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.loading-spinner,
.no-data {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
  color: #666;
}
.ubs-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.ubs-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.ubs-card h2 {
  margin-top: 0;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}
.equipes-grid {
  display: grid;
  gap: 10px;
  align-items: center;
}
.grid-header,
.grid-header-label {
  font-weight: bold;
  font-size: 0.8rem;
  color: #495057;
  text-align: center;
}
.grid-header-label {
  text-align: left;
}
.equipe-name {
  font-weight: 500;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.status-cell {
  text-align: center;
}
.status-tag {
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-block;
  min-width: 80px;
}
</style>
