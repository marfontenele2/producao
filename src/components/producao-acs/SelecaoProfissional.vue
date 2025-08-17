<template>
  <div class="selecao-container">
    <h2>1. Seleção do Profissional</h2>
    <div v-if="carregando" class="spinner-container">
      <BaseSpinner text="Carregando profissionais..." />
    </div>
    <div v-else class="form-selecao">
      <div class="form-group">
        <label for="competencia">Competência</label>
        <input id="competencia" type="month" v-model="competencia" />
      </div>
      <div class="form-group">
        <label for="profissional">Agente Comunitário de Saúde (ACS)</label>
        <select id="profissional" v-model="acsSelecionadoId">
          <option disabled value="">Selecione um profissional</option>
          <option v-for="p in profissionais" :key="p.id" :value="p.id">
            {{ p.nome }}
          </option>
        </select>
      </div>
      <button
        @click="iniciar"
        :disabled="!acsSelecionadoId || !competencia"
        class="btn"
      >
        Iniciar Lançamento
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { errorService } from "@/services/errorService";
// ✅ CORREÇÃO: O caminho do import foi corrigido para a pasta "services"
import { producaoAcsServico } from "@/services/producaoAcsServico.js";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

const emit = defineEmits(["profissional-selecionado"]);
const userStore = useUserStore();

const carregando = ref(true);
const profissionais = ref([]);
const competencia = ref(getCompetenciaAtual());
const acsSelecionadoId = ref("");

onMounted(async () => {
  try {
    const equipeId = userStore.user?.equipeId;
    if (equipeId) {
      profissionais.value =
        await producaoAcsServico.buscarProfissionaisAcsDaEquipe(
          competencia.value,
          equipeId
        );
    }
  } catch (erro) {
    errorService.handle(erro, "Falha ao carregar a lista de profissionais.");
  } finally {
    carregando.value = false;
  }
});

function iniciar() {
  const profissional = profissionais.value.find(
    (p) => p.id === acsSelecionadoId.value
  );
  if (profissional) {
    emit("profissional-selecionado", {
      competencia: competencia.value,
      acs: profissional,
    });
  }
}
</script>

<style scoped>
.form-selecao {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn {
  align-self: flex-end;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:disabled {
  background-color: #ccc;
}
</style>
