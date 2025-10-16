<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Central de Impressões</h1>
    </header>
    <div class="conteudo-card">
      <h2 class="secao-titulo">Relatórios Mensais</h2>
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoBoletim')">
          <ClipboardList :size="32" />
          <span class="card-titulo">Boletim de Testes Rápidos</span>
        </div>
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
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoEducacaoPermanente')">
          <Presentation :size="32" />
          <span class="card-titulo">Relatório de Educação Permanente</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoGestantes')">
          <Baby :size="32" />
          <span class="card-titulo">Consolidado de Gestantes</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoCronograma')">
          <CalendarDays :size="32" />
          <span class="card-titulo">Cronograma da Equipe</span>
        </div>
      </div>

      <h2 class="secao-titulo">Relatórios Semanais</h2>
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoMDDA')">
          <BarChart3 :size="32" />
          <span class="card-titulo">Relatório Semanal (MDDA)</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoNotificacao')">
          <FileWarning :size="32" />
          <span class="card-titulo">Notificação Semanal</span>
        </div>
        <div class="card-impressao" @click="navegarPara('EnfermeiroImpressaoSarampo')">
          <ClipboardX :size="32" />
          <span class="card-titulo">Controle de Sarampo</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Printer,
  FileSpreadsheet,
  ClipboardList,
  Presentation,
  Baby,
  CalendarDays, // Adicionado
  BarChart3,
  FileWarning,
  ClipboardX,
} from 'lucide-vue-next'

const router = useRouter()
function navegarPara(nomeRota) {
  router.push({ name: nomeRota })
}
</script>

<style scoped>
.secao-titulo {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.secao-titulo:first-of-type {
  margin-top: 0;
}
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
  width: 250px;
  height: 150px;
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
