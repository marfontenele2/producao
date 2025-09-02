<template>
  <div class="modal-backdrop" @click.self="fechar">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Atender Solicitação: {{ solicitacao.equipeNome }}</h2>
        <button class="botao-fechar" @click="fechar"><X :size="24" /></button>
      </header>

      <main class="modal-corpo">
        <form id="form-atendimento" @submit.prevent="submeterAtendimento">
          <div
            v-for="itemSolicitado in itensParaAtender"
            :key="itemSolicitado.chave"
            class="item-solicitado-container"
          >
            <div class="item-header">
              <h3>{{ itemSolicitado.testeNome }} - {{ itemSolicitado.marcaNome }}</h3>
              <span class="total-solicitado" :class="classeStatusAtendimento(itemSolicitado)">
                Solicitado: <strong>{{ itemSolicitado.caixasSolicitadas }} cx</strong> ({{
                  itemSolicitado.unidadesSolicitadas
                }}
                un) | Atendido: {{ itemSolicitado.totalAtendido }} un
              </span>
            </div>
            <p v-if="itemSolicitado.lotesDisponiveis.length === 0" class="aviso-erro">
              Alerta: Não há lotes disponíveis no estoque para este item.
            </p>
            <table v-else class="tabela-lotes">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Validade</th>
                  <th>Disponível</th>
                  <th>Quantidade a Enviar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lote in itemSolicitado.lotesDisponiveis" :key="lote.id">
                  <td>{{ lote.lote }}</td>
                  <td>{{ formatarData(lote.validade) }}</td>
                  <td>{{ lote.quantidadeAtual }} un</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      :max="lote.quantidadeAtual"
                      v-model.number="lotesSelecionados[lote.id]"
                      @input="
                        lotesSelecionados[lote.id] =
                          lotesSelecionados[lote.id] < 0 ? 0 : lotesSelecionados[lote.id]
                      "
                      placeholder="0"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </main>

      <footer class="modal-rodape">
        <button class="botao botao-acao" @click="fechar">Cancelar</button>
        <button
          class="botao botao-primario"
          type="submit"
          form="form-atendimento"
          :disabled="!isAtendimentoValido"
        >
          Confirmar Atendimento
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  solicitacao: { type: Object, required: true },
  estoqueAtivo: { type: Array, required: true },
})

const emit = defineEmits(['fechar', 'salvar'])

const lotesSelecionados = ref({})

const formatarData = (dataString) => {
  if (!dataString) return 'N/A'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

// CORREÇÃO: A lógica de preenchimento automático foi reescrita para ser mais direta e evitar ciclos.
function autoPreencherAtendimento() {
  const selecao = {}
  // Itera diretamente sobre os itens da solicitação original
  props.solicitacao.itens.forEach((item) => {
    let restante = item.unidadesSolicitadas

    // Filtra e ordena os lotes relevantes aqui dentro
    const lotesDisponiveis = props.estoqueAtivo
      .filter((lote) => lote.testeId === item.testeId && lote.marcaId === item.marcaId)
      .sort((a, b) => new Date(a.validade) - new Date(b.validade))

    lotesDisponiveis.forEach((lote) => {
      if (restante > 0) {
        const quantidadeDoLote = Math.min(lote.quantidadeAtual, restante)
        selecao[lote.id] = quantidadeDoLote
        restante -= quantidadeDoLote
      }
    })
  })
  lotesSelecionados.value = selecao
}

onMounted(() => {
  autoPreencherAtendimento()
})

const itensParaAtender = computed(() => {
  return props.solicitacao.itens.map((item) => {
    const lotesDisponiveis = props.estoqueAtivo
      .filter((lote) => lote.testeId === item.testeId && lote.marcaId === item.marcaId)
      .sort((a, b) => new Date(a.validade) - new Date(b.validade))

    const totalAtendido = lotesDisponiveis.reduce((soma, lote) => {
      return soma + (Number(lotesSelecionados.value[lote.id]) || 0)
    }, 0)

    return { ...item, chave: `${item.testeId}_${item.marcaId}`, lotesDisponiveis, totalAtendido }
  })
})

const isAtendimentoValido = computed(() => {
  if (itensParaAtender.value.length === 0) return false
  return itensParaAtender.value.every((item) => item.totalAtendido === item.unidadesSolicitadas)
})

function classeStatusAtendimento(item) {
  if (item.totalAtendido < item.unidadesSolicitadas) return 'status-pendente'
  if (item.totalAtendido === item.unidadesSolicitadas) return 'status-atendido'
  return 'status-excesso'
}

function submeterAtendimento() {
  if (!isAtendimentoValido.value) return
  const payload = {
    solicitacaoId: props.solicitacao.id,
    equipeDestino: {
      id: props.solicitacao.equipeId,
      nome: props.solicitacao.equipeNome,
      ubsId: props.solicitacao.ubsId,
    },
    lotesParaBaixa: Object.entries(lotesSelecionados.value)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([loteId, quantidadeSaida]) => ({
        lote: props.estoqueAtivo.find((l) => l.id === loteId),
        quantidadeSaida,
      })),
  }
  emit('salvar', payload)
}

function fechar() {
  emit('fechar')
}
</script>

<style scoped>
/* ... (estilos do modal inalterados) ... */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}
.modal-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.modal-cabecalho h2 {
  margin: 0;
  font-size: 1.25rem;
}
.botao-fechar {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}
.modal-corpo {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}

.item-solicitado-container {
  margin-bottom: 2rem;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.item-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.total-solicitado {
  font-weight: 500;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}
.tabela-lotes {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.tabela-lotes th,
.tabela-lotes td {
  padding: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
}
.tabela-lotes th {
  background-color: #f8fafc;
}
.tabela-lotes input {
  width: 80px;
  padding: 6px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  text-align: center;
}

.status-pendente {
  background-color: #fef9c3;
  color: #854d0e;
}
.status-atendido {
  background-color: #dcfce7;
  color: #166534;
}
.status-excesso {
  background-color: #fee2e2;
  color: #991b1b;
}
.aviso-erro {
  color: #b91c1c;
  background-color: #fee2e2;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}
</style>
