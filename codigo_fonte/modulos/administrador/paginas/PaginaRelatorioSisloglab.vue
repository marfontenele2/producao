<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Relatório Consolidado (Estilo SISLOGLAB)</h1>
      <button
        v-if="dadosRelatorio && !statusCompetencia.fechada"
        class="botao botao-primario"
        @click="fecharCompetenciaAtual"
        :disabled="finalizando"
      >
        <CheckCircle :size="18" />
        {{ finalizando ? 'Finalizando...' : `Finalizar Competência de ${competenciaFormatada}` }}
      </button>
      <div v-if="statusCompetencia.fechada" class="status-fechada">
        <CheckCircle :size="18" /> Competência Finalizada
      </div>
    </header>

    <div class="card-filtros">
      <div class="campo">
        <label for="competencia">Selecione a Competência</label>
        <input type="month" id="competencia" v-model="competencia" @change="aoMudarCompetencia" />
      </div>
      <button
        class="botao botao-primario"
        @click="gerarRelatorio"
        :disabled="!competencia || carregando"
      >
        <FileSearch :size="18" />
        {{ carregando ? 'Gerando...' : 'Gerar Relatório' }}
      </button>
    </div>

    <div v-if="carregando" class="conteudo-card" style="margin-top: 1.5rem; text-align: center">
      <p>Aguarde, consolidando dados de múltiplas fontes...</p>
    </div>

    <div v-if="!carregando && erro" class="conteudo-card aviso-erro" style="margin-top: 1.5rem">
      <p>{{ erro }}</p>
    </div>

    <div
      v-if="!carregando && dadosRelatorio && dadosRelatorio.length === 0"
      class="conteudo-card"
      style="margin-top: 1.5rem"
    >
      <p>Nenhum insumo movimentado ou encontrado no catálogo para a competência selecionada.</p>
    </div>

    <div
      v-if="!carregando && dadosRelatorio && dadosRelatorio.length > 0"
      class="relatorio-container"
    >
      <div v-for="insumo in dadosRelatorio" :key="insumo.chave" class="conteudo-card card-insumo">
        <h2 class="insumo-titulo">{{ insumo.testeNome }} - {{ insumo.marcaNome }}</h2>
        <div class="grid-relatorio">
          <div class="bloco-relatorio">
            <h3 class="bloco-titulo">Balanço (em Caixas)</h3>
            <div class="item-relatorio">
              <span>Saldo Inicial:</span> <strong>{{ insumo.saldoInicial }}</strong>
            </div>
            <div class="item-relatorio">
              <span>Saldo Final:</span> <strong>{{ insumo.saldoFinal }}</strong>
            </div>
          </div>
          <div class="bloco-relatorio">
            <h3 class="bloco-titulo">Entradas (em Caixas)</h3>
            <div class="item-relatorio">
              <span>Recebido (Compras):</span> <strong>{{ insumo.entradas.recebido }}</strong>
            </div>
            <div class="item-relatorio">
              <span>Ajuste (Positivo):</span> <strong>{{ insumo.entradas.ajuste }}</strong>
            </div>
          </div>
          <div class="bloco-relatorio">
            <h3 class="bloco-titulo">Saídas (em Caixas)</h3>
            <div class="item-relatorio">
              <span>Consumido (Entregue):</span> <strong>{{ insumo.saidas.consumido }}</strong>
            </div>
            <div class="item-relatorio">
              <span>Ajuste (Negativo):</span> <strong>{{ insumo.saidas.ajuste }}</strong>
            </div>
          </div>
          <div class="bloco-relatorio">
            <h3 class="bloco-titulo">Ressuprimento (Sugestão)</h3>
            <div class="item-relatorio">
              <span>Sugestão de Pedido:</span> <strong>{{ insumo.ressuprimento }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileSearch, CheckCircle } from 'lucide-vue-next'
// MODIFICADO: Importa os serviços necessários
import { servicoRelatorios } from '../servicos/servicoRelatorios'
import { servicoCompetencia } from '../servicos/servicoCompetencia'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'

const competencia = ref('')
const carregando = ref(false)
const erro = ref('')
const dadosRelatorio = ref(null)
const finalizando = ref(false)
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()
const statusCompetencia = ref({ fechada: false, dados: null })

function aoMudarCompetencia() {
  dadosRelatorio.value = null
  statusCompetencia.value.fechada = false
}

const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  const data = new Date(ano, parseInt(mes, 10) - 1)
  return data.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
})

// ===================================================================
// === A MÁGICA ESTÁ AQUI: A LÓGICA COMPLEXA FOI REMOVIDA ===
// ===================================================================
async function gerarRelatorio() {
  carregando.value = true
  erro.value = ''
  dadosRelatorio.value = null

  try {
    // 1. Chama o serviço que agora faz todo o trabalho pesado
    dadosRelatorio.value = await servicoRelatorios.gerarRelatorioConsolidado(competencia.value)

    // 2. Busca o status da competência (se já foi fechada)
    const dadosFechados = await servicoCompetencia.buscarCompetenciaFechada(competencia.value)
    statusCompetencia.value = { fechada: !!dadosFechados, dados: dadosFechados }
  } catch (e) {
    console.error('Erro ao gerar relatório:', e)
    erro.value = `Falha ao gerar o relatório: ${e.message}`
    dadosRelatorio.value = [] // Garante que a mensagem de "nenhum item" não apareça em caso de erro
  } finally {
    carregando.value = false
  }
}
// ===================================================================

async function fecharCompetenciaAtual() {
  if (
    !dadosRelatorio.value ||
    !confirm(
      `Tem certeza que deseja finalizar a competência de ${competenciaFormatada.value}? Esta ação não pode ser desfeita.`,
    )
  ) {
    return
  }
  finalizando.value = true
  try {
    await servicoCompetencia.fecharCompetencia(
      competencia.value,
      dadosRelatorio.value,
      storeUsuario.usuario.uid,
    )
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Competência finalizada com sucesso!',
      tipo: 'sucesso',
    })
    statusCompetencia.value.fechada = true
  } catch (error) {
    console.error('Erro ao finalizar competência:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Falha ao finalizar: ${error.message}`,
      tipo: 'erro',
    })
  } finally {
    finalizando.value = false
  }
}
</script>

<style scoped>
/* Estilos permanecem os mesmos */
.status-fechada {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 18px;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-weight: 600;
}
.relatorio-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.card-insumo {
  padding: 1.5rem;
}
.insumo-titulo {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 1rem;
}
.grid-relatorio {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem 2.5rem;
}
.bloco-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cor-primaria);
  margin-top: 0;
  margin-bottom: 0.75rem;
}
.item-relatorio {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}
.aviso-erro {
  color: #b91c1c;
  font-weight: 500;
  background-color: #fee2e2;
  padding: 1rem;
  border-radius: 6px;
}
</style>
