<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>
          Boletim de Testes Rápidos - {{ formatarCompetencia(competencia) }}
        </h2>
        <p>
          Selecione um teste para iniciar o preenchimento do boletim mensal.
        </p>
      </div>
      <button
        @click="handleFinalizarMes"
        :disabled="!podeFinalizar"
        class="finalize-button"
        :title="
          podeFinalizar
            ? 'Finalizar e entregar o boletim do mês'
            : 'Preencha todas as marcas de todos os testes para poder finalizar.'
        "
      >
        <CheckCircle2 :size="18" />
        Finalizar e Entregar Boletim
      </button>
    </header>

    <div class="content-card">
      <BaseSpinner v-if="carregando" />
      <div v-else-if="testesLiberados.length > 0" class="testes-grid">
        <router-link
          v-for="teste in testesLiberados"
          :key="teste.id"
          :to="{ name: 'PreencherBoletim', params: { testeId: teste.id } }"
          class="teste-card"
        >
          <div class="teste-icon"><FlaskConical :size="32" /></div>
          <div class="teste-info">
            <h3>{{ teste.nome }}</h3>
            <span class="status-badge" :class="getStatus(teste.id).classe">
              {{ getStatus(teste.id).texto }}
            </span>
          </div>
          <ChevronRight :size="20" class="arrow-icon" />
        </router-link>
      </div>
      <p v-else class="empty-message">
        Nenhum boletim liberado para a competência atual.
      </p>
    </div>
  </div>
</template>

<script setup>
// O SCRIPT NÃO MUDA
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { getCompetenciaAtual, formatarCompetencia } from "@/utils/dateUtils";
import { boletimProfissionalService } from "@/services/boletimProfissionalService";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { FlaskConical, ChevronRight, CheckCircle2 } from "lucide-vue-next";

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const carregando = ref(true);
const testesLiberados = ref([]);
const dadosSalvos = ref({});
let unsubBoletim = null;
const competencia = getCompetenciaAtual();
const documentoId = `${competencia}_${userStore.user?.equipeId}`;

const getStatus = (testeId) => {
  const testeLiberado = testesLiberados.value.find((t) => t.id === testeId);
  if (!testeLiberado || testeLiberado.marcas.length === 0)
    return { texto: "Indisponível", classe: "pendente" };

  const marcasLiberadas = testeLiberado.marcas.length;
  const marcasPreenchidas = Object.keys(
    dadosSalvos.value.testes?.[testeId] || {}
  ).length;

  if (dadosSalvos.value.finalizado)
    return { texto: "Entregue", classe: "entregue" };
  if (dadosSalvos.value.finalizados?.[testeId])
    return { texto: "Finalizado", classe: "concluido" };
  if (marcasPreenchidas === 0) return { texto: "Pendente", classe: "pendente" };
  if (marcasPreenchidas < marcasLiberadas)
    return { texto: "Preenchimento Parcial", classe: "parcial" };
  return { texto: "Concluído", classe: "concluido" };
};

const podeFinalizar = computed(() => {
  if (testesLiberados.value.length === 0) return false;
  if (dadosSalvos.value.finalizado) return false;

  return testesLiberados.value.every((teste) => {
    const marcasLiberadasCount = teste.marcas.length;
    const marcasPreenchidasCount = Object.keys(
      dadosSalvos.value.testes?.[teste.id] || {}
    ).length;
    return (
      marcasLiberadasCount > 0 &&
      marcasLiberadasCount === marcasPreenchidasCount
    );
  });
});

async function handleFinalizarMes() {
  if (!podeFinalizar.value) {
    notificationStore.showNotification(
      "Ainda há testes ou marcas pendentes de preenchimento.",
      "warning"
    );
    return;
  }
  if (
    window.confirm(
      "Após finalizar, não será mais possível editar o boletim desta competência. Deseja continuar?"
    )
  ) {
    try {
      await boletimProfissionalService.finalizarBoletim(documentoId);
      notificationStore.showNotification(
        "Boletim finalizado e entregue com sucesso!",
        "success"
      );
    } catch (error) {
      notificationStore.showNotification(
        "Erro ao finalizar o boletim.",
        "error"
      );
    }
  }
}

onMounted(async () => {
  try {
    testesLiberados.value = await boletimProfissionalService.getTestesLiberados(
      competencia
    );
    unsubBoletim = boletimProfissionalService.monitorarBoletimEquipe(
      documentoId,
      (data) => {
        dadosSalvos.value = data || {};
      }
    );
  } catch (error) {
    console.error("Erro ao carregar boletins liberados:", error);
  } finally {
    carregando.value = false;
  }
});

onUnmounted(() => {
  if (unsubBoletim) unsubBoletim();
});
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
  }
  p {
    margin: 4px 0 0;
    color: #6c757d;
  }
}
.content-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
}
.testes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.teste-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }
}
.teste-icon {
  color: #1890ff;
  background-color: #e6f7ff;
  padding: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.teste-info {
  flex-grow: 1;
}
.teste-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}
.status-badge.pendente {
  background-color: #ffc107;
  color: #212529;
}
.status-badge.parcial {
  background-color: #17a2b8;
}
.status-badge.concluido,
.status-badge.entregue {
  background-color: #28a745;
}
.arrow-icon {
  color: #adb5bd;
  transition: transform 0.2s;
}
.teste-card:hover .arrow-icon {
  transform: translateX(5px);
}
.empty-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

/* ✅ BOTÃO COM ESTILO PADRÃO */
.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
  }
}
</style>
