<template>
  <div class="print-container">
    <div class="print-actions no-print">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <BaseSpinner v-if="carregando" text="Gerando relatório consolidado..." />
    <div v-else-if="erro" class="erro-container">{{ erro }}</div>

    <div v-else class="report-content form-page">
      <header class="print-header">
        <img
          src="@/assets/logo.png"
          alt="Logo da Prefeitura"
          class="logo-prefeitura"
        />
        <div class="header-text">
          <h2>Relatório Consolidado - Produção ACS</h2>
          <p><strong>Competência:</strong> {{ competenciaFormatada }}</p>
          <p>
            <strong>UBS:</strong> {{ nomeUbs }} | <strong>Equipe:</strong>
            {{ nomeEquipe }}
          </p>
        </div>
      </header>

      <section class="secao-consolidado">
        <h3>Dados Consolidados da Equipe</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="indicador-col">Indicador</th>
                <th
                  v-for="acs in cabecalhosAcs"
                  :key="acs.id"
                  class="acs-header"
                >
                  <div class="vertical-text-wrapper">
                    <span>{{ acs.nome }}</span>
                  </div>
                </th>
                <th class="total-header">
                  <div class="vertical-text-wrapper">
                    <span>TOTAL</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(nomeIndicador, chave) in indicadoresNomes"
                :key="chave"
              >
                <td>{{ nomeIndicador }}</td>
                <td
                  v-for="acs in cabecalhosAcs"
                  :key="acs.id"
                  class="celula-dado"
                >
                  {{
                    dadosPivoteados[chave]?.[acs.id] ||
                    (typeof dadosPivoteados[chave]?.total === "string"
                      ? "N/A"
                      : 0)
                  }}
                </td>
                <td class="celula-total">
                  {{ dadosPivoteados[chave]?.total || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="secao-listas">
        <h3>Listas Nominais</h3>
        <div class="lista-wrapper">
          <h4>Nascidos Vivos</h4>
          <table v-if="listasGerais.nascidosVivos.length">
            <thead>
              <tr>
                <th>Nome da Mãe</th>
                <th>Data Nasc.</th>
                <th>CNS</th>
                <th>Peso(g)</th>
                <th>Sexo</th>
                <th>ACS</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in listasGerais.nascidosVivos"
                :key="`nv-${i}`"
              >
                <td>{{ item.nomeMae }}</td>
                <td>{{ formatarData(item.dataNascimento) }}</td>
                <td>{{ item.cnsMae }}</td>
                <td>{{ item.peso }}</td>
                <td>{{ item.sexo }}</td>
                <td>{{ item.acsNome }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>Nenhum registro.</p>
        </div>
        <div class="lista-wrapper">
          <h4>Óbitos</h4>
          <table v-if="listasGerais.obitos.length">
            <thead>
              <tr>
                <th>Nome do Paciente</th>
                <th>Data Nasc.</th>
                <th>Data Óbito</th>
                <th>Município</th>
                <th>Tipo</th>
                <th>Local</th>
                <th>ACS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in listasGerais.obitos" :key="`obito-${i}`">
                <td>{{ item.nomePaciente }}</td>
                <td>{{ formatarData(item.dataNascimento) }}</td>
                <td>{{ formatarData(item.dataObito) }}</td>
                <td>{{ item.municipioObito }}</td>
                <td>{{ item.tipo }}</td>
                <td>{{ item.local }}</td>
                <td>{{ item.acsNome }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>Nenhum registro.</p>
        </div>
      </section>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">
          Assinatura do(a) Enfermeiro(a) Responsável
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { producaoAcsServico } from "@/services/producaoAcsServico";
import { errorService } from "@/services/errorService";
import { formatarCompetencia as formatarCompetenciaUtil } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Printer } from "lucide-vue-next";

const route = useRoute();
const carregando = ref(true);
const erro = ref("");
const nomeEquipe = ref("");
const nomeUbs = ref("");

const cabecalhosAcs = ref([]);
const dadosPivoteados = ref({});
const listasGerais = ref({ nascidosVivos: [], obitos: [] });

const competenciaFormatada = computed(() =>
  formatarCompetenciaUtil(route.params.competencia)
);

const indicadoresNomes = {
  gestantesAcompanhadas: "Gestantes Acompanhadas",
  criancasAcompanhadas: "Crianças (< 2 anos) Acompanhadas",
  novosCadastros: "Novos Cadastros",
  atualizacoesCadastrais: "Atualizações Cadastrais",
  visitasRealizadas: "Visitas Realizadas",
  hipertensosAcompanhados: "Hipertensos Acompanhados",
  diabeticosAcompanhados: "Diabéticos Acompanhados",
  orientacaoPreventivo: "Orientações para Preventivo",
  vacinasAtrasadas: "Orientações de Vacinas Atrasadas",
  identificouNovosDomicilios: "Identificou Domicílios Não Cadastrados",
  visitouTodasGestantes: "Visitou Todas as Famílias com Gestantes",
  visitouTodasCriancas: "Visitou Todas as Famílias com Crianças < 2 anos",
  acompanhouAcamados: "Acompanhou Acamados/Domiciliados",
};

function formatarData(dataString) {
  if (!dataString || !dataString.includes("-")) return dataString;
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
}

function imprimirPagina() {
  window.print();
}

onMounted(async () => {
  try {
    const { competencia, equipeId } = route.params;
    if (!competencia || !equipeId)
      throw new Error("Competência ou ID da equipe não fornecidos.");

    const equipeDoc = await getDoc(doc(db, "equipes", equipeId));
    if (equipeDoc.exists()) {
      const equipeData = equipeDoc.data();
      nomeEquipe.value = equipeData.nome;
      if (equipeData.ubsId) {
        const ubsDoc = await getDoc(doc(db, "ubs", equipeData.ubsId));
        if (ubsDoc.exists()) nomeUbs.value = ubsDoc.data().nome;
      }
    }

    const producoes = await producaoAcsServico.buscarProducoesDaEquipe(
      competencia,
      equipeId
    );
    if (producoes.length === 0) {
      erro.value =
        "Nenhuma produção finalizada encontrada para esta equipe na competência selecionada.";
      return;
    }

    const acsUnicos = new Map();
    producoes.forEach((p) => {
      if (p.acsId && !acsUnicos.has(p.acsId)) {
        acsUnicos.set(p.acsId, { id: p.acsId, nome: p.acsNome });
      }
    });
    cabecalhosAcs.value = Array.from(acsUnicos.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    const dadosProcessados = {};
    const todasListas = { nascidosVivos: [], obitos: [] };

    Object.keys(indicadoresNomes).forEach((chave) => {
      dadosProcessados[chave] = { total: 0 };
    });

    producoes.forEach((prod) => {
      for (const chave in prod.consolidado) {
        if (!dadosProcessados[chave]) continue;
        const valor = prod.consolidado[chave];
        dadosProcessados[chave][prod.acsId] = valor;
        if (typeof valor === "number") {
          dadosProcessados[chave].total =
            (dadosProcessados[chave].total || 0) + valor;
        } else if (typeof valor === "string") {
          if (typeof dadosProcessados[chave].total !== "object")
            dadosProcessados[chave].total = {};
          dadosProcessados[chave].total[valor] =
            (dadosProcessados[chave].total[valor] || 0) + 1;
        }
      }
      (prod.listasNominais.nascidosVivos || []).forEach((item) =>
        todasListas.nascidosVivos.push({ ...item, acsNome: prod.acsNome })
      );
      (prod.listasNominais.obitos || []).forEach((item) =>
        todasListas.obitos.push({ ...item, acsNome: prod.acsNome })
      );
    });

    Object.keys(dadosProcessados).forEach((chave) => {
      const item = dadosProcessados[chave];
      if (typeof item.total === "object") {
        item.total = Object.entries(item.total)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
    });

    dadosPivoteados.value = dadosProcessados;
    listasGerais.value = todasListas;
  } catch (err) {
    errorService.handle(err, "Erro ao gerar relatório.");
    erro.value = "Não foi possível carregar os dados para impressão.";
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
/* ✅ ESTILOS REFEITOS PARA O NOVO PADRÃO */
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
.erro-container {
  text-align: center;
  color: red;
  font-size: 1.2rem;
}

.form-page {
  border: 2px solid #000;
  padding: 1cm;
  max-width: 29.7cm;
  margin: 0 auto;
}

.print-header {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.logo-prefeitura {
  width: 80px;
  height: auto;
}
.header-text {
  flex-grow: 1;
}
.header-text h2 {
  margin: 0;
  font-size: 1.2rem;
}
.header-text p {
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.secao-consolidado,
.secao-listas {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}
h3,
h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.table-wrapper {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}
th,
td {
  border: 1px solid #000;
  padding: 4px;
  text-align: center;
  vertical-align: middle;
}
th {
  background-color: #f2f2f2;
}
td:first-child {
  text-align: left;
}

/* ✅ 1. Coluna do indicador com largura reduzida */
.indicador-col {
  width: 280px;
  min-width: 280px;
}

.celula-dado {
  text-align: center;
}
.celula-total {
  font-weight: bold;
}

/* ✅ 2. Colunas de ACS e Total com mesma largura */
.acs-header,
.total-header {
  width: 55px;
  min-width: 55px;
  height: 180px; /* Aumenta a altura para nomes longos */
  vertical-align: bottom;
  position: relative;
}

/* ✅ 3. Nomes na vertical, centralizados e com quebra de linha */
.vertical-text-wrapper {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: left;
  white-space: normal; /* Permite quebra de linha */
  max-width: 170px; /* Equivalente à altura do th */
  margin: 0 auto;
}

.signature-area {
  margin-top: 2cm;
  text-align: center;
  page-break-inside: avoid;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 50%;
  margin: 0 auto;
}
.signature-title {
  margin-top: 8px;
  font-size: 10pt;
}

@media print {
  body {
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .no-print,
  .print-actions {
    display: none;
  }
  .print-container,
  .report-content {
    margin: 0;
    padding: 0;
  }
  .form-page {
    border: 2px solid #000;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  /* ✅ 4. Orientação Paisagem */
  @page {
    size: A4 landscape;
    margin: 1.5cm;
  }
}
</style>
