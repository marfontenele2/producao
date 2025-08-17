<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Produção do Adolescente (10 a 19 anos)</h1>
      <div class="competencia-selector">
        <label for="competencia">Competência:</label>
        <input id="competencia" type="month" v-model="competencia" />
      </div>
    </header>

    <div class="content-card">
      <BaseSpinner v-if="loading" text="Carregando dados..." />
      <div v-else>
        <table class="production-table">
          <thead>
            <tr>
              <th rowspan="2">Atendimento - Motivo da consulta</th>
              <th colspan="2">10-14 anos</th>
              <th colspan="2">15-19 anos</th>
              <th>Cons. Médica</th>
              <th>Cons. Enferm</th>
              <th>Cons. Outros Profiss</th>
              <th>TOTAL</th>
            </tr>
            <tr>
              <th>Masc</th>
              <th>Fem</th>
              <th>Masc</th>
              <th>Fem</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in atendimentos" :key="item.key">
              <td>{{ item.label }}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].masc1"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].fem1"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].masc2"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].fem2"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].med"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].enf"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.atendimentos[item.key].outros"
                  :disabled="isFormDisabled"
                />
              </td>
              <td class="total-cell">
                {{ totais.atendimentos[item.key].faixaEtaria }}
                <span
                  v-if="!totais.atendimentos[item.key].isValid"
                  title="Soma das faixas etárias não bate com a soma das consultas."
                  class="warning-icon"
                  >⚠️</span
                >
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <td>{{ totais.geralAtendimentos.masc1 }}</td>
              <td>{{ totais.geralAtendimentos.fem1 }}</td>
              <td>{{ totais.geralAtendimentos.masc2 }}</td>
              <td>{{ totais.geralAtendimentos.fem2 }}</td>
              <td>{{ totais.geralAtendimentos.med }}</td>
              <td>{{ totais.geralAtendimentos.enf }}</td>
              <td>{{ totais.geralAtendimentos.outros }}</td>
              <td class="total-cell">{{ totais.geralAtendimentos.total }}</td>
            </tr>
          </tfoot>
        </table>

        <h3 class="table-title">Métodos Contraceptivos</h3>
        <table class="production-table">
          <thead>
            <tr>
              <th rowspan="2">Métodos</th>
              <th colspan="2">10-14 anos</th>
              <th colspan="2">15-19 anos</th>
              <th rowspan="2">TOTAL</th>
              <th rowspan="2">ESTOQUE ATUAL</th>
            </tr>
            <tr>
              <th>Masc</th>
              <th>Fem</th>
              <th>Masc</th>
              <th>Fem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in metodos" :key="item.key">
              <td>{{ item.label }}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.metodos[item.key].masc1"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.metodos[item.key].fem1"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.metodos[item.key].masc2"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.metodos[item.key].fem2"
                  :disabled="isFormDisabled"
                />
              </td>
              <td class="total-cell">{{ totais.metodos[item.key] }}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.metodos[item.key].estoque"
                  :disabled="isFormDisabled"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions">
          <button @click="handlePrint" class="btn-secondary">Imprimir</button>
          <button
            @click="handleSave"
            :disabled="isFormDisabled"
            class="btn-secondary"
          >
            Salvar Rascunho
          </button>
          <button
            @click="handleFinalize"
            :disabled="isFormDisabled"
            class="btn-success"
          >
            Finalizar e Entregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { adolescenteService } from "@/services/adolescenteService";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const competencia = ref(getCompetenciaAtual());
const loading = ref(true);
const producao = ref({});

const atendimentos = ref([
  { key: "acompanhamentoCrescimento", label: "Acompanhamento do Crescimento" },
  { key: "planejamentoFamiliar", label: "Planejamento Familiar" },
  { key: "imunizacao", label: "Imunização" },
  { key: "preNatal", label: "Pré-Natal" },
  { key: "ist", label: "IST" },
  { key: "queixasGineco", label: "Queixas Gineco" },
  { key: "queixasClinicas", label: "Queixas Clínicas" },
  { key: "dentista", label: "Dentista" },
  { key: "nutricao", label: "Nutrição" },
  { key: "transtornosEmocionais", label: "Transt. Emocionais" },
  { key: "oficinasEducativas", label: "Oficinas Educativas" },
]);

const metodos = ref([
  { key: "preservativoMasc", label: "PRESER. MASC." },
  { key: "anticoncepcionalOral", label: "ANTICONC. ORAL" },
  { key: "anticoncepcionalInjetavel", label: "ANTICONC. INJETÁVEL" },
]);

const documentoId = computed(() =>
  userStore.user?.equipeId
    ? `${competencia.value}_${userStore.user.equipeId}`
    : null
);
const isFormDisabled = computed(
  () => producao.value?.finalizado || loading.value
);

let unsubscribe = () => {};

watch(
  documentoId,
  (newId) => {
    unsubscribe();
    if (newId) {
      loading.value = true;
      unsubscribe = adolescenteService.monitorarProducao(newId, (data) => {
        producao.value = data;
        loading.value = false;
      });
    }
  },
  { immediate: true }
);

onUnmounted(() => unsubscribe());

const totais = computed(() => {
  const p = producao.value;
  if (!p || !p.atendimentos) {
    return {
      atendimentos: {},
      vacinacao: {},
      metodos: {},
      geralAtendimentos: {},
      geralMetodos: {},
    };
  }
  const num = (val) => Number(val) || 0;

  const resultados = {
    atendimentos: {},
    metodos: {},
    geralAtendimentos: {
      masc1: 0,
      fem1: 0,
      masc2: 0,
      fem2: 0,
      med: 0,
      enf: 0,
      outros: 0,
      total: 0,
    },
  };

  atendimentos.value.forEach((item) => {
    const d = p.atendimentos[item.key];
    const somaFaixaEtaria =
      num(d.masc1) + num(d.fem1) + num(d.masc2) + num(d.fem2);
    const somaConsultas = num(d.med) + num(d.enf) + num(d.outros);
    resultados.atendimentos[item.key] = {
      faixaEtaria: somaFaixaEtaria,
      consultas: somaConsultas,
      isValid: somaFaixaEtaria === somaConsultas,
    };

    resultados.geralAtendimentos.masc1 += num(d.masc1);
    resultados.geralAtendimentos.fem1 += num(d.fem1);
    resultados.geralAtendimentos.masc2 += num(d.masc2);
    resultados.geralAtendimentos.fem2 += num(d.fem2);
    resultados.geralAtendimentos.med += num(d.med);
    resultados.geralAtendimentos.enf += num(d.enf);
    resultados.geralAtendimentos.outros += num(d.outros);
  });

  resultados.geralAtendimentos.total =
    resultados.geralAtendimentos.masc1 +
    resultados.geralAtendimentos.fem1 +
    resultados.geralAtendimentos.masc2 +
    resultados.geralAtendimentos.fem2;

  metodos.value.forEach((item) => {
    const d = p.metodos[item.key];
    resultados.metodos[item.key] =
      num(d.masc1) + num(d.fem1) + num(d.masc2) + num(d.fem2);
  });

  return resultados;
});

async function handleSave() {
  if (!documentoId.value) return;
  try {
    await adolescenteService.salvarProducao(
      documentoId.value,
      producao.value,
      userStore.user.equipeId,
      userStore.user.ubsId
    );
    notificationStore.showNotification(
      "Rascunho salvo com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar:", error);
    notificationStore.showNotification("Erro ao salvar rascunho.", "error");
  }
}

async function handleFinalize() {
  if (
    window.confirm(
      "Após finalizar, não será possível editar. Deseja continuar?"
    )
  ) {
    await handleSave();
    try {
      await adolescenteService.finalizarCompetencia(documentoId.value);
      notificationStore.showNotification(
        "Produção finalizada e entregue!",
        "success"
      );
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      notificationStore.showNotification(
        "Erro ao finalizar produção.",
        "error"
      );
    }
  }
}

function handlePrint() {
  if (!documentoId.value) return;
  const routeData = router.resolve({
    name: "AdolescentePrint",
    params: {
      competencia: competencia.value,
      equipeId: userStore.user.equipeId,
    },
  });
  window.open(routeData.href, "_blank");
}
</script>

<style scoped>
.page-container {
  padding: 1.5rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.content-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.table-title {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
.production-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.production-table th,
.production-table td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
}
.production-table thead th {
  background-color: #f8f9fa;
  font-size: 0.8rem;
}
.production-table tfoot th,
.production-table tfoot td {
  font-weight: bold;
  font-size: 1rem;
  background-color: #f8f9fa;
}
.production-table td:first-child {
  text-align: left;
  font-weight: 500;
}
.production-table .section-header td {
  background-color: #e9ecef;
  font-weight: bold;
  text-align: left;
  padding-left: 1rem;
}
.production-table input {
  width: 100%;
  box-sizing: border-box;
  min-width: 50px;
  text-align: center;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px;
}
input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
.total-cell {
  font-weight: bold;
  background-color: #f8f9fa;
}
.warning-icon {
  color: #ffc107;
  font-weight: bold;
  margin-left: 4px;
  cursor: help;
}
.actions {
  margin-top: 1.5rem;
  text-align: right;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

/* ✅ ESTILOS ADICIONADOS */
.competencia-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
#competencia {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}
</style>
