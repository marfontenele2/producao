<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Central de Impressões (Admin)</h1>
    </header>
    <div class="conteudo-card">
      <h2 class="secao-titulo">Relatórios Semanais</h2>
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('AdminImpressaoMDDA')">
          <BarChart3 :size="32" />
          <span class="card-titulo">Relatório Semanal (MDDA)</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoNotificacao')">
          <FileWarning :size="32" />
          <span class="card-titulo">Notificação Semanal</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoSarampo')">
          <ClipboardX :size="32" />
          <span class="card-titulo">Controle de Sarampo</span>
        </div>
      </div>

      <h2 class="secao-titulo">Relatórios Mensais</h2>
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('AdminImpressaoSCNES')">
          <ClipboardList :size="32" />
          <span class="card-titulo">Relatório de Profissionais (SCNES)</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoSaudeMental')">
          <BrainCircuit :size="32" />
          <span class="card-titulo">Acompanhamento de Saúde Mental</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoCronograma')">
          <CalendarClock :size="32" />
          <span class="card-titulo">Consolidado de Cronogramas</span>
        </div>

        <div class="card-impressao" @click="navegarPara('AdminImpressaoAdolescente')">
          <Bot :size="32" />
          <span class="card-titulo">Saúde do Adolescente</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoSuplementos')">
          <ShieldPlus :size="32" />
          <span class="card-titulo">Acompanhamento de Suplementos</span>
        </div>
        <div class="card-impressao" @click="navegarPara('AdminImpressaoGestantes')">
          <Baby :size="32" />
          <span class="card-titulo">Acompanhamento de Gestantes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  BarChart3,
  FileWarning,
  ClipboardX,
  ClipboardList,
  BrainCircuit,
  CalendarClock,
  // NOVOS ÍCONES ADICIONADOS
  Bot,
  ShieldPlus,
  Baby,
} from 'lucide-vue-next'

const router = useRouter()
function navegarPara(nomeRota) {
  router.push({ name: nomeRota })
}
</script>

<style scoped>
.secao-titulo {
  font-size: 1.5rem;
  margin-top: 2.5rem;
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
.card-desabilitado {
  cursor: not-allowed;
  background-color: #f1f5f9;
  opacity: 0.6;
  color: #64748b;
}
.card-desabilitado:hover {
  border-color: var(--cor-borda-suave);
  color: #64748b;
  transform: none;
  box-shadow: none;
}
</style>
