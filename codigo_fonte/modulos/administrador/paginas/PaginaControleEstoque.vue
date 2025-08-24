<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Controle de Estoque de Testes Rápidos</h1>
      <button class="botao botao-primario" @click="abrirFormularioEntrada">
        <PlusCircle :size="18" />
        <span>Registrar Entrada</span>
      </button>
    </header>

    <div class="conteudo-card">
      <div v-if="carregando" class="mensagem-info">Carregando estoque...</div>
      <table v-else class="tabela-padrao">
        <thead>
          <tr>
            <th>Teste</th>
            <th>Marca</th>
            <th>Lote</th>
            <th>Validade</th>
            <th>Qtd. Inicial</th>
            <th>Qtd. Atual</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="estoque.length === 0">
            <td colspan="7">Nenhum lote cadastrado no estoque.</td>
          </tr>
          <tr v-for="item in estoque" :key="item.id">
            <td>{{ item.testeNome }}</td>
            <td>{{ item.marcaNome }}</td>
            <td>{{ item.lote }}</td>
            <td>{{ formatarData(item.validade) }}</td>
            <td>{{ item.quantidadeInicial }}</td>
            <td>
              <strong>{{ item.quantidadeAtual }}</strong>
            </td>
            <td>
              <div class="acoes-tabela">
                <button
                  class="botao-acao"
                  @click="abrirFormularioSaida(item)"
                  :disabled="item.quantidadeAtual === 0"
                >
                  Registrar Saída
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <FormularioEntradaEstoque
      v-if="exibirFormularioEntrada"
      :catalogo-testes="catalogoTestes"
      @fechar="fecharFormularioEntrada"
      @salvar="handleSalvarEntrada"
    />
    <FormularioSaidaEstoque
      v-if="exibirFormularioSaida"
      :item-estoque="itemSelecionado"
      :lista-equipes="listaEquipes"
      :lista-ubs="listaUbs"
      @fechar="fecharFormularioSaida"
      @salvar="handleSalvarSaida"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario.js'
import { servicoEstoque } from '../servicos/servicoEstoque.js'
import { servicoTestes } from '../servicos/servicoTestes.js'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes.js'
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs.js'
import FormularioEntradaEstoque from '../componentes/FormularioEntradaEstoque.vue'
import FormularioSaidaEstoque from '../componentes/FormularioSaidaEstoque.vue'
import { PlusCircle } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const estoque = ref([])
const catalogoTestes = ref([])
const listaEquipes = ref([])
const listaUbs = ref([])
const carregando = ref(true)

const exibirFormularioEntrada = ref(false)
const exibirFormularioSaida = ref(false)
const itemSelecionado = ref(null)

let unsubscribers = []

onMounted(() => {
  unsubscribers.push(
    servicoEstoque.monitorarEstoque((lista) => {
      estoque.value = lista
      carregando.value = false
    }),
  )
  unsubscribers.push(
    servicoTestes.monitorarTestes((lista) => {
      catalogoTestes.value = lista
    }),
  )
  unsubscribers.push(
    servicoEquipes.monitorarEquipes((lista) => {
      listaEquipes.value = lista
    }),
  )
  unsubscribers.push(
    servicoUbs.monitorarUbs((lista) => {
      listaUbs.value = lista
    }),
  )
})

onUnmounted(() => {
  unsubscribers.forEach((unsub) => unsub())
})

const formatarData = (dataString) => {
  if (!dataString) return 'N/A'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

// Lógica para Formulário de ENTRADA
const abrirFormularioEntrada = () => {
  exibirFormularioEntrada.value = true
}
const fecharFormularioEntrada = () => {
  exibirFormularioEntrada.value = false
}
const handleSalvarEntrada = async (dadosLote) => {
  try {
    await servicoEstoque.adicionarLote(dadosLote)
    fecharFormularioEntrada()
    alert('Entrada registrada com sucesso!')
  } catch (error) {
    // --- ALTERAÇÃO: Exibindo o erro detalhado ---
    console.error('Erro detalhado ao registrar entrada:', error)
    alert(`Falha ao registrar entrada no estoque: ${error.message}`)
  }
}

// Lógica para Formulário de SAÍDA
const abrirFormularioSaida = (item) => {
  itemSelecionado.value = item
  exibirFormularioSaida.value = true
}
const fecharFormularioSaida = () => {
  itemSelecionado.value = null
  exibirFormularioSaida.value = false
}
const handleSalvarSaida = async (payload) => {
  try {
    await servicoEstoque.registrarSaidaDeLote({
      ...payload,
      idUsuarioAdmin: storeUsuario.usuario.uid,
    })
    fecharFormularioSaida()
    alert('Saída de estoque registrada com sucesso!')
  } catch (error) {
    // --- ALTERAÇÃO: Exibindo o erro detalhado ---
    console.error('Erro detalhado ao registrar saída:', error)
    alert(`Falha ao registrar a saída: ${error.message}`)
  }
}
</script>
