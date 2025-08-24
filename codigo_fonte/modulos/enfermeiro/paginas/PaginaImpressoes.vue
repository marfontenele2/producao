<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Central de Impressões</h1>
    </header>
    <div class="conteudo-card">
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoBpa')">
          <ClipboardList :size="32" />
          <span class="card-titulo">Boletim de Produção (BPA)</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoAdolescente')">
          <Printer :size="32" />
          <span class="card-titulo">Relatório Mensal do Adolescente</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoSuplementos')">
          <FileSpreadsheet :size="32" />
          <span class="card-titulo">Relatório Mensal de Suplementos</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Printer, FileSpreadsheet, ClipboardList } from 'lucide-vue-next' // Ícone adicionado
const router = useRouter()
function navegarPara(nomeRota) {
  router.push({ name: nomeRota })
}
</script>

<style scoped>
.grid-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.card-impressao {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #f8fafc;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  padding: 2rem;
  min-width: 250px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.card-impressao:hover {
  border-color: var(--cor-primaria);
  color: var(--cor-primaria);
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.card-titulo {
  font-weight: 600;
}
</style>
