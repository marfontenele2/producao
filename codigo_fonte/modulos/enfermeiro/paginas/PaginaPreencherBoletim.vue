<template>
  <div class="pagina-container" v-if="teste">
    <header class="pagina-cabecalho">
      <h1 v-if="!marcaSelecionada">Lançamento: {{ teste.nome }}</h1>
      <h1 v-else>Preenchendo: {{ marcaSelecionada.nome }}</h1>

      <button v-if="marcaSelecionada" class="botao botao-acao" @click="voltarParaSelecao">
        <ArrowLeft :size="18" /> Voltar para Marcas
      </button>
      <button v-else class="botao botao-acao" @click="voltarParaPainel">
        <ArrowLeft :size="18" /> Voltar ao Painel
      </button>
    </header>

    <div v-if="carregando" class="conteudo-card" style="text-align: center">Carregando...</div>

    <div v-else>
      <div v-if="!marcaSelecionada" class="grid-selecao-marcas">
        <div
          v-for="marca in marcasLiberadas"
          :key="marca.id"
          class="card-selecao"
          :class="{ 'card-salvo': marcasSalvas.has(marca.id) }"
          @click="selecionarMarca(marca)"
        >
          <span>{{ marca.nome }}</span>
        </div>
      </div>

      <div v-else class="conteudo-card">
        <div class="secao-dados">
          <div class="cabecalho-secao-realizados">
            <h3 class="subtitulo">Realizados</h3>
            <div class="campo-total">
              <span>Total:</span>
              <strong>{{ calcularTotalRealizados(marcaSelecionada.id) }}</strong>
            </div>
          </div>
          <div class="grid-campos">
            <div class="campo">
              <label>Pré-Natal</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                v-model.number="dadosMarcaAtual.realizados.preNatal"
              />
            </div>
            <div class="campo">
              <label>Mobilização</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                v-model.number="dadosMarcaAtual.realizados.mobilizacao"
              />
            </div>
            <div class="campo">
              <label>Treinamentos</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                v-model.number="dadosMarcaAtual.realizados.treinamentos"
              />
            </div>
            <div class="campo">
              <label>Rotina</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                v-model.number="dadosMarcaAtual.realizados.rotina"
              />
            </div>
          </div>
        </div>

        <div class="secao-dados">
          <h3 class="subtitulo">Resultados</h3>
          <div class="campo campo-reagentes">
            <label>Reagentes</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              v-model.number="dadosMarcaAtual.reagentes"
            />
          </div>
        </div>

        <TabelaPerdasInvalidos titulo="Testes Inválidos" :itens="dadosMarcaAtual.invalidos" />
        <TabelaPerdasInvalidos
          titulo="Testes Perdidos"
          :itens="dadosMarcaAtual.perdidos"
          com-motivo
        />

        <div class="rodape-formulario">
          <button
            class="botao botao-primario"
            @click="salvarMarca(marcaSelecionada.id, marcaSelecionada.nome)"
            :disabled="!isMarcaValidaParaSalvar(marcaSelecionada.id) || salvandoId"
          >
            <Save :size="18" />
            {{ salvandoId === marcaSelecionada.id ? 'Salvando...' : 'Salvar e Voltar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, set, cloneDeep } from 'lodash-es'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoLiberacoes } from '@/modulos/administrador/servicos/servicoLiberacoes'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoBoletim } from '@/modulos/enfermeiro/servicos/servicoBoletim'
import TabelaPerdasInvalidos from '@/modulos/enfermeiro/componentes/TabelaPerdasInvalidos.vue'
import { Save, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const teste = ref(null)
const marcasLiberadas = ref([])
const dadosEntrada = ref({ testes: {} })

// --- Controle de Estado da UI ---
const marcaSelecionada = ref(null) // Guarda o objeto da marca selecionada
const salvandoId = ref(null)
const marcasSalvas = ref(new Set())

const competencia = route.params.competencia
const testeId = route.params.testeId

/**
 * @JSDoc
 * Estrutura de dados padrão para uma marca, agora incluindo inválidos e perdidos.
 */
const criarEstruturaPadrao = () => ({
  realizados: { preNatal: null, mobilizacao: null, treinamentos: null, rotina: null },
  reagentes: null,
  invalidos: [], // Adicionado
  perdidos: [], // Adicionado
})

// onMounted permanece o mesmo, pois a lógica de carregar todos os dados é robusta.
onMounted(async () => {
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const [catalogoTestes, liberacoes, dadosSalvos] = await Promise.all([
      servicoTestes.buscarTodos(),
      servicoLiberacoes.buscarLiberacoes(competencia),
      servicoBoletim.buscarDados(competencia, equipeId),
    ])
    teste.value = catalogoTestes.find((t) => t.id === testeId)
    if (!teste.value) throw new Error('Teste não encontrado.')

    const idsMarcasLiberadas = Object.keys(get(liberacoes, ['testesLiberados', testeId], {}))
    marcasLiberadas.value = teste.value.marcas.filter((m) => idsMarcasLiberadas.includes(m.id))

    const dadosSalvosParaTeste = get(dadosSalvos, ['testes', testeId], {})
    const dadosIniciaisParaTeste = {}

    marcasLiberadas.value.forEach((marca) => {
      const dadosMarcaSalva = dadosSalvosParaTeste[marca.id]
      if (dadosMarcaSalva) {
        // Garante que os arrays de perdidos/invalidos existam
        dadosMarcaSalva.invalidos = dadosMarcaSalva.invalidos || []
        dadosMarcaSalva.perdidos = dadosMarcaSalva.perdidos || []
        dadosIniciaisParaTeste[marca.id] = dadosMarcaSalva
        marcasSalvas.value.add(marca.id)
      } else {
        dadosIniciaisParaTeste[marca.id] = criarEstruturaPadrao()
      }
    })

    set(dadosEntrada.value, ['testes', testeId], dadosIniciaisParaTeste)
  } catch (error) {
    console.error('Erro ao montar página:', error)
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao carregar dados.', tipo: 'erro' })
  } finally {
    carregando.value = false
  }
})

/**
 * @JSDoc
 * Propriedade computada para acessar facilmente os dados da marca selecionada no formulário.
 */
const dadosMarcaAtual = computed(() => {
  if (!marcaSelecionada.value) return null
  return get(dadosEntrada.value, ['testes', testeId, marcaSelecionada.value.id])
})

/**
 * @JSDoc
 * Define a marca selecionada para exibir seu formulário.
 * @param {object} marca - O objeto completo da marca clicada.
 */
function selecionarMarca(marca) {
  marcaSelecionada.value = marca
}

/**
 * @JSDoc
 * Limpa a marca selecionada para voltar à tela de seleção.
 */
function voltarParaSelecao() {
  marcaSelecionada.value = null
}

// As funções de validação, cálculo e salvamento continuam robustas
function isMarcaValidaParaSalvar(marcaId) {
  const dadosMarca = get(dadosEntrada.value, ['testes', testeId, marcaId])
  if (!dadosMarca) return false
  const todosRealizadosPreenchidos = Object.values(dadosMarca.realizados).every(
    (valor) => typeof valor === 'number',
  )
  const reagentesPreenchido = typeof dadosMarca.reagentes === 'number'
  return todosRealizadosPreenchidos && reagentesPreenchido
}

function calcularTotalRealizados(marcaId) {
  const realizados = get(dadosEntrada.value, ['testes', testeId, marcaId, 'realizados'])
  if (!realizados) return 0
  return Object.values(realizados).reduce((soma, valor) => soma + (Number(valor) || 0), 0)
}

async function salvarMarca(marcaId, nomeMarca) {
  salvandoId.value = marcaId
  try {
    const { equipeId, ubsId, uid } = storeUsuario.usuario
    const dadosMarcaParaSalvar = cloneDeep(dadosMarcaAtual.value)

    // Converte valores nulos para 0 antes de salvar
    Object.keys(dadosMarcaParaSalvar.realizados).forEach((key) => {
      if (dadosMarcaParaSalvar.realizados[key] === null) dadosMarcaParaSalvar.realizados[key] = 0
    })
    if (dadosMarcaParaSalvar.reagentes === null) dadosMarcaParaSalvar.reagentes = 0

    const payloadCompleto = {}
    set(payloadCompleto, ['testes', testeId, marcaId], dadosMarcaParaSalvar)

    await servicoBoletim.salvarDados(competencia, equipeId, ubsId, uid, payloadCompleto)

    marcasSalvas.value.add(marcaId)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Dados da marca ${nomeMarca} salvos!`,
      tipo: 'sucesso',
    })
    voltarParaSelecao() // Retorna para a tela de seleção após salvar
  } catch (error) {
    console.error('Erro ao salvar marca:', error)
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao salvar os dados.', tipo: 'erro' })
  } finally {
    salvandoId.value = null
  }
}

function voltarParaPainel() {
  router.push({ name: 'EnfermeiroBoletim' })
}
</script>

<style scoped>
/* Estilo para a grade de seleção de marcas */
.grid-selecao-marcas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card-selecao {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  background-color: #ffffff;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  text-align: center;
}

.card-selecao:hover {
  border-color: var(--cor-primaria);
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-salvo {
  background-color: #eff6ff; /* Fundo azul claro para salvo */
  border-color: #60a5fa;
  color: #1e40af;
}

/* Estilos para o formulário (reaproveitados e ajustados) */
.subtitulo {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}
.secao-dados {
  margin-bottom: 2rem;
}
.grid-campos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-size: 0.9rem;
}
.campo input {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
}
.cabecalho-secao-realizados {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.campo-total {
  background-color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.9rem;
}
.rodape-formulario {
  border-top: 1px solid var(--cor-borda-suave);
  padding-top: 1.5rem;
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}
</style>
