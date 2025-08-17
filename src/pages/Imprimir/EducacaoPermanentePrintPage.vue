<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <div v-if="dados" class="report-content">
      <div
        v-if="!dados.eventos || dados.eventos.length === 0"
        class="empty-state"
      >
        Nenhum evento registrado nesta competência.
      </div>

      <div v-else>
        <div v-for="evento in dados.eventos" :key="evento.id" class="form-page">
          <header class="form-header">
            <img src="@/assets/logo.png" alt="Logo Granja" class="logo" />
            <div class="title-block">
              <p>Saúde</p>
              <h3>EDUCAÇÃO PERMANENTE – VISA</h3>
              <p>ATENÇÃO PRIMÁRIA</p>
            </div>
            <div class="logo-placeholder"></div>
          </header>

          <main class="form-body">
            <div class="info-grid">
              <div class="field-group">
                <label>UBS:</label><span>{{ nomeUbs }}</span>
              </div>
              <div class="field-group">
                <label>LOCAL:</label><span>{{ evento.local }}</span>
              </div>
              <div class="field-group">
                <label>PÚBLICO ALVO:</label
                ><span>{{ evento.publicoAlvo }}</span>
              </div>
              <div class="field-group">
                <label>HORÁRIO:</label><span>{{ evento.horario }}</span>
              </div>
              <div class="field-group">
                <label>PALESTRANTE:</label><span>{{ evento.palestrante }}</span>
              </div>
              <div class="field-group">
                <label>DATA:</label><span>{{ formatarData(evento.data) }}</span>
              </div>
            </div>
            <div class="full-width-field">
              <label>TEMAS:</label>
              <div class="content-box">{{ evento.tema }}</div>
            </div>
            <div class="full-width-field">
              <label>OBJETIVOS:</label>
              <div class="content-box text-content">{{ evento.objetivos }}</div>
            </div>
            <div class="full-width-field">
              <label>CONTEÚDO:</label>
              <div class="content-box text-content">{{ evento.conteudo }}</div>
            </div>

            <div class="signature-area">
              <div class="signature-line"></div>
              <p class="signature-title">Assinatura do Responsável</p>
            </div>
          </main>

          <footer class="form-footer">
            <p>
              Rua Pessoa Anta, 730 - Centro - CEP: 62.430-000 | C.G.C.:
              07.827.165/0001-80
            </p>
            <p>Fone: (88) 3624-1164 GRANJA-CE-BRASIL</p>
          </footer>
        </div>
      </div>
    </div>
    <div v-else>Carregando dados para impressão...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { educacaoPermanenteService } from "@/services/educacaoPermanenteService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-vue-next";

const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

const dados = ref(null);
const nomeUbs = ref("");
const nomeEquipe = ref("");

const formatarData = (timestamp) => {
  if (!timestamp) return "___/___/_____";
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

// eslint-disable-next-line no-unused-vars
const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};

const imprimirPagina = () => {
  window.print();
};

onMounted(async () => {
  const documentoId = `${props.competencia}_${props.equipeId}`;
  dados.value = await educacaoPermanenteService.getDadosCompetencia(
    documentoId
  );

  if (props.equipeId) {
    const equipeDoc = await getDoc(doc(db, "equipes", props.equipeId));
    if (equipeDoc.exists()) {
      nomeEquipe.value = equipeDoc.data().nome;
      const ubsId = equipeDoc.data().ubsId;
      if (ubsId) {
        const ubsDoc = await getDoc(doc(db, "ubs", ubsId));
        if (ubsDoc.exists()) nomeUbs.value = ubsDoc.data().nome;
      }
    }
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
.report-content {
  padding: 0 2rem 2rem 2rem;
}
.empty-state {
  text-align: center;
  font-style: italic;
  color: #6c757d;
  padding: 2rem;
}

.form-page {
  border: 2px solid #000;
  padding: 1cm;
  max-width: 21cm; /* Largura A4 */
  margin: 0 auto 2rem auto;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5cm;
}
.logo {
  width: 80px;
  height: auto;
}
.logo-placeholder {
  width: 80px;
  flex-shrink: 0;
}
.title-block {
  text-align: center;
}
.title-block p {
  margin: 0;
  font-size: 12pt;
}
.title-block h3 {
  margin: 5px 0;
  font-size: 14pt;
}
.form-body {
  flex-grow: 1;
  padding-top: 1cm;
  display: flex;
  flex-direction: column;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5cm 1cm;
  margin-bottom: 1cm;
}
.field-group {
  display: flex;
  align-items: baseline;
  border-bottom: 1px solid #000;
  padding-bottom: 4px;
}
.field-group label {
  font-weight: bold;
  margin-right: 8px;
}
.field-group span {
  font-family: monospace;
}
.full-width-field {
  margin-bottom: 1cm;
}
.full-width-field label {
  font-weight: bold;
}
.content-box {
  border: 1px solid #000;
  padding: 8px;
  margin-top: 4px;
  min-height: 2.5em;
  white-space: pre-wrap;
  word-break: break-word;
}
.text-content {
  min-height: 5em;
}
.signature-area {
  margin-top: auto;
  padding-top: 2cm;
  text-align: center;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 70%;
  margin: 0 auto;
}
.signature-title {
  margin-top: 8px;
  font-size: 10pt;
}
.form-footer {
  text-align: center;
  font-size: 8pt;
  border-top: 2px solid #000;
  padding-top: 0.5cm;
  margin-top: 1cm;
}
.form-footer p {
  margin: 0;
}

/* ✅ CORREÇÃO DE IMPRESSÃO */
@media print {
  body {
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-actions,
  .main-layout {
    display: none;
  } /* Esconde tudo fora da área de impressão */
  .print-container {
    padding: 0;
    margin: 0;
  }
  .report-content {
    padding: 0;
    margin: 0;
  }
  .form-page {
    border: 2px solid #000; /* Mantém a borda na impressão */
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    page-break-after: always;
  }
  .form-page:last-of-type {
    page-break-after: auto;
  }

  @page {
    size: A4;
    margin: 2cm; /* Define a margem da página para a impressora */
  }
}
</style>
