<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Controle de Estoque</h1>
      <router-link :to="{ name: 'AdminEntradaEstoque' }" class="botao botao-primario">
        <PlusCircle :size="18" /> Nova Entrada de Lote
      </router-link>
    </header>

    <div class="abas-navegacao">
      <button
        @click="abaAtiva = 'solicitacoes'"
        :class="{ 'aba-ativa': abaAtiva === 'solicitacoes' }"
      >
        Solicitações Pendentes
        <span v-if="solicitacoesPendentes.length > 0" class="notificacao-contador">{{
          solicitacoesPendentes.length
        }}</span>
      </button>
      <button @click="abaAtiva = 'gerenciar'" :class="{ 'aba-ativa': abaAtiva === 'gerenciar' }">
        Gerenciar Estoque
      </button>
    </div>

    <div v-if="abaAtiva === 'solicitacoes'" class="conteudo-aba">
      <div v-if="carregando" class="mensagem-info">Carregando solicitações...</div>
      <div v-else-if="solicitacoesPendentes.length === 0" class="conteudo-card mensagem-info">
        Nenhuma solicitação pendente no momento.
      </div>
      <div v-else class="acordeao-container">
        <div
          v-for="solicitacao in solicitacoesPendentes"
          :key="solicitacao.id"
          class="acordeao-item"
        >
          <button class="acordeao-cabecalho" @click="toggleAcordeao(solicitacao.id)">
            <div class="info-cabecalho">
              <span
                ><strong>Equipe:</strong> {{ solicitacao.equipeNome }} ({{
                  solicitacao.ubsNome
                }})</span
              >
              <span><strong>Data:</strong> {{ formatarTimestamp(solicitacao.solicitadoEm) }}</span>
            </div>
            <ChevronDown :class="{ rotacionado: itemAberto === solicitacao.id }" :size="20" />
          </button>
          <div v-if="itemAberto === solicitacao.id" class="acordeao-conteudo">
            <table class="tabela-interna">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Solicitado</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in solicitacao.itens" :key="index">
                  <td>{{ item.testeNome }} - {{ item.marcaNome }}</td>
                  <td>
                    <strong>{{ item.caixasSolicitadas }} caixas</strong>
                    <span class="detalhe-unidades">({{ item.unidadesSolicitadas }} unidades)</span>
                  </td>
                  <td>
                    <button
                      class="botao-atender"
                      @click="atenderItem(solicitacao, item)"
                      :disabled="processando[solicitacao.id + item.marcaId]"
                    >
                      <Check :size="16" />
                      {{
                        processando[solicitacao.id + item.marcaId]
                          ? 'Processando...'
                          : 'Atender e Deduzir Estoque'
                      }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="abaAtiva === 'gerenciar'" class="conteudo-aba">
      <div class="conteudo-card">
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Teste</th>
              <th>Marca</th>
              <th>Lote</th>
              <th>Validade</th>
              <th class="coluna-numerica">Qtd. Atual (Unidades)</th>
              <th class="coluna-acao">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estoqueFiltrado.length === 0">
              <td colspan="6">Nenhum lote com estoque positivo cadastrado.</td>
            </tr>
            <tr v-for="lote in estoqueFiltrado" :key="lote.id">
              <td>{{ lote.testeNome }}</td>
              <td>{{ lote.marcaNome }}</td>
              <td>{{ lote.codigoLote }}</td>
              <td>{{ lote.dataValidade }}</td>
              <td class="coluna-numerica">{{ lote.quantidadeAtual }}</td>
              <td class="coluna-acao">
                <button class="botao-acao" @click="abrirModalAjuste(lote)">
                  <SlidersHorizontal :size="16" /> Ajustar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-conteudo">
        <h3 class="modal-titulo">Ajustar Quantidade de Lote</h3>
        <p v-if="loteParaAjuste" class="modal-subtitulo">
          <strong>Item:</strong> {{ loteParaAjuste.testeNome }} - {{ loteParaAjuste.marcaNome }}
          <br />
          <strong>Lote:</strong> {{ loteParaAjuste.codigoLote }} <br />
          <strong>Quantidade Atual:</strong> {{ loteParaAjuste.quantidadeAtual }} unidades
        </p>
        <form @submit.prevent="submeterAjusteEstoque">
          <div class="campo">
            <label for="quantidade-nova">Nova Quantidade (Unidades)</label>
            <input
              type="number"
              id="quantidade-nova"
              v-model.number="ajusteForm.quantidadeNova"
              min="0"
              required
            />
          </div>
          <div class="campo">
            <label for="motivo-ajuste">Motivo do Ajuste</label>
            <input
              type="text"
              id="motivo-ajuste"
              v-model.trim="ajusteForm.motivo"
              required
              placeholder="Ex: Contagem de inventário, perda..."
            />
          </div>
          <div class="modal-rodape">
            <button type="button" class="botao botao-acao" @click="fecharModal">Cancelar</button>
            <button
              type="submit"
              class="botao botao-primario"
              :disabled="!ajusteForm.motivo || ajustando"
            >
              {{ ajustando ? 'Salvando...' : 'Salvar Ajuste' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue' // ADICIONADO: computed
import { useRouter } from 'vue-router'
import { ChevronDown, Check, PlusCircle, SlidersHorizontal } from 'lucide-vue-next'
import { servicoSolicitacoes } from '@/modulos/enfermeiro/servicos/servicoSolicitacoes'
import { servicoEstoque } from '@/modulos/administrador/servicos/servicoEstoque'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

// Estado Geral
const carregando = ref(true)
const abaAtiva = ref('solicitacoes')

// Aba de Solicitações
const solicitacoesPendentes = ref([])
const itemAberto = ref(null)
const processando = ref({})

// Aba de Gerenciamento
const estoqueCompleto = ref([]) // Esta continuará recebendo TODOS os lotes do serviço
const isModalAberto = ref(false)
const ajustando = ref(false)
const loteParaAjuste = ref(null)
const ajusteForm = ref({ quantidadeNova: null, motivo: '' })

let unsubSolicitacoes = null
let unsubEstoque = null

// ===================================================================
// === A MÁGICA ESTÁ AQUI ===
// ===================================================================
/**
 * @JSDoc
 * Propriedade computada que cria uma nova lista contendo apenas
 * os lotes cujo estoque é maior que zero.
 */
const estoqueFiltrado = computed(() => {
  return estoqueCompleto.value.filter((lote) => lote.quantidadeAtual > 0)
})
// ===================================================================

onMounted(() => {
  unsubSolicitacoes = servicoSolicitacoes.monitorarSolicitacoesPendentes((lista) => {
    solicitacoesPendentes.value = lista
    carregando.value = false
  })
  unsubEstoque = servicoEstoque.monitorarEstoque((lista) => {
    estoqueCompleto.value = lista
  })
})

onUnmounted(() => {
  if (unsubSolicitacoes) unsubSolicitacoes()
  if (unsubEstoque) unsubEstoque()
})

// --- Funções da Aba de Solicitações ---

function toggleAcordeao(id) {
  itemAberto.value = itemAberto.value === id ? null : id
}

async function atenderItem(solicitacao, item) {
  const loteDisponivel = encontrarLoteParaDebitar(
    item.testeId,
    item.marcaId,
    item.unidadesSolicitadas,
  )

  if (!loteDisponivel) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Estoque insuficiente para ${item.unidadesSolicitadas} unidades de ${item.marcaNome}.`,
      tipo: 'erro',
    })
    return
  }

  if (
    !confirm(
      `Confirma a saída de ${item.unidadesSolicitadas} unidades de ${item.marcaNome} do lote ${loteDisponivel.codigoLote}?`,
    )
  ) {
    return
  }

  const processandoChave = solicitacao.id + item.marcaId
  processando.value[processandoChave] = true
  try {
    await servicoEstoque.registrarSaidaDeLote({
      lote: loteDisponivel,
      quantidadeSaida: item.unidadesSolicitadas,
      equipeDestino: {
        id: solicitacao.equipeId,
        nome: solicitacao.equipeNome,
        ubsId: solicitacao.ubsId,
      },
      idUsuarioAdmin: storeUsuario.usuario.uid,
    })

    await servicoSolicitacoes.marcarComoAtendida(solicitacao.id, storeUsuario.usuario.uid)

    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Saída de estoque registrada com sucesso!',
      tipo: 'sucesso',
    })
  } catch (error) {
    console.error('Erro ao atender item:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Erro ao processar saída: ${error.message}`,
      tipo: 'erro',
    })
  } finally {
    processando.value[processandoChave] = false
  }
}

function encontrarLoteParaDebitar(testeId, marcaId, quantidadeNecessaria) {
  // MODIFICADO: A busca pelo lote agora usa a lista filtrada para garantir que não pegue lotes zerados
  const lotesValidos = estoqueFiltrado.value
    .filter(
      (lote) =>
        lote.testeId === testeId &&
        lote.marcaId === marcaId &&
        lote.quantidadeAtual >= quantidadeNecessaria,
    )
    .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade)) // Ordena por validade mais próxima

  return lotesValidos.length > 0 ? lotesValidos[0] : null
}

// --- Funções da Aba de Gerenciamento e Modal ---

function abrirModalAjuste(lote) {
  loteParaAjuste.value = lote
  ajusteForm.value.quantidadeNova = lote.quantidadeAtual
  ajusteForm.value.motivo = ''
  isModalAberto.value = true
}

function fecharModal() {
  isModalAberto.value = false
  loteParaAjuste.value = null
}

async function submeterAjusteEstoque() {
  ajustando.value = true
  try {
    await servicoEstoque.ajustarEstoque({
      loteId: loteParaAjuste.value.id,
      quantidadeAnterior: loteParaAjuste.value.quantidadeAtual,
      quantidadeNova: ajusteForm.value.quantidadeNova,
      motivo: ajusteForm.value.motivo,
      adminId: storeUsuario.usuario.uid,
    })
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Estoque ajustado com sucesso!',
      tipo: 'sucesso',
    })
    fecharModal()
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Falha ao ajustar estoque: ${error.message}`,
      tipo: 'erro',
    })
  } finally {
    ajustando.value = false
  }
}

// --- Funções Auxiliares ---

const formatarTimestamp = (ts) => {
  if (!ts || !ts.toDate) return 'N/D'
  return ts.toDate().toLocaleString('pt-BR')
}
</script>

<style scoped>
/* Estilos das Abas */
.abas-navegacao {
  display: flex;
  border-bottom: 1px solid var(--cor-borda-suave);
  margin-bottom: 1.5rem;
}
.abas-navegacao button {
  position: relative;
  padding: 1rem 1.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}
.abas-navegacao button.aba-ativa {
  color: var(--cor-primaria);
  border-bottom-color: var(--cor-primaria);
}
.notificacao-contador {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ef4444;
  color: white;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
}

/* Estilos do Acordeão */
.acordeao-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.acordeao-item {
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  overflow: hidden;
}
.acordeao-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background-color: #f8fafc;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.acordeao-cabecalho:hover {
  background-color: #f1f5f9;
}
.info-cabecalho {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.info-cabecalho span {
  color: var(--cor-texto-secundario);
}
.info-cabecalho strong {
  color: var(--cor-texto-padrao);
}
.acordeao-conteudo {
  padding: 0;
}
.tabela-interna {
  width: 100%;
  border-collapse: collapse;
}
.tabela-interna th,
.tabela-interna td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.tabela-interna th {
  font-weight: 600;
  background-color: #f8fafc;
}
.tabela-interna tbody tr:last-child td {
  border-bottom: none;
}
.detalhe-unidades {
  font-size: 0.8rem;
  color: #64748b;
  margin-left: 0.5rem;
}
.botao-atender {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #16a34a;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f0fdf4;
  color: #15803d;
  font-weight: 600;
}
.botao-atender:hover:not(:disabled) {
  background-color: #dcfce7;
}
.botao-atender:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.rotacionado {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

/* Estilos Tabela de Estoque */
.coluna-numerica {
  text-align: right;
}
.coluna-acao {
  text-align: center;
  width: 120px;
}

/* Estilos do Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-conteudo {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}
.modal-titulo {
  margin-top: 0;
  font-size: 1.5rem;
}
.modal-subtitulo {
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.5;
  border: 1px solid var(--cor-borda-suave);
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
