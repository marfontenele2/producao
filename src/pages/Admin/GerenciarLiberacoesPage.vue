// ARQUIVO REATORADO: src/pages/Admin/GerenciarLiberacoesPage.vue
<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Liberar Boletins por Competência</h2>
        <p>
          Selecione o mês e defina quais testes e marcas estarão disponíveis
          para preenchimento.
        </p>
      </div>
    </header>

    <div class="content-card">
      <div class="controls-bar">
        <div class="form-group">
          <label for="competencia">Competência</label>
          <input type="month" id="competencia" v-model="competencia" />
        </div>
        <button
          class="btn-primary"
          @click="salvarLiberacao"
          :disabled="carregando"
        >
          <Save :size="18" /> Salvar Liberação
        </button>
      </div>

      <BaseSpinner v-if="carregando" />
      <div v-else class="testes-container">
        <div v-for="teste in todosTestes" :key="teste.id" class="teste-group">
          <h4>{{ teste.nome }}</h4>
          <div
            v-if="teste.marcas && teste.marcas.length > 0"
            class="marcas-grid"
          >
            <div
              v-for="marca in teste.marcas"
              :key="marca.id"
              class="marca-checkbox"
            >
              <input
                type="checkbox"
                :id="`${teste.id}-${marca.id}`"
                :value="marca.id"
                v-model="liberacaoAtual.testesLiberados[teste.id]"
              />
              <label :for="`${teste.id}-${marca.id}`">{{ marca.nome }}</label>
            </div>
          </div>
          <p v-else class="empty-message small">
            Nenhuma marca cadastrada. Adicione em "Boletim: Testes e Marcas".
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useNotificationStore } from "@/store/notificationStore";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import { testesService } from "@/services/testesService";
import { boletimAdminService } from "@/services/boletimAdminService";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Save } from "lucide-vue-next";

const notificationStore = useNotificationStore();
const carregando = ref(true);
const todosTestes = ref([]);
const competencia = ref(getCompetenciaAtual());
const liberacaoAtual = ref({ testesLiberados: {} });
let unsubTestes = null;

// ✅ CORREÇÃO: Lógica simplificada para busca única de dados
const carregarDados = async (comp) => {
  carregando.value = true;
  try {
    const data = await boletimAdminService.getLiberacao(comp);
    const testesLiberadosRemotos = data?.testesLiberados || {};
    const novaEstrutura = {};
    todosTestes.value.forEach((teste) => {
      novaEstrutura[teste.id] = testesLiberadosRemotos[teste.id] || [];
    });
    liberacaoAtual.value = { testesLiberados: novaEstrutura };
  } catch (error) {
    console.error("Erro ao carregar dados de liberação:", error);
    notificationStore.showNotification("Falha ao carregar dados.", "error");
  } finally {
    carregando.value = false;
  }
};

const salvarLiberacao = async () => {
  carregando.value = true;
  try {
    await boletimAdminService.salvarLiberacao(
      competencia.value,
      liberacaoAtual.value
    );
    notificationStore.showNotification(
      "Liberação salva com sucesso!",
      "success"
    );
    // Recarrega os dados para confirmar o salvamento
    await carregarDados(competencia.value);
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar liberação.", "error");
    console.error(error);
  } finally {
    carregando.value = false;
  }
};

watch(competencia, (novaCompetencia) => {
  if (todosTestes.value.length > 0) {
    carregarDados(novaCompetencia);
  }
});

onMounted(() => {
  unsubTestes = testesService.monitorarTestes(async (data) => {
    todosTestes.value = data;
    await carregarDados(competencia.value);
  });
});

onUnmounted(() => {
  if (unsubTestes) unsubTestes();
});
</script>

<style lang="scss" scoped>
/* Estilos permanecem os mesmos */
.page-container {
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
.content-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #dee2e6;
}
.form-group {
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
  input[type="month"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
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
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
.testes-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.teste-group h4 {
  margin-top: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  font-size: 1.1rem;
}
.marcas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.marca-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  label {
    user-select: none;
  }
}
.empty-message.small {
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}
</style>
