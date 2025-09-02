<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Solicitação de Insumos</h1>
    </header>

    <div class="abas-navegacao">
      <button
        @click="abaAtiva = 'solicitacao'"
        :class="{ 'aba-ativa': abaAtiva === 'solicitacao' }"
      >
        Fazer Nova Solicitação
      </button>
      <button @click="abaAtiva = 'historico'" :class="{ 'aba-ativa': abaAtiva === 'historico' }">
        Minhas Solicitações
      </button>
    </div>

    <div v-if="abaAtiva === 'solicitacao'" class="conteudo-card">
      <div v-if="carregando" class="mensagem-info">Carregando estoque disponível...</div>
      <div v-else>
        <p class="secao-descricao">
          Informe o número de <strong>caixas</strong> que deseja solicitar para cada item. Apenas
          itens com estoque e cadastro completo (unidades por caixa) aparecem na lista.
        </p>
        <table class="tabela-padrao tabela-solicitacao">
          <thead>
            <tr>
              <th>Tipo de Teste</th>
              <th>Marca Comercial</th>
              <th class="coluna-numerica">Testes / Caixa</th>
              <th class="coluna-numerica">Estoque Disponível</th>
              <th class="coluna-solicitar">Caixas a Solicitar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estoqueConsolidado.length === 0">
              <td colspan="5">Nenhum item com estoque disponível para solicitação no momento.</td>
            </tr>
            <tr v-for="item in estoqueConsolidado" :key="item.chave">
              <td>{{ item.testeNome }}</td>
              <td>{{ item.marcaNome }}</td>
              <td class="coluna-numerica">{{ item.quantidadePorCaixa }}</td>
              <td class="coluna-numerica">
                <strong>{{ item.totalDisponivelCaixas }} caixas</strong>
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  :max="item.totalDisponivelCaixas"
                  v-model.number="solicitacaoInputs[item.chave]"
                  @input="limparNumeroNegativo(item.chave)"
                  :disabled="item.totalDisponivelCaixas === 0"
                  placeholder="0"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="rodape-formulario">
          <button
            class="botao botao-primario"
            @click="submeterSolicitacao"
            :disabled="!isSolicitacaoValida || enviando"
          >
            <Send :size="18" />
            {{ enviando ? 'Enviando...' : 'Confirmar Solicitação' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="abaAtiva === 'historico'" class="conteudo-card">
      <h2 class="secao-titulo">Histórico de Solicitações da Equipe</h2>
      <table class="tabela-padrao">
        <thead>
          <tr>
            <th>Data</th>
            <th>Itens Solicitados</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="historicoPaginado.length === 0">
            <td colspan="3">Nenhuma solicitação encontrada para sua equipe.</td>
          </tr>
          <tr v-for="solicitacao in historicoPaginado" :key="solicitacao.id">
            <td>{{ formatarTimestamp(solicitacao.solicitadoEm) }}</td>
            <td>
              <ul class="lista-itens">
                <li v-for="(item, index) in solicitacao.itens" :key="index">
                  {{ item.caixasSolicitadas }} caixa(s) de {{ item.testeNome }} -
                  {{ item.marcaNome }}
                </li>
              </ul>
            </td>
            <td>
              <span :class="['status-tag', `status-${solicitacao.status}`]">{{
                solicitacao.status
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="totalPaginasHistorico > 1" class="paginacao-container">
        <button class="botao-acao" @click="paginaAnterior" :disabled="paginaAtualHistorico === 1">
          Anterior
        </button>
        <span>Página {{ paginaAtualHistorico }} de {{ totalPaginasHistorico }}</span>
        <button
          class="botao-acao"
          @click="proximaPagina"
          :disabled="paginaAtualHistorico === totalPaginasHistorico"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoEstoque } from '@/modulos/administrador/servicos/servicoEstoque'
import { servicoSolicitacoes } from '../servicos/servicoSolicitacoes'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { Send } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const estoqueBruto = ref([])
const carregando = ref(true)
const enviando = ref(false)

const solicitacaoInputs = ref({})
const historicoSolicitacoes = ref([])

const abaAtiva = ref('solicitacao')
const paginaAtualHistorico = ref(1)
const itensPorPagina = ref(15)

let unsubEstoque = null
let unsubSolicitacoes = null

onMounted(() => {
  const equipeId = storeUsuario.usuario?.equipeId
  if (equipeId) {
    unsubEstoque = servicoEstoque.monitorarEstoque((lista) => {
      estoqueBruto.value = lista
      carregando.value = false
    })
    unsubSolicitacoes = servicoSolicitacoes.monitorarSolicitacoesPorEquipe(equipeId, (lista) => {
      historicoSolicitacoes.value = lista
    })
  }
})

onUnmounted(() => {
  if (unsubEstoque) unsubEstoque()
  if (unsubSolicitacoes) unsubSolicitacoes()
})

const estoqueConsolidado = computed(() => {
  const agrupado = estoqueBruto.value.reduce((acc, lote) => {
    const chave = `${lote.testeId}_${lote.marcaId}`
    if (!acc[chave]) {
      acc[chave] = {
        chave,
        testeId: lote.testeId,
        testeNome: lote.testeNome,
        marcaId: lote.marcaId,
        marcaNome: lote.marcaNome,
        quantidadePorCaixa: Number(lote.quantidadePorCaixa) || 0,
        totalDisponivelUnidades: 0,
      }
      if (solicitacaoInputs.value[chave] === undefined) {
        solicitacaoInputs.value[chave] = 0
      }
    }
    acc[chave].totalDisponivelUnidades += lote.quantidadeAtual
    return acc
  }, {})

  return (
    Object.values(agrupado)
      // ADIÇÃO CIRÚRGICA: Impede que itens com cadastro errado (sem qtd/caixa) sejam solicitados
      .filter((item) => item.quantidadePorCaixa > 0)
      .map((item) => ({
        ...item,
        totalDisponivelCaixas:
          item.quantidadePorCaixa > 0
            ? Math.floor(item.totalDisponivelUnidades / item.quantidadePorCaixa)
            : 0,
      }))
      .filter((item) => item.totalDisponivelCaixas > 0)
  )
})

const isSolicitacaoValida = computed(() => {
  return Object.values(solicitacaoInputs.value).some((val) => val > 0)
})

const totalPaginasHistorico = computed(() => {
  return Math.ceil(historicoSolicitacoes.value.length / itensPorPagina.value)
})

const historicoPaginado = computed(() => {
  const inicio = (paginaAtualHistorico.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return historicoSolicitacoes.value.slice(inicio, fim)
})

function proximaPagina() {
  if (paginaAtualHistorico.value < totalPaginasHistorico.value) {
    paginaAtualHistorico.value++
  }
}
function paginaAnterior() {
  if (paginaAtualHistorico.value > 1) {
    paginaAtualHistorico.value--
  }
}

async function submeterSolicitacao() {
  enviando.value = true
  try {
    const itensParaEnviar = estoqueConsolidado.value
      .filter((item) => solicitacaoInputs.value[item.chave] > 0)
      .map((item) => ({
        testeId: item.testeId,
        testeNome: item.testeNome,
        marcaId: item.marcaId,
        marcaNome: item.marcaNome,
        caixasSolicitadas: solicitacaoInputs.value[item.chave],
        unidadesSolicitadas: solicitacaoInputs.value[item.chave] * item.quantidadePorCaixa,
        quantidadePorCaixa: item.quantidadePorCaixa, // Enviando o multiplicador para referência
      }))

    if (itensParaEnviar.length === 0) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: 'Nenhum item foi solicitado.',
        tipo: 'alerta',
      })
      return
    }

    await servicoSolicitacoes.criarSolicitacao(itensParaEnviar)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Solicitação enviada com sucesso!',
      tipo: 'sucesso',
    })

    solicitacaoInputs.value = {}
  } catch (error) {
    console.error('Erro ao criar solicitação:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao enviar a solicitação.',
      tipo: 'erro',
    })
  } finally {
    enviando.value = false
  }
}

const formatarTimestamp = (ts) => {
  if (!ts || !ts.toDate) return 'N/D'
  return ts.toDate().toLocaleString('pt-BR')
}

function limparNumeroNegativo(chave) {
  if (solicitacaoInputs.value[chave] < 0) {
    solicitacaoInputs.value[chave] = 0
  }
}
</script>

<style scoped>
.abas-navegacao {
  display: flex;
  border-bottom: 1px solid var(--cor-borda-suave);
  margin-bottom: 1.5rem;
}
.abas-navegacao button {
  padding: 1rem 1.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: var(--cor-texto-secundario);
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}
.abas-navegacao button.aba-ativa {
  color: var(--cor-primaria);
  border-bottom-color: var(--cor-primaria);
}
.secao-titulo {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
.lista-itens {
  padding-left: 20px;
  margin: 0;
}
.status-tag {
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: capitalize;
}
.status-pendente {
  background-color: #fef9c3;
  color: #854d0e;
}
.status-atendido {
  background-color: #dcfce7;
  color: #166534;
}
.paginacao-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--cor-borda-suave);
}
.paginacao-container span {
  font-size: 0.9rem;
  font-weight: 500;
}
.secao-descricao {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--cor-texto-secundario);
}
.tabela-solicitacao th.coluna-numerica,
.tabela-solicitacao td.coluna-numerica {
  text-align: center;
}
.tabela-solicitacao th.coluna-solicitar {
  width: 200px;
  text-align: center;
}
.tabela-solicitacao input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
}
.rodape-formulario {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--cor-borda-suave);
}
</style>
