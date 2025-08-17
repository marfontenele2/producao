<template>
  <div class="scnes-page">
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
              @click="handleFinalizarMes"
              class="btn btn-finalize"
              :disabled="!documentoId || !statusDaProducao.editavel"
            >
              <CheckCircle :size="18" />
              Finalizar Mês
            </button>
            <button
              @click="imprimirLista"
              class="btn btn-print"
              :disabled="!documentoId || listaProfissionais.length === 0"
            >
              <Printer :size="18" />
              Imprimir
            </button>
            <button
              @click="iniciarAdicao"
              class="btn btn-add"
              :disabled="!documentoId || !statusDaProducao.editavel"
            >
              <UserPlus :size="18" />
              Adicionar Profissional
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div v-if="!statusDaProducao.editavel" class="finalizado-message">
          Esta lista de profissionais foi finalizada e não pode mais ser
          alterada.
        </div>

        <CopiaMesAnteriorCard
          v-if="sugestaoCopia.visivel"
          :count="sugestaoCopia.total"
          @copy="copiarMesAnterior"
          @dismiss="rejeitarSugestao"
        />

        <ProfissionalList
          v-if="documentoId"
          :lista-profissionais="listaProfissionais"
          :carregando="carregando"
          :edicao-habilitada="statusDaProducao.editavel"
          @editar="iniciarEdicao"
          @excluir="handleExcluir"
        />
        <div v-else class="state-message">
          <p>
            Selecione uma competência e uma equipe para gerenciar os
            profissionais.
          </p>
        </div>
      </div>
    </div>

    <ProfissionalForm
      v-if="exibirFormulario"
      :profissional-para-editar="profissionalSelecionado"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { equipesService } from "@/services/equipesService";
import { scnesService } from "@/services/scnesService";
import { errorService } from "@/services/errorService";
import { getCompetenciaAnterior, getCompetenciaAtual } from "@/utils/dateUtils";
import CopiaMesAnteriorCard from "@/components/gerente/CopiaMesAnteriorCard.vue";
import ProfissionalForm from "@/components/gerente/ProfissionalForm.vue";
import ProfissionalList from "@/components/gerente/ProfissionalList.vue";
import { UserPlus, Printer, CheckCircle } from "lucide-vue-next";

// --- Estado do componente ---
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const competencia = ref(getCompetenciaAtual());
const listaEquipes = ref([]);
const equipeIdSelecionada = ref("");
const listaProfissionais = ref([]);
const carregando = ref(true);
const exibirFormulario = ref(false);
const profissionalSelecionado = ref(null);
const isFinalizado = ref(false);
let unsubProfissionais = null;

const sugestaoCopia = reactive({
  visivel: false,
  total: 0,
  dados: [],
  verificado: false,
});

// --- Lógica principal ---
const documentoId = computed(() => {
  if (competencia.value && equipeIdSelecionada.value) {
    return `${competencia.value}_${equipeIdSelecionada.value}`;
  }
  return null;
});

const statusDaProducao = computed(() => {
  const producaoEntregue = listaProfissionais.value.length > 0;

  if (isFinalizado.value) {
    return {
      texto: "FECHADO",
      cor: "#6c757d",
      editavel: false,
    };
  }

  if (producaoEntregue) {
    return {
      texto: "ENTREGUE",
      cor: "#28a745",
      editavel: true,
    };
  }

  return {
    texto: "ABERTO",
    cor: "#17a2b8",
    editavel: true,
  };
});

onMounted(async () => {
  if (userStore.user?.ubsId) {
    listaEquipes.value = await equipesService.getEquipesByUbs(
      userStore.user.ubsId
    );
  }
});

watch(documentoId, (novoId) => {
  if (unsubProfissionais) unsubProfissionais();

  sugestaoCopia.visivel = false;
  sugestaoCopia.verificado = false;
  carregando.value = true;

  if (novoId) {
    unsubProfissionais = scnesService.monitorarProfissionais(novoId, (data) => {
      listaProfissionais.value = data.profissionais || [];
      isFinalizado.value = !!data.finalizado;
      carregando.value = false;

      if (
        listaProfissionais.value.length === 0 &&
        !isFinalizado.value &&
        !sugestaoCopia.verificado
      ) {
        verificarMesAnterior();
      }
    });
  } else {
    carregando.value = false;
  }
});

onUnmounted(() => {
  if (unsubProfissionais) unsubProfissionais();
});

async function verificarMesAnterior() {
  sugestaoCopia.verificado = true;
  const competenciaAnterior = getCompetenciaAnterior(competencia.value);
  const docIdAnterior = `${competenciaAnterior}_${equipeIdSelecionada.value}`;

  try {
    const listaAnterior = await scnesService.getProfissionais(docIdAnterior);
    if (listaAnterior.length > 0) {
      sugestaoCopia.dados = listaAnterior;
      sugestaoCopia.total = listaAnterior.length;
      sugestaoCopia.visivel = true;
    }
  } catch (error) {
    console.error("Não foi possível verificar o mês anterior.", error);
  }
}

const copiarMesAnterior = async () => {
  try {
    if (sugestaoCopia.dados.length > 0) {
      // ✅ CORREÇÃO do 'no-unused-vars': a variável 'listaParaCopiar' foi removida
      // pois não era necessária; o serviço agora garante a remoção de IDs.
      await scnesService.salvarProfissionais(
        documentoId.value,
        sugestaoCopia.dados,
        equipeIdSelecionada.value,
        userStore.user.ubsId
      );
      notificationStore.showNotification(
        `${sugestaoCopia.dados.length} profissionais copiados!`,
        "success"
      );
    } else {
      notificationStore.showNotification(
        "Nenhum profissional encontrado no mês anterior.",
        "warning"
      );
    }
    sugestaoCopia.visivel = false;
  } catch (error) {
    errorService.handle(error, "Erro ao copiar dados.");
  }
};

const rejeitarSugestao = () => {
  sugestaoCopia.visivel = false;
};

const fecharFormulario = () => {
  exibirFormulario.value = false;
  profissionalSelecionado.value = null;
};
const iniciarAdicao = () => {
  profissionalSelecionado.value = null;
  exibirFormulario.value = true;
};
const iniciarEdicao = (prof) => {
  profissionalSelecionado.value = { ...prof };
  exibirFormulario.value = true;
};

const handleSalvar = (profData) => {
  const novaLista = [...listaProfissionais.value];
  if (profData.id) {
    const index = novaLista.findIndex((p) => p.id === profData.id);
    if (index > -1) novaLista[index] = profData;
  } else {
    novaLista.push(profData);
  }
  scnesService
    .salvarProfissionais(
      documentoId.value,
      novaLista,
      equipeIdSelecionada.value,
      userStore.user.ubsId
    )
    .then(() =>
      notificationStore.showNotification(
        "Profissional salvo com sucesso!",
        "success"
      )
    )
    .catch((err) => errorService.handle(err, "Erro ao salvar profissional."));
  fecharFormulario();
};

const handleExcluir = (profId) => {
  if (window.confirm("Tem certeza que deseja remover este profissional?")) {
    const novaLista = listaProfissionais.value.filter((p) => p.id !== profId);
    scnesService
      .salvarProfissionais(
        documentoId.value,
        novaLista,
        equipeIdSelecionada.value,
        userStore.user.ubsId
      )
      .then(() =>
        notificationStore.showNotification(
          "Profissional removido com sucesso!",
          "success"
        )
      )
      .catch((err) =>
        errorService.handle(err, "Erro ao remover profissional.")
      );
  }
};

const handleFinalizarMes = async () => {
  if (window.confirm("Tem certeza? Esta ação não poderá ser desfeita.")) {
    try {
      await scnesService.finalizarMes(documentoId.value);
      notificationStore.showNotification(
        "Mês finalizado com sucesso!",
        "success"
      );
    } catch (error) {
      errorService.handle(error, "Erro ao finalizar o mês.");
    }
  }
};

const imprimirLista = () => {
  router.push({
    name: "ScnesPrint",
    params: {
      competencia: competencia.value,
      ubsId: userStore.user.ubsId,
      equipeId: equipeIdSelecionada.value,
    },
  });
};
</script>

<style lang="scss" scoped>
/* ✅ Bloco de estilo completo e restaurado */
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
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
  flex-wrap: wrap;
}
.form-group {
  display: flex;
  flex-direction: column;
  label {
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 0.9rem;
    color: #555;
  }
  input,
  select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
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
  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
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
.btn-finalize {
  background-color: #007bff;
  &:hover:not(:disabled) {
    background-color: #0056b3;
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
.finalizado-message {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 24px;
  text-align: center;
}
</style>
