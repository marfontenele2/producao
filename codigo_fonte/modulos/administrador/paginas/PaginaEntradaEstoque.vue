<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Controle de Estoque: Nova Entrada de Lote</h1>
      <button class="botao botao-acao" @click="voltarParaControleEstoque">
        <ArrowLeft :size="18" /> Voltar
      </button>
    </header>

    <div class="conteudo-card">
      <div v-if="carregandoTestes">Carregando tipos de teste...</div>
      <form v-else @submit.prevent="registrarEntrada">
        <div class="grid-formulario">
          <div class="campo">
            <label for="tipo-teste">Tipo de Teste</label>
            <select id="tipo-teste" v-model="lote.testeId" @change="aoSelecionarTeste" required>
              <option :value="null" disabled>Selecione um tipo de teste</option>
              <option v-for="teste in catalogoTestes" :key="teste.id" :value="teste.id">
                {{ teste.nome }}
              </option>
            </select>
          </div>
          <div class="campo">
            <label for="marca-comercial">Marca Comercial</label>
            <select
              id="marca-comercial"
              v-model="lote.marcaId"
              @change="aoSelecionarMarca"
              :disabled="!lote.testeId"
              required
            >
              <option :value="null" disabled>Selecione uma marca</option>
              <option v-for="marca in marcasDisponiveis" :key="marca.id" :value="marca.id">
                {{ marca.nome }}
              </option>
            </select>
          </div>

          <div class="campo">
            <label for="codigo-lote">Código do Lote</label>
            <input
              type="text"
              id="codigo-lote"
              v-model.trim="lote.codigoLote"
              required
              placeholder="Ex: A1B2C3D4"
            />
          </div>
          <div class="campo">
            <label for="data-validade">Data de Validade</label>
            <input type="date" id="data-validade" v-model="lote.dataValidade" required />
          </div>

          <div class="campo">
            <label for="qtd-caixa">Quantidade por Caixa (do Catálogo)</label>
            <input
              type="number"
              id="qtd-caixa"
              v-model.number="lote.quantidadePorCaixa"
              required
              readonly
              class="input-readonly"
            />
          </div>
          <div class="campo">
            <label for="num-caixas">Nº de Caixas Recebidas</label>
            <input
              type="number"
              id="num-caixas"
              min="1"
              v-model.number="lote.numeroCaixas"
              required
            />
          </div>
        </div>

        <div class="rodape-formulario">
          <div class="total-calculado">
            <span>Quantidade Total Inicial:</span>
            <strong>{{ quantidadeTotalInicial }} testes</strong>
          </div>
          <button
            type="submit"
            class="botao botao-primario"
            :disabled="!isFormularioValido || salvando"
          >
            <Save :size="18" />
            {{ salvando ? 'Registrando...' : 'Registrar Entrada' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoEstoque } from '@/modulos/administrador/servicos/servicoEstoque'
import { servicoTestes } from '@/modulos/administrador/servicos/servicoTestes'
import { Save, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const storeNotificacoes = useStoreNotificacoes()
const storeUsuario = useStoreUsuario()

const catalogoTestes = ref([])
const carregandoTestes = ref(true)
const salvando = ref(false)

const criarLoteInicial = () => ({
  testeId: null,
  testeNome: '',
  marcaId: null,
  marcaNome: '',
  codigoLote: '',
  dataValidade: '',
  quantidadePorCaixa: null,
  numeroCaixas: null,
})

const lote = ref(criarLoteInicial())

async function carregarTestes() {
  try {
    catalogoTestes.value = await servicoTestes.buscarTodos()
  } catch (error) {
    console.error('Erro ao carregar catálogo de testes:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao carregar tipos de teste.',
      tipo: 'erro',
    })
  } finally {
    carregandoTestes.value = false
  }
}

onMounted(carregarTestes)

const marcasDisponiveis = computed(() => {
  if (!lote.value.testeId) return []
  const testeSelecionado = catalogoTestes.value.find((t) => t.id === lote.value.testeId)
  return testeSelecionado ? testeSelecionado.marcas : []
})

const quantidadeTotalInicial = computed(() => {
  const porCaixa = lote.value.quantidadePorCaixa || 0
  const numCaixas = lote.value.numeroCaixas || 0
  return porCaixa * numCaixas
})

// ===================================================================
// === A CORREÇÃO ESTÁ AQUI ===
// ===================================================================
/**
 * @JSDoc_MODIFICADO
 * Propriedade computada que valida se o formulário está preenchido e pronto para ser enviado.
 * A lógica foi ajustada para validar apenas os campos essenciais.
 */
const isFormularioValido = computed(() => {
  const l = lote.value
  return (
    l.testeId &&
    l.marcaId &&
    l.codigoLote.trim() !== '' &&
    l.dataValidade !== '' &&
    l.quantidadePorCaixa &&
    l.quantidadePorCaixa > 0 && // Vem do catálogo
    l.numeroCaixas &&
    l.numeroCaixas > 0 // Digitado pelo usuário
  )
})
// ===================================================================

function aoSelecionarTeste() {
  lote.value.marcaId = null
  lote.value.marcaNome = ''
  lote.value.quantidadePorCaixa = null
  const testeSelecionado = catalogoTestes.value.find((t) => t.id === lote.value.testeId)
  if (testeSelecionado) {
    lote.value.testeNome = testeSelecionado.nome
  }
}

function aoSelecionarMarca() {
  const marcaSelecionada = marcasDisponiveis.value.find((m) => m.id === lote.value.marcaId)
  if (marcaSelecionada) {
    lote.value.marcaNome = marcaSelecionada.nome
    lote.value.quantidadePorCaixa = marcaSelecionada.quantidadePorCaixa || null

    if (!lote.value.quantidadePorCaixa) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `Atenção: A marca "${marcaSelecionada.nome}" não possui uma 'Quantidade por Caixa' definida no catálogo.`,
        tipo: 'alerta',
      })
    }
  }
}

async function registrarEntrada() {
  if (!isFormularioValido.value) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Por favor, preencha todos os campos obrigatórios.',
      tipo: 'alerta',
    })
    return
  }
  salvando.value = true
  try {
    const dadosLoteParaSalvar = {
      ...lote.value,
      quantidadeInicial: quantidadeTotalInicial.value,
      registradoPor: storeUsuario.usuario.uid,
    }
    await servicoEstoque.adicionarLote(dadosLoteParaSalvar)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Lote registrado no estoque com sucesso!',
      tipo: 'sucesso',
    })
    lote.value = criarLoteInicial()
  } catch (error) {
    console.error('Erro ao registrar entrada de lote:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Ocorreu um erro ao registrar o lote.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}

function voltarParaControleEstoque() {
  router.push({ name: 'AdminControleEstoque' })
}
</script>

<style scoped>
.grid-formulario {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.campo input,
.campo select {
  padding: 10px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.input-readonly {
  background-color: #f1f5f9;
  cursor: not-allowed;
  font-weight: 600;
  color: var(--cor-primaria);
}
.rodape-formulario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--cor-borda-suave);
  flex-wrap: wrap;
  gap: 1rem;
}
.total-calculado {
  font-size: 1rem;
  color: var(--cor-texto-padrao);
}
.total-calculado strong {
  color: var(--cor-primaria);
  font-size: 1.2rem;
  margin-left: 0.5rem;
}
</style>
