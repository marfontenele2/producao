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
            <th>Mobilização</th>
            <th>Pré-Natal</th>
            <th>Rotina</th>
            <th>Treinamentos</th>
            <th>Total Realizados</th>
            <th>Reagentes</th>
            <th>Inválidos</th>
            <th>Perdidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="relatorioGeral.length === 0">
            <td colspan="10">Nenhum dado encontrado para esta competência.</td>
          </tr>
          <tr v-for="item in relatorioGeral" :key="item.id">
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>{{ item.realizados.mobilizacao }}</td>
            <td>{{ item.realizados.preNatal }}</td>
            <td>{{ item.realizados.rotina }}</td>
            <td>{{ item.realizados.treinamentos }}</td>
            <td>
              <strong>{{ item.totalRealizados }}</strong>
            </td>
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
            <th>Total Realizados</th>
            <th>Reagentes</th>
            <th>Inválidos</th>
            <th>Perdidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="relatorioPorEquipe.length === 0">
            <td colspan="8">Nenhum dado encontrado para esta competência.</td>
          </tr>
          <tr v-for="item in relatorioPorEquipe" :key="item.id">
            <td>{{ item.ubsNome }}</td>
            <td>{{ item.equipeNome }}</td>
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>
              {{
                item.realizados.mobilizacao +
                item.realizados.preNatal +
                item.realizados.rotina +
                item.realizados.treinamentos
              }}
            </td>
            <td>{{ item.reagentes }}</td>
            <td>{{ item.invalidos }}</td>
            <td>{{ item.perdidos }}</td>
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
import { ref, computed, onMounted, watch } from 'vue'
import { servicoRelatoriosBoletim } from '../servicos/servicoRelatoriosBoletim.js'

const competencia = ref(new Date().toISOString().slice(0, 7))
const carregando = ref(false)
const tipoRelatorio = ref('geral')
const relatorioBase = ref([])

const relatorioGeral = computed(() => {
  const consolidado = new Map()
  relatorioBase.value.forEach((item) => {
    const key = `${item.testeNome}-${item.marcaNome}`
    if (!consolidado.has(key)) {
      // Clona o item para não modificar o relatorioBase original
      consolidado.set(key, JSON.parse(JSON.stringify({ ...item, id: key })))
    } else {
      const entry = consolidado.get(key)
      // Soma cada sub-categoria de 'realizados'
      entry.realizados.mobilizacao += item.realizados.mobilizacao
      entry.realizados.preNatal += item.realizados.preNatal
      entry.realizados.rotina += item.realizados.rotina
      entry.realizados.treinamentos += item.realizados.treinamentos

      entry.reagentes += item.reagentes
      entry.invalidos += item.invalidos
      entry.perdidos += item.perdidos
    }
  })

  const resultadoFinal = Array.from(consolidado.values())
  // Calcula o total de realizados para cada linha
  resultadoFinal.forEach((item) => {
    item.totalRealizados = Object.values(item.realizados).reduce((soma, v) => soma + v, 0)
  })

  return resultadoFinal
})

const relatorioPorEquipe = computed(() => {
  return [...relatorioBase.value].sort((a, b) => {
    if (a.equipeNome < b.equipeNome) return -1
    if (a.equipeNome > b.equipeNome) return 1
    if (a.testeNome < b.testeNome) return -1
    if (a.testeNome > b.testeNome) return 1
    return 0
  })
})

const relatorioDetalhado = computed(() => {
  const detalhes = []
  relatorioBase.value.forEach((item) => {
    if (item.detalhesPerdas) {
      detalhes.push(...item.detalhesPerdas.map((p) => ({ ...p, tipo: 'Perda' })))
    }
    if (item.detalhesInvalidos) {
      detalhes.push(...item.detalhesInvalidos.map((i) => ({ ...i, tipo: 'Inválido' })))
    }
  })
  return detalhes
})

async function buscarRelatorio() {
  carregando.value = true
  relatorioBase.value = []
  try {
    relatorioBase.value = await servicoRelatoriosBoletim.gerarRelatorioBase(competencia.value)
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    alert('Falha ao gerar relatório.')
  } finally {
    carregando.value = false
  }
}

watch(tipoRelatorio, () => {
  if (relatorioBase.value.length === 0 && !carregando.value) {
    buscarRelatorio()
  }
})

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
.grupo-formulario label {
  margin-right: 1rem;
}
.grupo-formulario input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
  font-size: 1rem;
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
.mensagem-info {
  text-align: center;
  padding: 2rem;
  color: var(--cor-texto-secundario);
}
.tabela-padrao {
  font-size: 0.9rem;
}
</style>
