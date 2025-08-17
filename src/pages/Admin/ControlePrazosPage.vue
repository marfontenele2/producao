<template>
  <div class="prazos-page">
    <header class="page-header">
      <div>
        <h2>Controle de Prazos</h2>
        <p>
          Defina as datas de abertura e fechamento para cada módulo por
          competência.
        </p>
      </div>
      <div class="competencia-selector" v-if="!loading">
        <label for="competencia">Competência:</label>
        <input type="month" id="competencia" v-model="competencia" />
      </div>
    </header>

    <div class="content-card">
      <BaseSpinner v-if="loading" text="Carregando prazos..." />
      <form v-else @submit.prevent="salvarPrazos">
        <div class="modulos-grid">
          <div class="grupo-modulo">
            <h3>Produção do Gerente (Mensal)</h3>
            <div
              v-for="modulo in modulos.gerente"
              :key="modulo.id"
              class="modulo-row"
            >
              <label :for="modulo.id">{{ modulo.nome }}</label>
              <div class="date-inputs">
                <input
                  type="date"
                  :id="modulo.id + '_abertura'"
                  v-model="prazosMensais[modulo.id].abertura"
                />
                <span>até</span>
                <input
                  type="date"
                  :id="modulo.id + '_fechamento'"
                  v-model="prazosMensais[modulo.id].fechamento"
                />
                <input
                  type="number"
                  class="dia-oficial"
                  placeholder="Dia"
                  title="Dia Oficial de Entrega"
                  v-model.number="prazosMensais[modulo.id].diaOficial"
                />
              </div>
            </div>
          </div>

          <div class="grupo-modulo">
            <h3>Produção do Enfermeiro (Mensal)</h3>
            <div
              v-for="modulo in modulos.enfermeiro"
              :key="modulo.id"
              class="modulo-row"
            >
              <label :for="modulo.id">{{ modulo.nome }}</label>
              <div class="date-inputs">
                <input
                  type="date"
                  :id="modulo.id + '_abertura'"
                  v-model="prazosMensais[modulo.id].abertura"
                />
                <span>até</span>
                <input
                  type="date"
                  :id="modulo.id + '_fechamento'"
                  v-model="prazosMensais[modulo.id].fechamento"
                />
                <input
                  type="number"
                  class="dia-oficial"
                  placeholder="Dia"
                  title="Dia Oficial de Entrega"
                  v-model.number="prazosMensais[modulo.id].diaOficial"
                />
              </div>
            </div>
          </div>

          <div class="grupo-modulo">
            <h3>Produção do Enfermeiro (Semanal)</h3>
            <div
              v-for="modulo in modulos.semanal"
              :key="modulo.id"
              class="modulo-row"
            >
              <label :for="modulo.id">{{ modulo.nome }}</label>
              <div class="date-inputs">
                <span>Abre na:</span>
                <select
                  v-model.number="prazosSemanais[modulo.id].abertura"
                  class="select-input"
                >
                  <option
                    v-for="(dia, index) in diasDaSemana"
                    :key="index"
                    :value="index"
                  >
                    {{ dia }}
                  </option>
                </select>
                <span>Fecha na:</span>
                <select
                  v-model.number="prazosSemanais[modulo.id].fechamento"
                  class="select-input"
                >
                  <option
                    v-for="(dia, index) in diasDaSemana"
                    :key="index"
                    :value="index"
                  >
                    {{ dia }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn-primary">
            <Save :size="18" />
            Salvar Todos os Prazos
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { prazosService } from "@/services/prazosService";
import { prazosSemanaisService } from "@/services/prazosSemanaisService";
import { useNotificationStore } from "@/store/notificationStore";
import { Save } from "lucide-vue-next";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

const notificationStore = useNotificationStore();
const loading = ref(true);
const dadosMensaisCarregados = ref(false);
const dadosSemanaisCarregados = ref(false);
const diasDaSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const modulos = {
  gerente: [
    { id: "saudeMental", nome: "Saúde Mental" },
    { id: "scnes", nome: "Gerenciar SCNES" },
    { id: "validacaoAcs", nome: "Validação ACS" },
  ],
  enfermeiro: [
    { id: "gestantes", nome: "Gestantes" },
    { id: "suplementos", nome: "Suplementos" },
    { id: "adolescente", nome: "Adolescente" },
    { id: "producaoAcs", nome: "Produção ACS" },
    { id: "educacaoPermanente", nome: "Educação Permanente" },
    { id: "boletimTestesRapidos", nome: "Boletim Testes Rápidos" },
    { id: "cronograma", nome: "Cronograma de Atividades" },
  ],
  // ✅ INÍCIO DA CORREÇÃO: Adicionando Paralisia Flácida à lista da interface.
  semanal: [
    { id: "mdda", nome: "Monitorização DDA" },
    { id: "notificacaoSemanal", nome: "Notificação Negativa Semanal" },
    { id: "sarampo", nome: "Ficha de Sarampo/Rubéola" },
    { id: "paralisiaFlacida", nome: "Paralisia Flácida Aguda" }, // <-- LINHA ADICIONADA
  ],
  // ✅ FIM DA CORREÇÃO
};

const allModuloIds = [
  ...modulos.gerente.map((m) => m.id),
  ...modulos.enfermeiro.map((m) => m.id),
];
const allModuloSemanalIds = modulos.semanal.map((m) => m.id);

const competencia = ref(new Date().toISOString().slice(0, 7));
const prazosMensais = ref({});
const prazosSemanais = ref({});
let unsubMensal = null;
let unsubSemanal = null;

const inicializarPrazos = (dadosDoBanco) => {
  const prazosTemp = {};
  allModuloIds.forEach((id) => {
    prazosTemp[id] = {
      abertura: dadosDoBanco[id]?.abertura || "",
      fechamento: dadosDoBanco[id]?.fechamento || "",
      diaOficial: dadosDoBanco[id]?.diaOficial || null,
    };
  });
  prazosMensais.value = prazosTemp;
};

const inicializarPrazosSemanais = (dadosDoBanco) => {
  const prazosTemp = {};
  allModuloSemanalIds.forEach((id) => {
    prazosTemp[id] = {
      abertura: dadosDoBanco[id]?.abertura ?? 1,
      fechamento: dadosDoBanco[id]?.fechamento ?? 3,
    };
  });
  prazosSemanais.value = prazosTemp;
};

watch(
  competencia,
  (novaCompetencia) => {
    loading.value = true;
    dadosMensaisCarregados.value = false;
    if (unsubMensal) unsubMensal();
    unsubMensal = prazosService.monitorarPrazosDoMes(
      novaCompetencia,
      (dadosDoBanco) => {
        inicializarPrazos(dadosDoBanco || {});
        dadosMensaisCarregados.value = true;
        if (dadosSemanaisCarregados.value) loading.value = false;
      }
    );
  },
  { immediate: true }
);

onMounted(() => {
  unsubSemanal = prazosSemanaisService.monitorarPrazos((dadosDoBanco) => {
    inicializarPrazosSemanais(dadosDoBanco || {});
    dadosSemanaisCarregados.value = true;
    if (dadosMensaisCarregados.value) loading.value = false;
  });
});

const salvarPrazos = async () => {
  try {
    const prazosMensaisParaSalvar = JSON.parse(
      JSON.stringify(prazosMensais.value)
    );
    for (const key in prazosMensaisParaSalvar) {
      if (
        prazosMensaisParaSalvar[key].diaOficial === "" ||
        prazosMensaisParaSalvar[key].diaOficial === null
      ) {
        delete prazosMensaisParaSalvar[key].diaOficial;
      } else {
        prazosMensaisParaSalvar[key].diaOficial = Number(
          prazosMensaisParaSalvar[key].diaOficial
        );
      }
    }
    await prazosService.salvarPrazosDoMes(
      competencia.value,
      prazosMensaisParaSalvar
    );
    await prazosSemanaisService.salvarPrazos(prazosSemanais.value);
    notificationStore.showNotification("Prazos salvos com sucesso!", "success");
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar os prazos.", "error");
    console.error(error);
  }
};

onUnmounted(() => {
  if (unsubMensal) unsubMensal();
  if (unsubSemanal) unsubSemanal();
});
</script>

<style lang="scss" scoped>
/* Estilos padronizados */
.prazos-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  h2 {
    margin: 0;
  }
  p {
    margin: 4px 0 0;
    color: #6c757d;
  }
}
.competencia-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  label {
    font-weight: 500;
  }
  input[type="month"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}
.content-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 40px 32px;
}
.grupo-modulo h3 {
  border-bottom: 2px solid #001529;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 1.2rem;
  color: #001529;
}
.modulo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  label {
    font-weight: 500;
    flex-basis: 40%;
    flex-shrink: 0;
  }
}
.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 1;
  input[type="date"] {
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .dia-oficial {
    width: 65px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
  }
  .select-input {
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}
.actions {
  margin-top: 32px;
  text-align: right;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  &:hover {
    background-color: #0056b3;
  }
}
</style>
