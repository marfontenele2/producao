<template>
  <div class="pagina-container">
    <div class="card-page-header">
      <h1>Validação da Produção de ACS</h1>
      <div class="filtros">
        <div class="form-group">
          <label for="competencia">Competência:</label>
          <input type="month" id="competencia" v-model="competencia" />
        </div>
        <div class="form-group">
          <label for="equipe">Equipe:</label>
          <select id="equipe" v-model="equipeSelecionadaId">
            <option :value="null">Selecione uma equipe</option>
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
    </div>

    <BaseSpinner v-if="carregando" text="Buscando produção..." />
    <div v-else-if="!producaoConsolidada" class="aviso-container">
      <div class="card aviso">
        <p>Selecione uma competência e uma equipe.</p>
        <p>
          A produção só aparecerá aqui após o Enfermeiro Consolidar e Entregar.
        </p>
      </div>
    </div>
    <div v-else class="validacao-wrapper">
      <ListaStatusAcs
        :lista="listaStatusAcs"
        :acs-selecionado-id="acsSelecionado?.acsId"
        @selecionar="selecionarAcs"
      />
      <DetalhesValidacaoAcs
        v-if="acsSelecionado"
        :producao="acsSelecionado"
        :validacaoInicial="
          producaoConsolidada.validacoes?.[acsSelecionado.acsId] || {}
        "
        @salvar-validacao="salvarValidacao"
      />
      <div v-else class="aviso-selecao card">
        <p>
          👈 Selecione um profissional na lista ao lado para ver os detalhes e
          validar.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { equipesService } from "@/services/equipesService";
import { validacaoAcsService } from "@/services/validacaoAcsService.js";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import ListaStatusAcs from "@/components/gerente/validacao/ListaStatusAcs.vue";
import DetalhesValidacaoAcs from "@/components/gerente/validacao/DetalhesValidacaoAcs.vue";

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const carregando = ref(false);
const competencia = ref(getCompetenciaAtual());
const equipeSelecionadaId = ref(null);
const listaEquipes = ref([]);
const producaoConsolidada = ref(null);
const producoesIndividuais = ref([]);
const acsSelecionado = ref(null);

const listaStatusAcs = computed(() => {
  if (!producaoConsolidada.value) return [];

  const todosOsAcs = new Map();
  // Adiciona todos os ACS que têm produção individual
  producoesIndividuais.value.forEach((prod) => {
    if (!todosOsAcs.has(prod.acsId)) {
      todosOsAcs.set(prod.acsId, { id: prod.acsId, nome: prod.acsNome });
    }
  });

  return Array.from(todosOsAcs.values())
    .map((acs) => {
      const validacao = producaoConsolidada.value?.validacoes?.[acs.id];
      let status = { texto: "Aguardando Validação", cor: "#fd7e14" };
      if (validacao?.status === "Validado") {
        status = { texto: "Validado", cor: "#28a745" };
      }
      return { ...acs, status };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));
});

async function carregarDados() {
  if (!competencia.value || !equipeSelecionadaId.value) {
    producaoConsolidada.value = null;
    producoesIndividuais.value = [];
    return;
  }
  carregando.value = true;
  acsSelecionado.value = null;
  try {
    producaoConsolidada.value =
      await validacaoAcsService.buscarProducaoConsolidada(
        competencia.value,
        equipeSelecionadaId.value
      );
    if (producaoConsolidada.value && producaoConsolidada.value.registros) {
      const idsIndividuais = producaoConsolidada.value.registros.map(
        (r) => r.documentoOriginalId
      );
      producoesIndividuais.value =
        await validacaoAcsService.buscarProducoesIndividuaisPorIds(
          idsIndividuais
        );
    } else {
      producoesIndividuais.value = [];
    }
  } catch (e) {
    notificationStore.showNotification(
      "Erro ao carregar dados de produção.",
      "error"
    );
    console.error(e);
  } finally {
    carregando.value = false;
  }
}

function selecionarAcs(acsStatus) {
  const detalhes = producoesIndividuais.value.find(
    (p) => p.acsId === acsStatus.id
  );
  acsSelecionado.value = detalhes;
}

async function salvarValidacao(payload) {
  try {
    await validacaoAcsService.salvarValidacaoAcs(
      producaoConsolidada.value.id,
      payload.acsId,
      payload.dados
    );
    notificationStore.showNotification(
      "Validação salva com sucesso!",
      "success"
    );
    // Recarrega apenas o documento consolidado para atualizar o status
    producaoConsolidada.value =
      await validacaoAcsService.buscarProducaoConsolidada(
        competencia.value,
        equipeSelecionadaId.value
      );
  } catch (e) {
    notificationStore.showNotification("Erro ao salvar validação.", "error");
    console.error(e);
  }
}

onMounted(async () => {
  listaEquipes.value = await equipesService.getEquipesByUbs(
    userStore.user.ubsId
  );
});

watch([competencia, equipeSelecionadaId], carregarDados);
</script>

<style lang="scss" scoped>
.pagina-container {
  padding: 1rem 2rem;
}
.card-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
h1 {
  margin: 0;
  font-size: 1.8rem;
}
.filtros {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.form-group label {
  font-weight: 500;
  margin-right: 0.5rem;
}
.form-group input,
.form-group select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.aviso-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.aviso,
.aviso-selecao {
  text-align: center;
  color: #6c757d;
  padding: 3rem;
}
.aviso-selecao {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.validacao-wrapper {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  align-items: start;
}
</style>
