<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <button @click="voltarParaHub" class="back-button">
          <ArrowLeft :size="20" /> Voltar
        </button>
        <h1>Notificação e Investigação Semanal</h1>
      </div>
      <div class="competencia-selector">
        <label for="ano">Ano:</label>
        <select id="ano" v-model.number="anoSelecionado">
          <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
            {{ ano }}
          </option>
        </select>
        <label for="semana">Semana Epi.:</label>
        <select id="semana" v-model.number="semanaSelecionada">
          <option
            v-for="semana in calendario"
            :key="semana.week"
            :value="semana.week"
          >
            Semana {{ semana.week }}
          </option>
        </select>
        <span class="date-range">{{ dateRangeDisplay }}</span>
      </div>
    </header>
    <div class="content-card">
      <BaseSpinner v-if="loading" />
      <div v-else>
        <FormularioNotificacao v-model="producao" />

        <div
          class="paralisia-section"
          v-if="producao.paralisiaFlacida === 'sim'"
        >
          <hr />
          <h3>Investigação de Casos de Paralisia Flácida Aguda</h3>
          <TabelaCasosParalisia
            v-model="producao.casosParalisia"
            @adicionar="adicionarCaso"
            @remover="removerCaso"
          />
        </div>

        <div class="actions">
          <button @click="imprimir" class="btn-secondary">
            <Printer :size="18" /> Imprimir
          </button>
          <button @click="salvar" class="btn-primary">
            <Save :size="18" /> Salvar
          </button>
          <button
            @click="finalizar"
            class="btn-success"
            :disabled="producao.finalizado"
          >
            <Check :size="18" /> Finalizar Semana
          </button>
        </div>
        <p v-if="producao.finalizado" class="finalizado-aviso">
          Esta notificação foi finalizada e não pode mais ser editada.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { notificacaoSemanalService } from "@/services/notificacaoSemanalService";
import { useNotificationStore } from "@/store/notificationStore";
import { epidemiologicalWeekUtils } from "@/utils/epidemiologicalWeekUtils.js";
import FormularioNotificacao from "./FormularioNotificacao.vue";
// ✅ CORREÇÃO FINAL: Importando o componente do caminho correto (local)
import TabelaCasosParalisia from "./TabelaCasosParalisia.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Save, Check, Printer, ArrowLeft } from "lucide-vue-next";

// O script lógico permanece o mesmo.
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const loading = ref(true);
const producao = ref({ casosParalisia: [] });
const anoSelecionado = ref(new Date().getFullYear());
const semanaSelecionada = ref(null);
const documentoId = ref("");
const calendario = ref([]);
let unsubscribe = () => {};

const anosDisponiveis = computed(() => {
  const anoAtual = new Date().getFullYear();
  const anos = [];
  for (let i = anoAtual + 10; i >= anoAtual - 2; i--) {
    anos.push(i);
  }
  return anos;
});

const voltarParaHub = () => router.push({ name: "ProducaoSemanal" });
const getDocumentoId = (year, week) =>
  userStore.user?.equipeId
    ? `${year}-W${String(week).padStart(2, "0")}_${userStore.user.equipeId}`
    : null;
const dateRangeDisplay = computed(() => {
  if (!semanaSelecionada.value || !calendario.value.length) return "";
  const semanaInfo = calendario.value.find(
    (s) => s.week === semanaSelecionada.value
  );
  return epidemiologicalWeekUtils.formatDateRange(semanaInfo);
});

const carregarDados = (year, week) => {
  if (unsubscribe) unsubscribe();
  loading.value = true;
  documentoId.value = getDocumentoId(year, week);
  if (!documentoId.value) {
    producao.value = {
      tetanoNeonatal: null,
      paralisiaFlacida: null,
      casosSuspeitosSarampo: null,
      casosParalisia: [],
      finalizado: false,
    };
    loading.value = false;
    return;
  }
  unsubscribe = notificacaoSemanalService.monitorarProducao(
    documentoId.value,
    (dados) => {
      producao.value = dados;
      loading.value = false;
    }
  );
};

watch(anoSelecionado, (novoAno) => {
  calendario.value = epidemiologicalWeekUtils.getCalendar(novoAno);
  semanaSelecionada.value = calendario.value.find(
    (s) => s.week === semanaSelecionada.value
  )
    ? semanaSelecionada.value
    : calendario.value[0]?.week || null;
});

watch(semanaSelecionada, (novaSemana) => {
  if (novaSemana) carregarDados(anoSelecionado.value, novaSemana);
});

onMounted(() => {
  const hoje = new Date();
  anoSelecionado.value = hoje.getFullYear();
  calendario.value = epidemiologicalWeekUtils.getCalendar(anoSelecionado.value);
  const semanaAtualInfo =
    epidemiologicalWeekUtils.getCurrentEpidemiologicalWeek(hoje);
  semanaSelecionada.value = semanaAtualInfo.week;
});

onUnmounted(() => unsubscribe());

const adicionarCaso = () => {
  if (!producao.value.casosParalisia) producao.value.casosParalisia = [];
  producao.value.casosParalisia.push({
    nome: "",
    dataNascimento: "",
    idade: "",
    vacinacao: null,
    notificacaoSinan: null,
    dataInvestigacao: "",
    investigacaoConcluida: null,
  });
};
const removerCaso = (index) => producao.value.casosParalisia.splice(index, 1);

const salvar = async () => {
  try {
    await notificacaoSemanalService.salvarProducao(
      documentoId.value,
      producao.value,
      userStore.user.equipeId,
      userStore.user.ubsId
    );
    notificationStore.showNotification(
      "Notificação salva com sucesso!",
      "success"
    );
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar notificação.", "error");
  }
};

const finalizar = async () => {
  if (confirm("Tem certeza que deseja finalizar esta notificação?")) {
    try {
      await notificacaoSemanalService.finalizarCompetencia(documentoId.value);
      notificationStore.showNotification(
        "Notificação finalizada com sucesso!",
        "success"
      );
    } catch (error) {
      notificationStore.showNotification(
        "Erro ao finalizar notificação.",
        "error"
      );
    }
  }
};

const imprimir = () => {
  const [competencia, equipeId] = documentoId.value.split("_");
  router.push({
    name: "NotificacaoSemanalPrint",
    params: { competencia, equipeId },
  });
};
</script>

<style lang="scss" scoped>
/* Estilos existentes */
.page-container {
  max-width: 1600px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.back-button {
  background: #f0f2f5;
  border: 1px solid #d9d9d9;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #e9ecef;
  }
}
.content-card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.btn-primary,
.btn-success,
.btn-secondary {
  border: none;
  padding: 10px 18px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}
.btn-primary {
  background-color: #007bff;
  &:hover {
    background-color: #0056b3;
  }
}
.btn-success {
  background-color: #28a745;
  &:hover {
    background-color: #218838;
  }
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
  &:hover {
    background-color: #5a6268;
  }
}
.finalizado-aviso {
  margin-top: 1rem;
  text-align: right;
  color: #dc3545;
  font-style: italic;
}
.competencia-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  label {
    font-weight: 500;
  }
  select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .date-range {
    font-style: italic;
    color: #555;
    margin-left: 5px;
  }
}

.paralisia-section {
  margin-top: 2rem;
  h3 {
    margin-bottom: 1rem;
  }
  hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 2rem 0;
  }
}
</style>
