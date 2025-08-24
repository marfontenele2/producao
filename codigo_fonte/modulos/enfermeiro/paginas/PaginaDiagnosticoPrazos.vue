<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Ferramenta de Diagnóstico de Prazos</h1>
    </header>
    <div class="conteudo-card">
      <p>
        Copie o conteúdo completo das caixas abaixo e envie para análise. Isso nos mostrará
        exatamente como os dados de prazo estão estruturados no banco de dados.
      </p>

      <div class="diagnostico-secao">
        <h2>Prazos MENSAIS (Dados Brutos da Competência Atual)</h2>
        <pre class="codigo-bloco">{{ prazosMensais }}</pre>
      </div>

      <div class="diagnostico-secao">
        <h2>Prazos SEMANAIS (Dados Brutos)</h2>
        <pre class="codigo-bloco">{{ prazosSemanais }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { servicoPrazos } from '@/modulos/administrador/servicos/servicoPrazos'
import { servicoPrazosSemanais } from '@/modulos/administrador/servicos/servicoPrazosSemanais'

const prazosMensais = ref('Carregando...')
const prazosSemanais = ref('Carregando...')

onMounted(() => {
  const hoje = new Date()
  const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  const unsubMensal = servicoPrazos.monitorarPrazosDoMes(competenciaAtual, (dados) => {
    prazosMensais.value = JSON.stringify(dados, null, 2) // Formata o JSON para leitura
    unsubMensal()
  })

  const unsubSemanal = servicoPrazosSemanais.monitorarPrazos((dados) => {
    prazosSemanais.value = JSON.stringify(dados, null, 2) // Formata o JSON para leitura
    unsubSemanal()
  })
})
</script>

<style scoped>
.diagnostico-secao {
  margin-top: 2rem;
}
.diagnostico-secao h2 {
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.codigo-bloco {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap; /* Garante a quebra de linha */
  word-wrap: break-word;
  font-family: monospace;
}
</style>
