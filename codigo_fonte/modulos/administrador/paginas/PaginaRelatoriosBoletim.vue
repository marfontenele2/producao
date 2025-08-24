<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Relatórios do Boletim de Testes Rápidos</h1>
    </header>

    <div class="conteudo-card">
      <div class="filtros">
        <div class="grupo-formulario">
          <label for="competencia">Selecione a Competência (Mês/Ano):</label>
          <input id="competencia" type="month" v-model="competencia" @change="buscarRelatorio" />
        </div>
        <div class="botoes-relatorio">
          <button @click="tipoRelatorio = 'geral'" :class="{ ativo: tipoRelatorio === 'geral' }">
            Geral
          </button>
          <button @click="tipoRelatorio = 'equipe'" :class="{ ativo: tipoRelatorio === 'equipe' }">
            Por Equipe
          </button>
          <button
            @click="tipoRelatorio = 'detalhado'"
            :class="{ ativo: tipoRelatorio === 'detalhado' }"
          >
            Perdas/Inválidos
          </button>
        </div>
      </div>

      <div v-if="carregando" class="mensagem-info">Gerando relatório...</div>

      <table v-if="!carregando && tipoRelatorio === 'geral'" class="tabela-padrao">
        <thead>
          <tr>
            <th>Teste</th>
            <th>Marca</th>
            <th>Realizados</th>
            <th>Reagentes</th>
            <th>Inválidos</th>
            <th>Perdidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="relatorioGeral.length === 0">
            <td colspan="6">Nenhum dado encontrado para esta competência.</td>
          </tr>
          <tr v-for="item in relatorioGeral" :key="item.id">
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>{{ item.realizados }}</td>
            <td>{{ item.reagentes }}</td>
            <td>{{ item.invalidos }}</td>
            <td>{{ item.perdidos }}</td>
          </tr>
        </tbody>
      </table>

      <table v-if="!carregando && tipoRelatorio === 'equipe'" class="tabela-padrao">
        <thead>
          <tr>
            <th>UBS</th>
            <th>Equipe</th>
            <th>Teste</th>
            <th>Marca</th>
            <th>Realizados</th>
            <th>Reagentes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="relatorioBase.length === 0">
            <td colspan="6">Nenhum dado encontrado para esta competência.</td>
          </tr>
          <tr v-for="item in relatorioBase" :key="item.id">
            <td>{{ item.ubsNome }}</td>
            <td>{{ item.equipeNome }}</td>
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>{{ item.realizados }}</td>
            <td>{{ item.reagentes }}</td>
          </tr>
        </tbody>
      </table>

      <table v-if="!carregando && tipoRelatorio === 'detalhado'" class="tabela-padrao">
        <thead>
          <tr>
            <th>UBS</th>
            <th>Equipe</th>
            <th>Teste</th>
            <th>Marca</th>
            <th>Tipo</th>
            <th>Qtd.</th>
            <th>Lote</th>
            <th>Motivo/Obs.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="relatorioDetalhado.length === 0">
            <td colspan="8">Nenhuma perda ou teste inválido reportado.</td>
          </tr>
          <tr v-for="(item, index) in relatorioDetalhado" :key="index">
            <td>{{ item.ubsNome }}</td>
            <td>{{ item.equipeNome }}</td>
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>{{ item.tipo }}</td>
            <td>{{ item.quantidade }}</td>
            <td>{{ item.lote }}</td>
            <td>{{ item.motivo || item.descricao || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { servicoRelatoriosBoletim } from '../servicos/servicoRelatoriosBoletim.js'

const competencia = ref(new Date().toISOString().slice(0, 7))
const carregando = ref(false)
const tipoRelatorio = ref('geral') // 'geral', 'equipe', 'detalhado'
const relatorioBase = ref([])

const relatorioGeral = computed(() => {
  const consolidado = new Map()
  relatorioBase.value.forEach((item) => {
    const key = `${item.testeNome}-${item.marcaNome}`
    if (!consolidado.has(key)) {
      consolidado.set(key, { ...item, id: key })
    } else {
      const entry = consolidado.get(key)
      entry.realizados += item.realizados
      entry.reagentes += item.reagentes
      entry.invalidos += item.invalidos
      entry.perdidos += item.perdidos
    }
  })
  return Array.from(consolidado.values())
})

const relatorioDetalhado = computed(() => {
  const detalhes = []
  relatorioBase.value.forEach((item) => {
    item.detalhesPerdas.forEach((p) => detalhes.push({ ...p, tipo: 'Perda' }))
    item.detalhesInvalidos.forEach((i) => detalhes.push({ ...i, tipo: 'Inválido' }))
  })
  return detalhes
})

async function buscarRelatorio() {
  carregando.value = true
  relatorioBase.value = []
  try {
    relatorioBase.value = await servicoRelatoriosBoletim.gerarRelatorioBasePorEquipe(
      competencia.value,
    )
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    alert('Falha ao gerar relatório.')
  } finally {
    carregando.value = false
  }
}

onMounted(buscarRelatorio)
</script>

<style scoped>
.filtros {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.seletor-competencia input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
  font-size: 1rem;
  margin-left: 1rem;
}
.botoes-relatorio button {
  padding: 8px 16px;
  margin-left: 10px;
  border: 1px solid var(--cor-primaria);
  background-color: transparent;
  color: var(--cor-primaria);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.botoes-relatorio button:hover {
  background-color: #e0e7ff;
}
.botoes-relatorio button.ativo {
  background-color: var(--cor-primaria);
  color: white;
}
</style>
