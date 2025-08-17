// ARQUIVO GERADO: src/pages/Enfermeiro/Gestao/CronogramaPrintPage.vue
<template>
  <div class="print-page-container">
    <div class="print-controls">
      <button @click="imprimirPagina" class="btn-print">
        <Printer :size="18" /> Imprimir
      </button>
    </div>

    <div class="print-content">
      <header class="print-header">
        <div class="logo-container"></div>
        <div class="title-container">
          <h1>Cronograma Mensal de Atividades</h1>
          <p>
            <strong>Competência:</strong> {{ formatarCompetencia(competencia) }}
          </p>
          <p><strong>UBS:</strong> {{ ubsNome || "Carregando..." }}</p>
          <p><strong>Equipe:</strong> {{ equipeNome || "Carregando..." }}</p>
        </div>
        <div class="header-space"></div>
      </header>

      <main>
        <BaseSpinner
          v-if="carregando"
          text="Carregando dados para impressão..."
        />
        <div v-else>
          <section class="professional-section">
            <h2>Atividades do(a) Enfermeiro(a)</h2>
            <CronogramaCalendarView
              :eventos="eventosEnfermeiro"
              :competencia="competencia"
            />
          </section>

          <section class="professional-section">
            <h2>Atividades do(a) Médico(a)</h2>
            <CronogramaCalendarView
              :eventos="eventosMedico"
              :competencia="competencia"
            />
          </section>

          <section class="professional-section">
            <h2>Atividades do(a) Técnico(a) de Enfermagem</h2>
            <CronogramaCalendarView
              :eventos="eventosTecnico"
              :competencia="competencia"
            />
          </section>
        </div>
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
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
// ✅ CORREÇÃO: A importação do 'cronogramaService' foi removida.
import { formatarCompetencia } from "@/utils/dateUtils";
import CronogramaCalendarView from "@/components/enfermeiro/CronogramaCalendarView.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Printer } from "lucide-vue-next";

const route = useRoute();
const carregando = ref(true);
const cronograma = ref(null);
const equipeNome = ref("");
const ubsNome = ref("");

const { competencia, equipeId, ubsId } = route.params;
const documentoId = `${competencia}_${equipeId}`;

const eventosEnfermeiro = computed(
  () => cronograma.value?.eventosEnfermeiro || []
);
const eventosMedico = computed(() => cronograma.value?.eventosMedico || []);
const eventosTecnico = computed(() => cronograma.value?.eventosTecnico || []);

const imprimirPagina = () => {
  window.print();
};

onMounted(async () => {
  try {
    const promises = [
      getDoc(doc(db, "cronogramas", documentoId)),
      getDoc(doc(db, "equipes", equipeId)),
      getDoc(doc(db, "ubs", ubsId)),
    ];

    const [cronogramaSnap, equipeSnap, ubsSnap] = await Promise.all(promises);

    if (cronogramaSnap.exists()) {
      cronograma.value = cronogramaSnap.data();
    }
    if (equipeSnap.exists()) {
      equipeNome.value = equipeSnap.data().nome;
    }
    if (ubsSnap.exists()) {
      ubsNome.value = ubsSnap.data().nome;
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
}

.btn-print {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #001529;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.print-content {
  background-color: #fff;
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 2cm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
  .logo-container {
    flex: 1;
  }
  .title-container {
    flex: 3;
    text-align: center;
  }
  .header-space {
    flex: 1;
  }
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    margin: 2px 0;
  }
}

main {
  flex-grow: 1;
  margin-top: 1.5rem;
}

.professional-section {
  margin-bottom: 2rem;
  break-after: page; /* Garante quebra de página após cada seção, se necessário */

  h2 {
    font-size: 1.2rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
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
