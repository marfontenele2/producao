<template>
  <div class="inspetor-page">
    <div class="card">
      <h2>Inspetor de Produção (Ferramenta de Debug)</h2>
      <div class="form-group">
        <label for="competencia"
          >Selecione a Competência para Inspecionar:</label
        >
        <input
          type="month"
          id="competencia"
          v-model="competencia"
          @change="buscarDados"
        />
      </div>

      <div v-if="carregando" class="state-message">Inspecionando...</div>

      <div
        v-for="(resultados, colecao) in dadosInspecao"
        :key="colecao"
        class="collection-section"
      >
        <h3>
          Coleção: <code>{{ colecao }}</code>
        </h3>
        <div v-if="!resultados.length" class="state-message">
          Nenhum documento encontrado.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID do Documento</th>
                <th>Status (Todos)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in resultados" :key="doc.id">
                <td>{{ doc.id }}</td>
                <td>
                  <pre>{{ doc }}</pre>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";
import { inspetorService } from "@/services/inspetorService";
import { getCompetenciaAtual } from "@/utils/dateUtils";

const competencia = ref(getCompetenciaAtual());
const carregando = ref(false);
const dadosInspecao = ref(null);
const userStore = useUserStore();

async function buscarDados() {
  if (!userStore.user?.ubsId) {
    alert("Usuário sem UBS definida.");
    return;
  }
  carregando.value = true;
  dadosInspecao.value = null;
  try {
    dadosInspecao.value = await inspetorService.inspecionarProducoes(
      competencia.value,
      userStore.user.ubsId
    );
  } catch (error) {
    console.error("Erro no inspetor:", error);
    alert("Ocorreu um erro ao buscar os dados. Verifique o console.");
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.form-group {
  margin-bottom: 1.5rem;
}
.state-message {
  text-align: center;
  color: #666;
  padding: 2rem 0;
}
.collection-section {
  margin-top: 2rem;
}
.table-container {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #eee;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #f8f9fa;
}
pre {
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
