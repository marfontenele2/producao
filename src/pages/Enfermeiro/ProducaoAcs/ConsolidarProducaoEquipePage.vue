<template>
  <div class="pagina-container">
    <div class="card">
      <div class="card-header">
        <h1>Consolidar Produção da Equipe</h1>
        <p>Competência: {{ competencia }}</p>
      </div>
      <div class="card-body">
        <BaseSpinner
          v-if="carregando"
          text="Verificando status dos profissionais..."
        />
        <div v-else>
          <ul class="lista-status-acs">
            <li v-for="acs in statusProfissionais" :key="acs.id">
              <span class="nome-acs">{{ acs.nome }}</span>
              <StatusBadge :status="acs.status" />
            </li>
          </ul>
          <div v-if="statusProfissionais.length === 0" class="aviso">
            Nenhum profissional ACS encontrado para esta equipe na competência.
          </div>
          <div class="actions">
            <button
              @click="consolidar"
              :disabled="!podeConsolidar"
              class="btn btn-finalize"
            >
              {{
                podeConsolidar
                  ? "Consolidar e Entregar para Gerência"
                  : "Aguardando finalização de todos os ACS"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { producaoAcsServico } from "@/services/producaoAcsServico.js";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import StatusBadge from "@/components/shared/StatusBadge.vue";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const carregando = ref(true);
const statusProfissionais = ref([]);
const producoesIndividuais = ref([]);
const competencia = getCompetenciaAtual();

const podeConsolidar = computed(() => {
  if (statusProfissionais.value.length === 0) return false;
  return statusProfissionais.value.every(
    (p) => p.status.texto === "Finalizado"
  );
});

onMounted(async () => {
  const equipeId = userStore.user.equipeId;
  try {
    const [profissionais, producoes] = await Promise.all([
      producaoAcsServico.buscarProfissionaisAcsDaEquipe(competencia, equipeId),
      producaoAcsServico.buscarProducoesDaEquipe(competencia, equipeId),
    ]);

    producoesIndividuais.value = producoes;
    const producoesFinalizadas = new Set(
      producoes.filter((p) => p.finalizado).map((p) => p.acsId)
    );

    statusProfissionais.value = profissionais.map((p) => ({
      ...p,
      status: producoesFinalizadas.has(p.id)
        ? { texto: "Finalizado", cor: "#28a745" }
        : { texto: "Pendente", cor: "#ffc107" },
    }));
  } catch (e) {
    notificationStore.showNotification(
      "Erro ao carregar status da equipe.",
      "error"
    );
  } finally {
    carregando.value = false;
  }
});

async function consolidar() {
  if (!podeConsolidar.value) return;
  if (
    confirm(
      "Após consolidar, a produção será enviada para o gerente e não poderá mais ser editada. Confirma?"
    )
  ) {
    try {
      await producaoAcsServico.consolidarProducaoEquipe(
        competencia,
        userStore.user.equipeId,
        userStore.user.ubsId,
        producoesIndividuais.value
      );
      notificationStore.showNotification(
        "Produção consolidada com sucesso!",
        "success"
      );
      router.push({ name: "EnfermeiroDashboard" });
    } catch (e) {
      notificationStore.showNotification(
        "Erro ao consolidar produção.",
        "error"
      );
    }
  }
}
</script>

<style lang="scss" scoped>
.pagina-container,
.card,
.card-header,
.card-body,
.actions {
  text-align: center;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.card-header h1,
.card-header p {
  margin: 0;
}
.card-body {
  padding: 24px;
}
.lista-status-acs {
  list-style: none;
  padding: 0;
  max-width: 500px;
  margin: 0 auto 2rem auto;
}
.lista-status-acs li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.nome-acs {
  font-weight: 500;
}
.aviso {
  color: #6c757d;
  font-style: italic;
}
.btn-finalize {
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-finalize:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
