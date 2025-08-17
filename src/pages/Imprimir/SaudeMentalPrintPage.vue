<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <div v-if="pacientes.length > 0" class="report-content form-page">
      <header class="print-header">
        <img
          src="@/assets/logo.png"
          alt="Logo da Prefeitura"
          class="logo-prefeitura"
        />
        <div class="header-text">
          <p>PREFEITURA MUNICIPAL DE GRANJA</p>
          <p>SECRETARIA MUNICIPAL DE SAÚDE</p>
          <h4>
            RELATÓRIO MENSAL DE ACOMPANHAMENTO DE PACIENTES DE SAÚDE MENTAL
          </h4>
        </div>
        <div class="header-info">
          <p>MUNICÍPIO: GRANJA</p>
          <p>REF. AO MÊS: {{ formatarCompetencia(props.competencia) }}</p>
          <p>
            DATA DA INFORMAÇÃO: {{ new Date().toLocaleDateString("pt-BR") }}
          </p>
        </div>
      </header>

      <div class="equipe-info">
        <p><strong>UBS:</strong> {{ nomeUbs }}</p>
        <p><strong>EQUIPE:</strong> {{ nomeEquipe }}</p>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>NOME DO PACIENTE</th>
            <th>CNS</th>
            <th>STATUS DO ACOMPANHAMENTO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="paciente in pacientes" :key="paciente.id">
            <td class="nome-paciente">{{ paciente.nome }}</td>
            <td class="cns-cell">{{ paciente.cns || "Não informado" }}</td>
            <td class="status-cell">
              {{ formatarStatusAcompanhamento(paciente.status) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Assinatura do Gerente da UBS</p>
      </div>
    </div>
    <div v-else-if="carregando" class="loading-message">
      Carregando dados para impressão...
    </div>
    <div v-else class="no-data-message">
      Nenhum paciente de saúde mental encontrado para esta equipe.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { saudeMentalService } from "@/services/saudeMentalService";
import { Printer } from "lucide-vue-next";
import { errorService } from "@/services/errorService";

const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

const carregando = ref(true);
const pacientes = ref([]);
const nomeUbs = ref("");
const nomeEquipe = ref("");

const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};

/**
 * Formata o objeto de status em uma string legível.
 * @param {object | string} status - O objeto de status ou a string 'Não Informado'.
 * @returns {string} A string formatada.
 */
const formatarStatusAcompanhamento = (status) => {
  if (typeof status !== "object" || status === null) {
    return "Não Informado";
  }

  const descricoes = [];
  if (status.acompCAPS) descricoes.push("Acompanhado no CAPS");
  if (status.acompUBS) descricoes.push("Acompanhado na UBS");
  if (status.recebeMedicacao) descricoes.push("Recebe Medicação");

  return descricoes.length > 0 ? descricoes.join(", ") : "Não Informado";
};

const imprimirPagina = () => window.print();

onMounted(async () => {
  try {
    const documentoId = `${props.competencia}_${props.equipeId}`;
    const dadosCompletos = await saudeMentalService.getAcompanhamentosCompletos(
      documentoId,
      props.equipeId
    );
    pacientes.value = dadosCompletos.pacientesComStatus;
    nomeUbs.value = dadosCompletos.nomeUbs;
    nomeEquipe.value = dadosCompletos.nomeEquipe;
  } catch (error) {
    errorService.handle(
      error,
      "Erro ao carregar os dados de saúde mental para impressão."
    );
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
.print-container {
  font-family: "Times New Roman", Times, serif;
  color: #000;
}
.print-actions {
  padding: 1rem;
  text-align: right;
}
.print-button {
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
}
.form-page {
  border: 2px solid #000;
  padding: 1cm;
  max-width: 21cm;
  margin: 0 auto 2rem auto;
  background: #fff;
}
.print-header {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.logo-prefeitura {
  width: 80px;
  height: auto;
  justify-self: start;
}
.header-text h4 {
  margin: 5px 0;
  font-size: 14pt;
}
.header-text p {
  margin: 0;
  font-size: 12pt;
}
.header-info {
  text-align: left;
  font-size: 10pt;
  align-self: end;
}
.header-info p {
  margin: 0;
}
.equipe-info {
  font-size: 12pt;
  margin-bottom: 1.5rem;
}
.equipe-info p {
  margin: 4px 0;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 11pt;
}
.print-table th,
.print-table td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
  vertical-align: middle;
}
.print-table thead th {
  font-weight: bold;
  background-color: #f2f2f2;
}
.nome-paciente {
  text-align: left;
  width: 50%;
}
.cns-cell {
  width: 20%;
}
.status-cell {
  text-align: left;
  width: 30%;
}
.signature-area {
  margin-top: 4cm;
  text-align: center;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 60%;
  margin: 0 auto;
}
.signature-title {
  margin-top: 8px;
  font-size: 10pt;
}
.loading-message,
.no-data-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

@media print {
  body {
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-actions {
    display: none;
  }
  .form-page {
    border: none;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    box-shadow: none;
  }
  .print-table thead th {
    background-color: #f2f2f2 !important;
  }
  @page {
    size: A4 portrait;
    margin: 2cm;
  }
}
</style>
