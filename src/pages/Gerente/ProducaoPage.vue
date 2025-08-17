<template>
  <div class="producao-gerente-page">
    <div class="card">
      <div class="card-header">
        <div class="header-content">
          <div class="selectors">
            <div class="form-group">
              <label for="competencia">Competência:</label>
              <input type="month" id="competencia" v-model="competencia" />
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <BaseSpinner v-if="loading" text="Carregando status das produções..." />
        <div v-else>
          <p class="instrucao">
            Clique no nome do módulo para editar a produção da equipe. A edição
            só está disponível para produções com status "ENTREGUE" ou "ABERTO".
          </p>
          <DashboardStatusTable
            :equipesComStatus="equipesComStatus"
            :modulos="modulos"
            @navegar="navegarParaEdicao"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useStatusGerencialStore } from "@/store/statusGerencialStore";
import DashboardStatusTable from "@/components/gerente/DashboardStatusTable.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { getCompetenciaAtual } from "@/utils/dateUtils";

const router = useRouter();
const userStore = useUserStore();
const statusGerencialStore = useStatusGerencialStore();

const competencia = ref(getCompetenciaAtual());
const equipesComStatus = ref([]);
const modulos = ref([]);
const loading = ref(true);

const rotasDeEdicao = {
  scnes: "GerenciarSCNES",
  saudeMental: "SaudeMental",
  producaoAcs: "ProducaoAcs", // Supondo que o gerente use a mesma página do enfermeiro
  cronograma: "Cronograma",
  boletim: "Boletim",
};

async function carregarDados() {
  loading.value = true;
  statusGerencialStore.setCompetencia(competencia.value);
  await statusGerencialStore.carregarStatus();
  equipesComStatus.value = statusGerencialStore.equipesComStatus;
  modulos.value = statusGerencialStore.modulos;
  loading.value = false;
}

watch(competencia, carregarDados);

onMounted(() => {
  if (userStore.isGerente) {
    carregarDados();
  }
});

function navegarParaEdicao(payload) {
  const rota = rotasDeEdicao[payload.modulo.chave];
  if (rota) {
    // Aqui você pode adicionar lógica para passar a equipe/competência como query, se necessário
    router.push({ name: rota });
  } else {
    alert(`Navegação para o módulo '${payload.modulo.nome}' não implementada.`);
  }
}
</script>

<style lang="scss" scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selectors {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.card-body {
  padding: 24px;
}
.instrucao {
  font-size: 0.9rem;
  color: #666;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
}
</style>
