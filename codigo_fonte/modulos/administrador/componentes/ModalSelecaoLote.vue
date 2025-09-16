<template>
  <div class="modal-backdrop" @click.self="fechar">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Selecionar Lote para Dispensação</h2>
        <button class="botao-fechar" @click="fechar"><X :size="24" /></button>
      </header>

      <main class="modal-corpo">
        <div class="info-item-solicitado">
          <p>
            <strong>Item:</strong> {{ itemSolicitado.testeNome }} - {{ itemSolicitado.marcaNome }}
          </p>
          <p><strong>Solicitado:</strong> {{ itemSolicitado.caixasSolicitadas }} caixa(s)</p>
        </div>

        <div v-if="carregandoLotes" class="mensagem-info">
          Buscando lotes disponíveis no estoque...
        </div>
        <div v-else-if="lotesDisponiveis.length === 0" class="mensagem-alerta">
          Nenhum lote com estoque suficiente foi encontrado para este item.
        </div>
        <table v-else class="tabela-padrao tabela-selecao-lote">
          <thead>
            <tr>
              <th class="coluna-selecao">Selecionar</th>
              <th>Cód. do Lote</th>
              <th>Validade</th>
              <th class="coluna-numerica">Qtd. Disponível (Testes)</th>
              <th class="coluna-numerica">Disponível (Caixas)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lote in lotesDisponiveis" :key="lote.id">
              <td class="coluna-selecao">
                <input
                  type="radio"
                  name="selecao-lote"
                  :value="lote.id"
                  v-model="loteSelecionadoId"
                />
              </td>
              <td>{{ lote.codigoLote }}</td>
              <td>{{ formatarData(lote.dataValidade) }}</td>
              <td class="coluna-numerica">{{ lote.quantidadeAtual }}</td>
              <td class="coluna-numerica">{{ calcularCaixasDisponiveis(lote) }}</td>
            </tr>
          </tbody>
        </table>
      </main>

      <footer class="modal-rodape">
        <button class="botao botao-acao" @click="fechar">Cancelar</button>
        <button
          class="botao botao-primario"
          @click="confirmarSelecao"
          :disabled="!loteSelecionadoId"
        >
          Confirmar e Dispensar Lote
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { servicoEstoque } from '@/modulos/administrador/servicos/servicoEstoque'
import { X } from 'lucide-vue-next'

const props = defineProps({
  itemSolicitado: { type: Object, required: true },
})

const emit = defineEmits(['fechar', 'salvar'])

const carregandoLotes = ref(true)
const lotesDisponiveis = ref([])
const loteSelecionadoId = ref(null)

onMounted(async () => {
  try {
    const lotes = await servicoEstoque.buscarLotesDisponiveis(
      props.itemSolicitado.testeId,
      props.itemSolicitado.marcaId,
    )
    // Filtra apenas os lotes que podem atender a quantidade de caixas solicitadas
    lotesDisponiveis.value = lotes.filter((lote) => {
      const caixasDisponiveis = Math.floor(lote.quantidadeAtual / lote.quantidadePorCaixa)
      return caixasDisponiveis >= props.itemSolicitado.caixasSolicitadas
    })
  } catch (error) {
    console.error('Erro ao buscar lotes disponíveis:', error)
  } finally {
    carregandoLotes.value = false
  }
})

function calcularCaixasDisponiveis(lote) {
  if (!lote.quantidadePorCaixa) return 0
  return Math.floor(lote.quantidadeAtual / lote.quantidadePorCaixa)
}

function formatarData(dataString) {
  if (!dataString) return 'N/A'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

function confirmarSelecao() {
  if (!loteSelecionadoId.value) {
    alert('Por favor, selecione um lote para a dispensação.')
    return
  }
  const loteEscolhido = lotesDisponiveis.value.find((l) => l.id === loteSelecionadoId.value)
  emit('salvar', loteEscolhido)
}

function fechar() {
  emit('fechar')
}
</script>

<style scoped>
/* Estilos consistentes com outros modais do sistema */
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
  max-width: 700px;
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
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}
.info-item-solicitado {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--cor-borda-suave);
}
.info-item-solicitado p {
  margin: 0.25rem 0;
}
.mensagem-info,
.mensagem-alerta {
  text-align: center;
  padding: 2rem;
  color: #475569;
  font-weight: 500;
}
.mensagem-alerta {
  background-color: #fffbeb;
  color: #b45309;
  border-radius: 6px;
}
.tabela-selecao-lote .coluna-selecao {
  width: 80px;
  text-align: center;
}
.tabela-selecao-lote .coluna-numerica {
  text-align: center;
}
.tabela-selecao-lote input[type='radio'] {
  width: 18px;
  height: 18px;
}
</style>
