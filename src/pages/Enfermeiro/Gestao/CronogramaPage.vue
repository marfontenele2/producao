<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Cronograma Mensal da Equipe</h2>
        <p>Planeje as atividades da sua equipe para a competência atual.</p>
      </div>
    </header>

    <div class="content-card">
      <div class="actions-bar">
        <div class="tabs">
          <button
            @click="abaAtiva = 'enfermeiro'"
            :class="{ active: abaAtiva === 'enfermeiro' }"
          >
            Enfermeiro(a)
          </button>
          <button
            @click="abaAtiva = 'medico'"
            :class="{ active: abaAtiva === 'medico' }"
          >
            Médico(a)
          </button>
          <button
            @click="abaAtiva = 'tecnico'"
            :class="{ active: abaAtiva === 'tecnico' }"
          >
            Técnico(a)
          </button>
        </div>
        <div class="buttons">
          <div class="view-toggle">
            <button
              @click="viewMode = 'lista'"
              :class="{ active: viewMode === 'lista' }"
            >
              <List :size="18" /> Lista
            </button>
            <button
              @click="viewMode = 'calendario'"
              :class="{ active: viewMode === 'calendario' }"
            >
              <Calendar :size="18" /> Calendário
            </button>
          </div>
          <button class="btn-primary" @click="abrirFormulario()">
            <PlusCircle :size="18" /> Adicionar Atividade
          </button>
          <button class="btn-secondary" @click="imprimir">
            <Printer :size="18" /> Imprimir Cronograma
          </button>
        </div>
      </div>

      <BaseSpinner v-if="carregando" />

      <template v-else>
        <div class="table-container" v-if="viewMode === 'lista'">
          <table v-if="eventosFiltrados.length > 0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Turno</th>
                <th>Atividade/Ação</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="evento in eventosFiltrados" :key="evento.id">
                <td>
                  {{ formatarData(evento.data) }}
                  <span v-if="evento.recorrenciaId" class="recorrente-tag"
                    >(R)</span
                  >
                </td>
                <td>{{ evento.turno }}</td>
                <td>{{ evento.atividade }}</td>
                <td>{{ getNomeProfissional(evento.responsavelId) }}</td>
                <td class="acoes-cell">
                  <button @click="abrirFormulario(evento)" class="icon-button">
                    <FilePenLine :size="18" />
                  </button>
                  <button
                    @click="handleExcluir(evento)"
                    class="icon-button danger"
                  >
                    <Trash2 :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-message">Nenhuma atividade planejada.</p>
        </div>

        <CronogramaCalendarView
          v-if="viewMode === 'calendario'"
          :eventos="eventosFiltrados"
          :competencia="competencia"
        />
      </template>
    </div>

    <transition name="fade">
      <div
        v-if="exibirFormulario"
        class="modal-backdrop"
        @click="fecharFormulario"
      >
        <div class="modal-content" @click.stop>
          <h3>
            {{ eventoEmEdicao.id ? "Editar Atividade" : "Adicionar Atividade" }}
          </h3>
          <form @submit.prevent="handleSalvar">
            <div class="form-group">
              <label for="atividade">Atividade/Ação</label>
              <input
                type="text"
                id="atividade"
                v-model="eventoEmEdicao.atividade"
                required
              />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label for="turno">Turno</label>
                <select id="turno" v-model="eventoEmEdicao.turno" required>
                  <option>Manhã</option>
                  <option>Tarde</option>
                  <option>Ambos</option>
                </select>
              </div>
              <div class="form-group">
                <label for="responsavel">Responsável</label>
                <select id="responsavel" v-model="eventoEmEdicao.responsavelId">
                  <option :value="null">Nenhum</option>
                  <option
                    v-for="p in profissionaisScnes"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.nome }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group checkbox">
              <input
                type="checkbox"
                id="recorrente"
                v-model="eventoEmEdicao.recorrente"
              />
              <label for="recorrente">Atividade Recorrente Semanal</label>
            </div>
            <template v-if="eventoEmEdicao.recorrente">
              <div class="form-grid">
                <div class="form-group">
                  <label for="diaSemana">Dia da Semana</label>
                  <select id="diaSemana" v-model="eventoEmEdicao.diaSemana">
                    <option :value="0">Domingo</option>
                    <option :value="1">Segunda</option>
                    <option :value="2">Terça</option>
                    <option :value="3">Quarta</option>
                    <option :value="4">Quinta</option>
                    <option :value="5">Sexta</option>
                    <option :value="6">Sábado</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Mês de Referência</label>
                  <input type="month" :value="competencia" disabled />
                </div>
              </div>
            </template>
            <div class="form-group" v-else>
              <label for="data">Data</label>
              <input
                type="date"
                id="data"
                v-model="eventoEmEdicao.data"
                required
              />
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="fecharFormulario"
              >
                Cancelar
              </button>
              <button type="submit" class="btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { cronogramaService } from "@/services/cronogramaService";
import { scnesService } from "@/services/scnesService";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import CronogramaCalendarView from "@/components/enfermeiro/CronogramaCalendarView.vue";
import {
  PlusCircle,
  Printer,
  FilePenLine,
  Trash2,
  List,
  Calendar,
} from "lucide-vue-next";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const carregando = ref(true);
const exibirFormulario = ref(false);
const abaAtiva = ref("enfermeiro");
const viewMode = ref("lista");
const cronogramaData = ref({
  eventosEnfermeiro: [],
  eventosMedico: [],
  eventosTecnico: [],
});
const profissionaisScnes = ref([]);
let unsubCronograma = null;
const eventoEmEdicao = ref({});

const competencia = getCompetenciaAtual();
const documentoId = computed(
  () => `${competencia}_${userStore.user?.equipeId}`
);

const eventosFiltrados = computed(() => {
  const key = `eventos${
    abaAtiva.value.charAt(0).toUpperCase() + abaAtiva.value.slice(1)
  }`;
  return (cronogramaData.value[key] || [])
    .slice()
    .sort((a, b) => a.data.seconds - b.data.seconds);
});

const getNomeProfissional = (id) =>
  profissionaisScnes.value.find((p) => p.id === id)?.nome || "N/D";

const formatarData = (timestamp) => {
  if (!timestamp?.seconds) return "Data inválida";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR");
};

const abrirFormulario = (evento = null) => {
  if (evento) {
    const dataFormatada = evento.data?.seconds
      ? new Date(evento.data.seconds * 1000).toISOString().split("T")[0]
      : "";
    eventoEmEdicao.value = { ...evento, data: dataFormatada };
  } else {
    eventoEmEdicao.value = {
      data: "",
      turno: "Manhã",
      atividade: "",
      responsavelId: null,
      recorrente: false,
      diaSemana: 1,
    };
  }
  exibirFormulario.value = true;
};

const fecharFormulario = () => {
  exibirFormulario.value = false;
  eventoEmEdicao.value = {};
};

const handleSalvar = async () => {
  const { equipeId, ubsId } = userStore.user;
  const key = `eventos${
    abaAtiva.value.charAt(0).toUpperCase() + abaAtiva.value.slice(1)
  }`;
  let listaEventos = [...(cronogramaData.value[key] || [])];
  const dadosDoForm = eventoEmEdicao.value;

  try {
    if (dadosDoForm.recorrente) {
      const recorrenciaId = dadosDoForm.recorrenciaId || uuidv4();
      const [ano, mes] = competencia.split("-").map(Number);
      const diasNoMes = new Date(ano, mes, 0).getDate();

      listaEventos = listaEventos.filter(
        (e) => e.recorrenciaId !== recorrenciaId
      );

      for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtual = new Date(ano, mes - 1, dia);
        if (dataAtual.getDay() === parseInt(dadosDoForm.diaSemana, 10)) {
          listaEventos.push({
            id: uuidv4(),
            recorrenciaId: recorrenciaId,
            atividade: dadosDoForm.atividade,
            turno: dadosDoForm.turno,
            responsavelId: dadosDoForm.responsavelId,
            data: dataAtual,
          });
        }
      }
    } else {
      const eventoFinal = {
        ...dadosDoForm,
        data: new Date(dadosDoForm.data + "T03:00:00Z"),
      };
      if (eventoFinal.id) {
        const index = listaEventos.findIndex((e) => e.id === eventoFinal.id);
        if (index !== -1) listaEventos[index] = eventoFinal;
      } else {
        listaEventos.push({ ...eventoFinal, id: uuidv4() });
      }
    }

    const dadosParaSalvar = { ...cronogramaData.value, [key]: listaEventos };
    await cronogramaService.salvarCronograma(
      documentoId.value,
      dadosParaSalvar,
      equipeId,
      ubsId
    );
    notificationStore.showNotification(
      "Atividade salva com sucesso!",
      "success"
    );
    fecharFormulario();
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar atividade.", "error");
    console.error(error);
  }
};

const handleExcluir = async (evento) => {
  const { equipeId, ubsId } = userStore.user;
  const key = `eventos${
    abaAtiva.value.charAt(0).toUpperCase() + abaAtiva.value.slice(1)
  }`;
  let listaEventos = [...(cronogramaData.value[key] || [])];
  let confirmar = false;

  if (evento.recorrenciaId) {
    const resp = prompt(
      "Este é um evento recorrente. Deseja excluir (1) Apenas esta ocorrência ou (2) Todas as ocorrências?"
    );
    if (resp === "1") {
      listaEventos = listaEventos.filter((e) => e.id !== evento.id);
      confirmar = true;
    } else if (resp === "2") {
      listaEventos = listaEventos.filter(
        (e) => e.recorrenciaId !== evento.recorrenciaId
      );
      confirmar = true;
    }
  } else {
    confirmar = confirm("Tem certeza que deseja excluir esta atividade?");
    if (confirmar) {
      listaEventos = listaEventos.filter((e) => e.id !== evento.id);
    }
  }

  if (confirmar) {
    const dadosParaSalvar = { ...cronogramaData.value, [key]: listaEventos };
    try {
      await cronogramaService.salvarCronograma(
        documentoId.value,
        dadosParaSalvar,
        equipeId,
        ubsId
      );
      notificationStore.showNotification(
        "Atividade(s) excluída(s).",
        "success"
      );
    } catch (error) {
      notificationStore.showNotification("Erro ao excluir atividade.", "error");
    }
  }
};

const imprimir = () => {
  const { equipeId, ubsId } = userStore.user;
  router.push({
    name: "CronogramaPrint",
    params: { competencia, equipeId, ubsId },
  });
};

onMounted(async () => {
  if (userStore.user?.equipeId) {
    carregando.value = true;
    unsubCronograma = cronogramaService.monitorarCronograma(
      documentoId.value,
      (data) => {
        cronogramaData.value = data;
        carregando.value = false;
      }
    );
    profissionaisScnes.value = await scnesService.getProfissionais(
      documentoId.value
    );
  } else {
    carregando.value = false;
  }
});

onUnmounted(() => {
  if (unsubCronograma) unsubCronograma();
});
</script>

<style lang="scss" scoped>
/* Estilos mantendo o padrão do projeto, com adições para o modal e toggle */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header h2 {
  margin: 0;
}
.page-header p {
  margin: 4px 0 0;
  color: #6c757d;
}
.content-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.tabs {
  display: flex;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tabs button.active {
  border-bottom-color: #1890ff;
  color: #1890ff;
  font-weight: 600;
}
.buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}
.view-toggle {
  display: flex;
  background-color: #f0f2f5;
  border-radius: 6px;
  padding: 4px;
  button {
    padding: 6px 12px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    &.active {
      background-color: #fff;
      color: #1890ff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
}
.btn-primary {
  background-color: #001529;
  color: white;
  border-color: #001529;
}
.btn-secondary {
  background-color: #f0f2f5;
  color: #333;
  border-color: #ccc;
}
.table-container {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}
th {
  background-color: #f8f9fa;
}
.acoes-cell {
  display: flex;
  gap: 10px;
}
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  &.danger {
    color: #dc3545;
  }
}
.empty-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
.recorrente-tag {
  font-size: 0.7em;
  color: #888;
  font-weight: bold;
}

/* Estilos do Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-content h3 {
  margin-top: 0;
}
form {
  margin-top: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  label {
    margin-bottom: 6px;
    font-weight: 500;
  }
  input,
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  &.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    input {
      width: auto;
    }
  }
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
