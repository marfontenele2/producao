<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Central de Impressões (Gerente)</h1>
    </header>
    <div class="conteudo-card">
      <h2 class="secao-titulo">Relatórios Mensais</h2>
      <div class="grid-cards">
        <div class="card-impressao" @click="navegarPara('GerenteImpressaoSCNES')">
          <Users :size="32" />
          <span class="card-titulo">Relatório de Profissionais (SCNES)</span>
        </div>
        <div class="card-impressao" @click="navegarPara('GerenteImpressaoSaudeMental')">
          <BrainCircuit :size="32" />
          <span class="card-titulo">Acompanhamento de Saúde Mental</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
// ADICIONADO: Novo ícone
import { Users, BrainCircuit } from 'lucide-vue-next'

const router = useRouter()
function navegarPara(nomeRota) {
  router.push({ name: nomeRota })
}
</script>

<style scoped>
/* Estilos permanecem os mesmos */
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
</style>
