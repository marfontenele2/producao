<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciar Solicitações de Insumos</h1>
    </header>

    <div v-if="carregando" class="carregando-container">
      <LoaderCircle :size="32" class="animate-spin" />
      <span>Buscando solicitações pendentes...</span>
    </div>

    <div v-else-if="solicitacoesPendentes.length === 0" class="conteudo-card">
      <p class="aviso-info">Nenhuma solicitação pendente no momento.</p>
    </div>

    <div v-else class="lista-solicitacoes">
      <div
        v-for="solicitacao in solicitacoesPendentes"
        :key="solicitacao.id"
        class="conteudo-card card-solicitacao"
      >
        <div class="cabecalho-solicitacao">
          <div>
            <h3 class="nome-equipe">{{ solicitacao.equipeNome }}</h3>
            <span class="info-adicional"
              >UBS: {{ solicitacao.ubsNome }} | Solicitado em:
              {{ formatarTimestamp(solicitacao.solicitadoEm) }}</span
            >
          </div>
          <span :class="['status-tag', `status-${solicitacao.status}`]">{{
            solicitacao.status
          }}</span>
        </div>

        <table class="tabela-padrao tabela-itens">
          <thead>
            <tr>
              <th>Item</th>
              <th class="coluna-numerica">Qtd. Solicitada</th>
              <th class="coluna-numerica">Qtd. Atendida</th>
              <th class="coluna-acao">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in solicitacao.itens" :key="`${item.testeId}-${item.marcaId}`">
              <td>{{ item.testeNome }} - {{ item.marcaNome }}</td>
              <td class="coluna-numerica">{{ item.caixasSolicitadas }} cx</td>
              <td class="coluna-numerica">{{ calcularTotalAtendido(item) }} cx</td>
              <td class="coluna-acao">
                <span v-if="isItemTotalmenteAtendido(item)" class="status-atendido-item">
                  <CheckCircle :size="16" /> Atendido
                </span>
                <button
                  v-else
                  class="botao botao-acao"
                  @click="abrirModalSelecao(solicitacao, item)"
                >
                  <PackageCheck :size="16" /> Atender Item
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <ModalSelecaoLote
    v-if="itemParaAtender"
    :item-solicitado="itemParaAtender"
    @fechar="fecharModal"
    @salvar="handleDispensarLote"
  />
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
  import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
  import { servicoSolicitacoes } from '@/modulos/enfermeiro/servicos/servicoSolicitacoes'
  import ModalSelecaoLote from '../componentes/ModalSelecaoLote.vue'
  import { LoaderCircle, CheckCircle, PackageCheck } from 'lucide-vue-next'

  const storeUsuario = useStoreUsuario()
  const storeNotificacoes = useStoreNotificacoes()

  const carregando = ref(true)
  const solicitacoesPendentes = ref([])
  const itemParaAtender = ref(null) // Controla a visibilidade do modal e passa os dados
  const solicitacaoAtiva = ref(null) // Armazena a solicitação pai do item que está sendo atendido

  let unsubscribe = null

  onMounted(() => {
    unsubscribe = servicoSolicitacoes.monitorarSolicitacoesPendentes((lista) => {
      solicitacoesPendentes.value = lista
      carregando.value = false
    })
  })

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  function abrirModalSelecao(solicitacao, item) {
    solicitacaoAtiva.value = solicitacao
    itemParaAtender.value = item
  }

  function fecharModal() {
    itemParaAtender.value = null
    solicitacaoAtiva.value = null
  }

  async function handleDispensarLote(loteEscolhido) {
    try {
      const payload = {
        solicitacaoId: solicitacaoAtiva.value.id,
        itemSolicitado: itemParaAtender.value,
        loteDispensado: loteEscolhido,
        caixasDispensadas: itemParaAtender.value.caixasSolicitadas, // Simplificação: atende o total do item por vez
        adminId: storeUsuario.usuario.uid,
      }

      await servicoSolicitacoes.atenderItemSolicitacao(payload)

      storeNotificacoes.mostrarNotificacao({
        tipo: 'sucesso',
        mensagem: `Item ${itemParaAtender.value.testeNome} atendido com sucesso!`,
      })
    } catch (error) {
      console.error('Erro ao dispensar lote:', error)
      storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: error.message })
    } finally {
      fecharModal()
    }
  }

  function calcularTotalAtendido(item) {
    return (item.dispensas || []).reduce((acc, dispensa) => acc + dispensa.caixasAtendidas, 0)
  }

  function isItemTotalmenteAtendido(item) {
    return calcularTotalAtendido(item) >= item.caixasSolicitadas
  }

  function formatarTimestamp(ts) {
    if (!ts || !ts.toDate) return 'N/D'
    return ts.toDate().toLocaleString('pt-BR')
  }
</script>

<style scoped>
  .carregando-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 4rem;
    font-size: 1.2rem;
    color: var(--cor-texto-padrao);
  }
  .aviso-info {
    text-align: center;
    padding: 2rem;
  }
  .lista-solicitacoes {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .cabecalho-solicitacao {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--cor-borda-suave);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
  .nome-equipe {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }
  .info-adicional {
    font-size: 0.85rem;
    color: #64748b;
  }
  .status-tag {
    padding: 4px 10px;
    border-radius: 99px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: capitalize;
  }
  .status-pendente,
  .status-parcialmente_atendido {
    background-color: #fef9c3;
    color: #854d0e;
  }
  .tabela-itens .coluna-numerica {
    text-align: center;
    width: 150px;
  }
  .tabela-itens .coluna-acao {
    text-align: center;
    width: 180px;
  }
  .status-atendido-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #166534;
    font-weight: 600;
  }
</style>
