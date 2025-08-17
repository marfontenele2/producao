<template>
  <div class="print-page-container">
    <div class="print-controls">
      <router-link :to="{ name: 'Boletim' }" class="btn-secondary">
        <ArrowLeft :size="18" /> Voltar
      </router-link>
      <button @click="imprimirPagina" class="btn-print">
        <Printer :size="18" /> Imprimir
      </button>
    </div>

    <div class="print-content">
      <header class="print-header">
        <div class="title-container">
          <h1>Boletim Mensal de Testes Rápidos</h1>
          <p>
            <strong>Competência:</strong> {{ formatarCompetencia(competencia) }}
          </p>
          <p>
            <strong>UBS:</strong> {{ ubsNome || "Carregando..." }} |
            <strong>Equipe:</strong> {{ equipeNome || "Carregando..." }}
          </p>
        </div>
      </header>

      <main>
        <BaseSpinner
          v-if="carregando"
          text="Carregando dados para impressão..."
        />
        <div v-else-if="dadosFormatados.length > 0">
          <div
            v-for="teste in dadosFormatados"
            :key="teste.id"
            class="teste-section"
          >
            <h2>{{ teste.nome }}</h2>
            <!-- Tabela Principal de Totais -->
            <table>
              <thead>
                <tr>
                  <th>Marca / Fabricante</th>
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
                <tr v-for="marca in teste.marcas" :key="marca.id">
                  <td>{{ marca.nome }}</td>
                  <td>{{ marca.dados.realizados.prenatal }}</td>
                  <td>{{ marca.dados.realizados.mobilizacao }}</td>
                  <td>{{ marca.dados.realizados.treinamentos }}</td>
                  <td>{{ marca.dados.realizados.rotina }}</td>
                  <td>
                    <strong>{{
                      calcularTotalRealizados(marca.dados.realizados)
                    }}</strong>
                  </td>
                  <td>{{ marca.dados.reagentes }}</td>
                  <td>{{ calcularTotalItens(marca.dados.invalidos) }}</td>
                  <td>{{ calcularTotalItens(marca.dados.perdidos) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>Totais</th>
                  <th>{{ calcularTotalColuna(teste.marcas, "prenatal") }}</th>
                  <th>
                    {{ calcularTotalColuna(teste.marcas, "mobilizacao") }}
                  </th>
                  <th>
                    {{ calcularTotalColuna(teste.marcas, "treinamentos") }}
                  </th>
                  <th>{{ calcularTotalColuna(teste.marcas, "rotina") }}</th>
                  <th>
                    {{ calcularTotalColuna(teste.marcas, "totalRealizados") }}
                  </th>
                  <th>{{ calcularTotalColuna(teste.marcas, "reagentes") }}</th>
                  <th>
                    {{ calcularTotalColuna(teste.marcas, "totalInvalidos") }}
                  </th>
                  <th>
                    {{ calcularTotalColuna(teste.marcas, "totalPerdidos") }}
                  </th>
                </tr>
              </tfoot>
            </table>

            <!-- ✅ MELHORIA: Tabelas de Detalhes para Inválidos e Perdidos -->
            <div v-for="marca in teste.marcas" :key="`details-${marca.id}`">
              <div
                v-if="marca.dados.invalidos && marca.dados.invalidos.length > 0"
                class="details-section"
              >
                <h4>Detalhes de Inválidos ({{ marca.nome }})</h4>
                <table class="details-table">
                  <thead>
                    <tr>
                      <th>Quantidade</th>
                      <th>Nº do Lote</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in marca.dados.invalidos"
                      :key="`inv-${index}`"
                    >
                      <td>{{ item.quantidade }}</td>
                      <td>{{ item.lote }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                v-if="marca.dados.perdidos && marca.dados.perdidos.length > 0"
                class="details-section"
              >
                <h4>Detalhes de Perdidos ({{ marca.nome }})</h4>
                <table class="details-table">
                  <thead>
                    <tr>
                      <th>Quantidade</th>
                      <th>Motivo</th>
                      <th>Nº do Lote</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in marca.dados.perdidos"
                      :key="`per-${index}`"
                    >
                      <td>{{ item.quantidade }}</td>
                      <td>{{ item.motivo }}</td>
                      <td>{{ item.lote }}</td>
                      <td>{{ item.descricao || "N/A" }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="empty-message">
          Nenhum dado de boletim encontrado para esta competência.
        </p>
      </main>

      <footer class="print-footer">
        <div class="signature-line">
          <p>___________________________________</p>
          <p>Assinatura do(a) Enfermeiro(a)</p>
        </div>
        <div class="signature-line">
          <p>___________________________________</p>
          <p>Assinatura do(a) Gerente da UBS</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
// O script permanece o mesmo, pois já busca todos os dados necessários.
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { formatarCompetencia } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Printer, ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const carregando = ref(true);
const equipeNome = ref("");
const ubsNome = ref("");
const dadosFormatados = ref([]);

const { competencia, equipeId, ubsId } = route.params;
const documentoId = `${competencia}_${equipeId}`;

const imprimirPagina = () => window.print();

const calcularTotalRealizados = (realizados) => {
  return (
    (realizados.prenatal || 0) +
    (realizados.mobilizacao || 0) +
    (realizados.treinamentos || 0) +
    (realizados.rotina || 0)
  );
};

const calcularTotalItens = (itens) => {
  return (itens || []).reduce((acc, item) => acc + (item.quantidade || 0), 0);
};

const calcularTotalColuna = (marcas, campo) => {
  return marcas.reduce((acc, marca) => {
    if (campo === "totalRealizados")
      return acc + calcularTotalRealizados(marca.dados.realizados);
    if (campo === "totalInvalidos")
      return acc + calcularTotalItens(marca.dados.invalidos);
    if (campo === "totalPerdidos")
      return acc + calcularTotalItens(marca.dados.perdidos);
    if (campo === "reagentes") return acc + (marca.dados.reagentes || 0);
    return acc + (marca.dados.realizados[campo] || 0);
  }, 0);
};

onMounted(async () => {
  try {
    const [boletimSnap, equipeSnap, ubsSnap, testesSnap] = await Promise.all([
      getDoc(doc(db, "boletimDados", documentoId)),
      getDoc(doc(db, "equipes", equipeId)),
      getDoc(doc(db, "ubs", ubsId)),
      getDocs(collection(db, "boletimTestes")),
    ]);

    if (equipeSnap.exists()) equipeNome.value = equipeSnap.data().nome;
    if (ubsSnap.exists()) ubsNome.value = ubsSnap.data().nome;

    if (boletimSnap.exists()) {
      const dadosBoletim = boletimSnap.data().testes || {};
      const todosTestes = testesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const formatados = [];
      for (const testeId in dadosBoletim) {
        const testeInfo = todosTestes.find((t) => t.id === testeId);
        if (testeInfo) {
          const marcasFormatadas = [];
          for (const marcaId in dadosBoletim[testeId]) {
            const marcaInfo = testeInfo.marcas.find((m) => m.id === marcaId);
            if (marcaInfo) {
              marcasFormatadas.push({
                id: marcaId,
                nome: marcaInfo.nome,
                dados: dadosBoletim[testeId][marcaId],
              });
            }
          }
          if (marcasFormatadas.length > 0) {
            formatados.push({
              id: testeId,
              nome: testeInfo.nome,
              marcas: marcasFormatadas,
            });
          }
        }
      }
      dadosFormatados.value = formatados;
    }
  } catch (error) {
    console.error("Erro ao buscar dados para impressão:", error);
  } finally {
    carregando.value = false;
  }
});
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
body {
  background-color: #f0f2f5;
}
.print-page-container {
  font-family: "Roboto", sans-serif;
}
.print-controls {
  text-align: center;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
.btn-print,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
}
.btn-print {
  background-color: #001529;
  color: white;
  border-color: #001529;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}
.print-content {
  background-color: #fff;
  max-width: 297mm;
  min-height: 210mm;
  margin: 0 auto;
  padding: 1.5cm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.print-header {
  text-align: center;
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  h1 {
    margin: 0;
    font-size: 1.4rem;
  }
  p {
    margin: 4px 0;
  }
}
.teste-section {
  margin-bottom: 2rem;
  break-inside: avoid;
  h2 {
    font-size: 1.2rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
th,
td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: center;
}
th {
  background-color: #f2f2f2;
  font-weight: bold;
}
td:first-child,
th:first-child {
  text-align: left;
}
tfoot {
  font-weight: bold;
}
.details-section {
  margin-top: 1.5rem;
}
.details-table {
  font-size: 0.75rem;
}
.print-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
  .signature-line {
    text-align: center;
    font-size: 0.9rem;
    p {
      margin: 0;
    }
  }
}
.empty-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
@media print {
  body {
    background-color: #fff;
  }
  .print-controls {
    display: none;
  }
  .print-content {
    box-shadow: none;
    margin: 0;
    padding: 0;
  }
}
</style>
