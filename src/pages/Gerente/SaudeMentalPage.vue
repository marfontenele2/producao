<template>
  <div class="saude-mental-page">
    <div class="card">
      <div class="card-header">
        <div class="header-content">
          <div class="selectors">
            <div class="form-group">
              <label for="competencia">Competência:</label>
              <input type="month" id="competencia" v-model="competencia" />
            </div>
            <div class="form-group">
              <label for="equipe">Equipe:</label>
              <select id="equipe" v-model="equipeIdSelecionada">
                <option value="">Selecione uma equipe</option>
                <option
                  v-for="equipe in listaEquipes"
                  :key="equipe.id"
                  :value="equipe.id"
                >
                  {{ equipe.nome }}
                </option>
              </select>
            </div>
          </div>
          <div class="actions-group">
            <button
              @click="handleImprimir"
              class="btn btn-print"
              :disabled="!equipeIdSelecionada || pacientes.length === 0"
            >
              <Printer :size="18" />
              Imprimir
            </button>
            <button
              @click="abrirFormulario(null)"
              class="btn btn-add"
              :disabled="!equipeIdSelecionada"
            >
              <UserPlus :size="18" />
              Adicionar Paciente
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <BaseSpinner v-if="carregando" text="Carregando pacientes..." />
        <PacienteList
          v-else-if="equipeIdSelecionada"
          :pacientes="pacientes"
          :acompanhamentos="acompanhamentos"
          @update:acompanhamento="handleUpdateAcompanhamento"
          @edit="iniciarEdicao"
          @delete="handleDelete"
        />
        <div v-else class="state-message">
          <p>Selecione uma equipe para visualizar os pacientes.</p>
        </div>
      </div>
    </div>

    <PacienteForm
      v-if="exibirFormulario"
      :paciente-para-editar="pacienteSelecionado"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { equipesService } from "@/services/equipesService";
import { saudeMentalService } from "@/services/saudeMentalService";
import { errorService } from "@/services/errorService";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import { debounce } from "lodash-es";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import PacienteList from "@/components/gerente/PacienteList.vue";
import PacienteForm from "@/components/gerente/PacienteForm.vue";
import { UserPlus, Printer } from "lucide-vue-next";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const carregando = ref(true);
const listaEquipes = ref([]);
const equipeIdSelecionada = ref("");
const competencia = ref(getCompetenciaAtual());

const pacientes = ref([]);
const acompanhamentos = ref({});
const exibirFormulario = ref(false);
const pacienteSelecionado = ref(null);

let unsubPacientes = null;
let unsubAcompanhamentos = null;

const documentoIdAcompanhamento = computed(() => {
  if (competencia.value && equipeIdSelecionada.value) {
    return `${competencia.value}_${equipeIdSelecionada.value}`;
  }
  return null;
});

onMounted(async () => {
  if (userStore.user?.ubsId) {
    listaEquipes.value = await equipesService.getEquipesByUbs(
      userStore.user.ubsId
    );
    carregando.value = false;
  }
});

watch(equipeIdSelecionada, (novoId) => {
  if (unsubPacientes) unsubPacientes();
  carregando.value = true;
  if (novoId) {
    unsubPacientes = saudeMentalService.monitorarPacientes(novoId, (lista) => {
      pacientes.value = lista;
      carregando.value = false;
    });
  } else {
    pacientes.value = [];
    carregando.value = false;
  }
});

watch(documentoIdAcompanhamento, (novoId) => {
  if (unsubAcompanhamentos) unsubAcompanhamentos();
  if (novoId) {
    unsubAcompanhamentos = saudeMentalService.monitorarAcompanhamentos(
      novoId,
      (dados) => {
        acompanhamentos.value = dados;
      }
    );
  } else {
    acompanhamentos.value = {};
  }
});

onUnmounted(() => {
  if (unsubPacientes) unsubPacientes();
  if (unsubAcompanhamentos) unsubAcompanhamentos();
});

const handleUpdateAcompanhamento = ({ pacienteId, campo, valor }) => {
  if (!acompanhamentos.value[pacienteId]) {
    acompanhamentos.value[pacienteId] = {};
  }
  acompanhamentos.value[pacienteId][campo] = valor;
  debouncedSave();
};

const debouncedSave = debounce(() => {
  saudeMentalService.salvarAcompanhamentos(
    documentoIdAcompanhamento.value,
    acompanhamentos.value,
    equipeIdSelecionada.value,
    userStore.user.ubsId
  );
}, 1000);

const fecharFormulario = () => {
  exibirFormulario.value = false;
  pacienteSelecionado.value = null;
};

const abrirFormulario = (paciente = null) => {
  pacienteSelecionado.value = paciente ? { ...paciente } : null;
  exibirFormulario.value = true;
};

const iniciarEdicao = (paciente) => abrirFormulario(paciente);

const handleSalvar = async (pacienteData) => {
  try {
    if (pacienteData.id) {
      // A lógica de atualização de um paciente na lista persistente precisaria
      // de uma função `atualizarPaciente` no service. Por agora, vamos focar na adição.
      // await saudeMentalService.atualizarPaciente(equipeIdSelecionada.value, pacienteData.id, pacienteData);
      notificationStore.showNotification(
        "Lógica de edição a ser implementada.",
        "warning"
      );
    } else {
      await saudeMentalService.adicionarPaciente(
        equipeIdSelecionada.value,
        pacienteData
      );
      notificationStore.showNotification(
        "Paciente adicionado com sucesso!",
        "success"
      );
    }
    fecharFormulario();
  } catch (error) {
    errorService.handle(error, "Erro ao salvar paciente.");
  }
};

const handleDelete = async (pacienteId) => {
  if (
    window.confirm(
      "Isso removerá o paciente permanentemente da lista. Deseja continuar?"
    )
  ) {
    try {
      await saudeMentalService.removerPaciente(
        equipeIdSelecionada.value,
        pacienteId
      );
      notificationStore.showNotification(
        "Paciente removido com sucesso.",
        "success"
      );
    } catch (error) {
      errorService.handle(error, "Erro ao remover paciente.");
    }
  }
};

// ... dentro do <script setup> de SaudeMentalPage.vue ...

const handleImprimir = () => {
  router.push({
    name: "SaudeMentalPrint", // O nome da rota permanece o mesmo
    params: {
      competencia: competencia.value,
      ubsId: userStore.user.ubsId,
      equipeId: equipeIdSelecionada.value,
    },
  });
};
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
  flex-wrap: wrap;
  gap: 1.5rem;
}
.selectors {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #555;
}
.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.actions-group {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.btn-add {
  background-color: #28a745;
  &:hover:not(:disabled) {
    background-color: #218838;
  }
}
.btn-print {
  background-color: #6c757d;
  &:hover:not(:disabled) {
    background-color: #5a6268;
  }
}
.card-body {
  padding: 24px;
}
.state-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>
