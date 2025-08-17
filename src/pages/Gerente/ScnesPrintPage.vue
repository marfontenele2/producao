// 📄 ARQUIVO: src/pages/Gerente/ScnesPrintPage.vue (Estilos de Impressão
Corrigidos)
<template>
  <div class="print-page">
    <div v-if="!carregando">
      <header>
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <h2>Relação de Profissionais - SCNES</h2>
          <p><strong>Competência:</strong> {{ competenciaFormatada }}</p>
          <p><strong>UBS:</strong> {{ ubsNome }}</p>
          <p><strong>Equipe:</strong> {{ equipeNome }}</p>
        </div>
        <button @click="imprimir" class="print-button no-print">
          <Printer :size="18" /> Imprimir
        </button>
      </header>
      <table class="print-table">
        <thead>
          <tr>
            <th>Nome do Profissional</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th>Registro</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listaProfissionais.length === 0">
            <td colspan="5" style="text-align: center">
              Nenhum profissional encontrado.
            </td>
          </tr>
          <tr v-for="prof in listaProfissionais" :key="prof.id">
            <td>{{ prof.nome }}</td>
            <td>{{ prof.cpf || "-" }}</td>
            <td>{{ prof.cargo }}</td>
            <td>{{ prof.registro || "-" }}</td>
            <td>{{ prof.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="loading-message">Carregando dados para impressão...</div>
  </div>
</template>

<script setup>
// Script permanece o mesmo da correção anterior
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { scnesService } from "@/services/scnesService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-vue-next";

const route = useRoute();
const carregando = ref(true);
const listaProfissionais = ref([]);
const ubsNome = ref("");
const equipeNome = ref("");

const competenciaFormatada = computed(() => {
  if (!route.params.competencia) return "";
  const [ano, mes] = route.params.competencia.split("-");
  return `${mes}/${ano}`;
});

onMounted(async () => {
  const { competencia, ubsId, equipeId } = route.params;
  const documentoId = `${competencia}_${equipeId}`;
  try {
    const [profissionaisData, ubsDoc, equipeDoc] = await Promise.all([
      scnesService.getProfissionais(documentoId),
      getDoc(doc(db, "ubs", ubsId)),
      getDoc(doc(db, "equipes", equipeId)),
    ]);
    listaProfissionais.value = profissionaisData || [];
    if (ubsDoc.exists()) ubsNome.value = ubsDoc.data().nome;
    if (equipeDoc.exists()) equipeNome.value = equipeDoc.data().nome;
  } catch (error) {
    console.error("Erro ao buscar dados para impressão:", error);
  } finally {
    carregando.value = false;
  }
});

const imprimir = () => window.print();
</script>

<style scoped>
/* Estilos gerais permanecem os mesmos */
.print-page {
  padding: 2rem;
  font-family: sans-serif;
  color: #333;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
.logo {
  max-width: 150px;
  height: auto;
}
.header-text {
  text-align: center;
}
.header-text h2 {
  margin: 0;
  font-size: 1.5rem;
}
.header-text p {
  margin: 4px 0 0;
  font-size: 1rem;
}
.print-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  border-radius: 4px;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
}
.print-table th,
.print-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.print-table thead {
  background-color: #f2f2f2;
}
.loading-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

/* ✅ ADIÇÃO CIRÚRGICA: Estilos específicos para impressão */
@media print {
  .no-print {
    display: none;
  }
  @page {
    size: A4 landscape;
    margin: 2.5cm;
  }
  .print-page {
    padding: 0;
    font-size: 8pt;
  }
  .print-table th,
  .print-table td {
    padding: 6px;
  }
}
</style>
