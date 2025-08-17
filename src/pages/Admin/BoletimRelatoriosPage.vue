<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Relatório de Boletins de Testes Rápidos</h2>
        <p>
          Visualize os dados consolidados de todas as equipes por competência.
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
          @click="carregarRelatorios"
          :disabled="carregando"
        >
          <Search :size="18" /> Gerar Relatórios
        </button>
      </div>

      <div class="tabs">
        <button
          @click="abaAtiva = 'geral'"
          :class="{ active: abaAtiva === 'geral' }"
        >
          Consolidado Geral
        </button>
        <button
          @click="abaAtiva = 'porEquipe'"
          :class="{ active: abaAtiva === 'porEquipe' }"
        >
          Detalhado por Equipe
        </button>
        <button
          @click="abaAtiva = 'perdas'"
          :class="{ active: abaAtiva === 'perdas' }"
        >
          Relatório de Perdas e Inválidos
        </button>
      </div>

      <BaseSpinner v-if="carregando" />
      <div v-else>
        <!-- Tabela Consolidado Geral -->
        <div v-if="abaAtiva === 'geral'">
          <div v-if="dadosGeral.length > 0" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Teste</th>
                  <th>Marca</th>
                  <th>Pré-natal</th>
                  <th>Mobilização</th>
                  <th>Treinamento</th>
                  <th>Rotina</th>
                  <th>Total</th>
                  <th>Reagentes</th>
                  <th>Inválidos</th>
                  <th>Perdidos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dadosGeral" :key="item.marcaNome">
                  <td>{{ item.testeNome }}</td>
                  <td>{{ item.marcaNome }}</td>
                  <td>{{ item.prenatal }}</td>
                  <td>{{ item.mobilizacao }}</td>
                  <td>{{ item.treinamento }}</td>
                  <td>{{ item.rotina }}</td>
                  <td>
                    <strong>{{ item.total }}</strong>
                  </td>
                  <td>{{ item.reagentes }}</td>
                  <td>{{ item.invalidos }}</td>
                  <td>{{ item.perdidos }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-message">
            Nenhum dado consolidado encontrado.
          </p>
        </div>

        <!-- Tabela Detalhada por Equipe -->
        <div v-if="abaAtiva === 'porEquipe'">
          <div v-if="dadosPorEquipe.length > 0" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>UBS</th>
                  <th>Equipe</th>
                  <th>Teste</th>
                  <th>Marca</th>
                  <th>Total</th>
                  <th>Reagentes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dadosPorEquipe" :key="item.id">
                  <td>{{ item.ubsNome }}</td>
                  <td>{{ item.equipeNome }}</td>
                  <td>{{ item.testeNome }}</td>
                  <td>{{ item.marcaNome }}</td>
                  <td>{{ item.total }}</td>
                  <td>{{ item.reagentes }}</td>
                  <td>
                    <span
                      class="status-badge"
                      :class="item.status.toLowerCase()"
                      >{{ item.status }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-message">Nenhum dado por equipe encontrado.</p>
        </div>

        <!-- Tabela Detalhada de Perdas e Inválidos -->
        <div v-if="abaAtiva === 'perdas'">
          <div v-if="dadosDetalhados.length > 0" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>UBS</th>
                  <th>Equipe</th>
                  <th>Teste</th>
                  <th>Marca</th>
                  <th>Tipo</th>
                  <th>Qtd</th>
                  <th>Lote</th>
                  <th>Motivo</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in dadosDetalhados" :key="item.id">
                  <td>{{ item.ubsNome }}</td>
                  <td>{{ item.equipeNome }}</td>
                  <td>{{ item.testeNome }}</td>
                  <td>{{ item.marcaNome }}</td>
                  <td>
                    <span class="tipo-badge" :class="item.tipo.toLowerCase()">{{
                      item.tipo
                    }}</span>
                  </td>
                  <td>{{ item.quantidade }}</td>
                  <td>{{ item.lote }}</td>
                  <td>{{ item.motivo || "N/A" }}</td>
                  <td>{{ item.descricao || "N/A" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-message">
            Nenhuma perda ou teste inválido registrado.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import { boletimRelatorioService } from "@/services/boletimRelatorioService";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Search } from "lucide-vue-next";

const carregando = ref(false);
const competencia = ref(getCompetenciaAtual());
const dadosGeral = ref([]);
const dadosPorEquipe = ref([]);
const dadosDetalhados = ref([]);
const abaAtiva = ref("geral");

const carregarRelatorios = async () => {
  carregando.value = true;
  dadosGeral.value = [];
  dadosPorEquipe.value = [];
  dadosDetalhados.value = [];
  try {
    const [geral, porEquipe, detalhado] = await Promise.all([
      boletimRelatorioService.gerarRelatorioGeral(competencia.value),
      boletimRelatorioService.gerarRelatorioPorEquipe(competencia.value),
      boletimRelatorioService.gerarRelatorioDetalhado(competencia.value),
    ]);
    dadosGeral.value = geral;
    dadosPorEquipe.value = porEquipe;
    dadosDetalhados.value = detalhado;
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);
  } finally {
    carregando.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* Estilos padronizados */
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
.controls-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
}
.tabs {
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 24px;
  button {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    &.active {
      border-bottom-color: #007bff;
      color: #007bff;
      font-weight: 600;
    }
  }
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th,
td {
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}
th:nth-child(-n + 4),
td:nth-child(-n + 4) {
  text-align: left;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  &.finalizado {
    background-color: #28a745;
  }
  &.parcial {
    background-color: #17a2b8;
  }
}
.tipo-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  &.inválido {
    background-color: #ffc107;
    color: #212529;
  }
  &.perda {
    background-color: #dc3545;
  }
}
.empty-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
</style>
