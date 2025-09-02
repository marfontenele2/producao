<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho no-print">
      <h1>Produção Semanal: MDDA</h1>
      <button class="botao botao-acao" @click="voltar">
        <ArrowLeft :size="18" /> Voltar para o menu
      </button>
    </header>

    <div class="conteudo-card">
      <div class="filtros-card">
        <div class="campo">
          <label for="ano">Selecione o Ano</label>
          <select id="ano" v-model="anoSelecionado">
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
        <div class="campo">
          <label for="semana">Selecione a Semana Epidemiológica</label>
          <select
            id="semana"
            v-model="semanaKeySelecionada"
            @change="buscarDados"
            :disabled="!anoSelecionado"
          >
            <option :value="null" disabled>Selecione uma semana</option>
            <option v-for="semana in semanasDoAno" :key="semana.chave" :value="semana.chave">
              {{ semana.display }}
            </option>
          </select>
        </div>
        <div class="botoes-acao">
          <button
            class="botao"
            @click="salvar(false)"
            :disabled="salvando || carregando || dadosFormulario.finalizado"
          >
            <Save :size="18" /> {{ salvando ? 'Salvando...' : 'Salvar Rascunho' }}
          </button>
          <button
            class="botao botao-primario"
            @click="salvar(true)"
            :disabled="!isFormularioValido || salvando || carregando || dadosFormulario.finalizado"
          >
            <CheckCircle :size="18" />
            {{ salvando ? 'Finalizando...' : 'Finalizar e Entregar' }}
          </button>
        </div>
      </div>
      <div v-if="dadosFormulario.finalizado" class="aviso-finalizado">
        Esta produção foi finalizada e não pode mais ser editada.
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card secao-formulario">
      <p>Carregando dados da semana epidemiológica...</p>
    </div>

    <form v-else @submit.prevent="salvar(true)">
      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Casos de Doença Diarreica Aguda (por Microárea)</h2>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-producao">
            <thead>
              <tr>
                <th rowspan="2">MICROAREA</th>
                <th colspan="6">FAIXA ETÁRIA</th>
                <th colspan="5">PLANO DE TRATAMENTO</th>
                <th colspan="4">SURTOS</th>
                <th rowspan="2" class="coluna-acao no-print"></th>
              </tr>
              <tr>
                <th>&lt;1</th>
                <th>1-4</th>
                <th>5-9</th>
                <th>10+</th>
                <th>Ing</th>
                <th>Total</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>Ing</th>
                <th>Total</th>
                <th>Num</th>
                <th>Invest.</th>
                <th>Não</th>
                <th>Inform</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="microareasComputadas.length === 0">
                <td colspan="17">Nenhuma microárea adicionada.</td>
              </tr>
              <tr
                v-for="(item, index) in microareasComputadas"
                :key="item.id"
                :class="{ 'linha-invalida': !item.isValido }"
              >
                <td>
                  <input
                    type="text"
                    v-model="dadosFormulario.microareas[index].numero"
                    placeholder="Nº"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].faixa_menor_1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].faixa_1_a_4"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].faixa_5_a_9"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].faixa_10_mais"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].faixa_ing"
                  />
                </td>
                <td class="total-celula">{{ item.totalFaixaEtaria }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].planoA"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].planoB"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].planoC"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].plano_ing"
                  />
                </td>
                <td class="total-celula">{{ item.totalPlanoTratamento }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].surto_num"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].surto_invest"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].surto_nao"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="dadosFormulario.microareas[index].surto_inform"
                  />
                </td>
                <td class="coluna-acao no-print">
                  <button type="button" class="botao-remover" @click="removerMicroarea(index)">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!isFormularioValido" class="aviso-validacao">
          <strong>Atenção:</strong> Não é possível finalizar. A soma das Faixas Etárias não
          corresponde à soma dos Planos de Tratamento na microárea
          <strong>"{{ primeiraMicroareaInvalida.numero || 'sem número' }}"</strong>. Por favor,
          corrija a linha destacada.
        </div>
        <div class="rodape-tabela no-print">
          <button type="button" class="botao botao-secundario" @click="adicionarMicroarea">
            <PlusCircle :size="16" /> Adicionar Microárea
          </button>
        </div>
      </div>

      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Óbitos por Doença Diarreica Aguda</h2>
        <div class="campo">
          <label>1) Ocorreu óbito por diarreia?</label>
          <div class="grupo-radio">
            <label
              ><input type="radio" value="sim" v-model="dadosFormulario.obitos.ocorreu" />
              SIM</label
            >
            <label
              ><input type="radio" value="nao" v-model="dadosFormulario.obitos.ocorreu" />
              NÃO</label
            >
          </div>
        </div>
        <table
          v-if="dadosFormulario.obitos.ocorreu === 'sim'"
          class="tabela-padrao tabela-producao tabela-obitos"
        >
          <thead>
            <tr>
              <th>&lt;1</th>
              <th>1-4</th>
              <th>5-9</th>
              <th>10+</th>
              <th>Ing</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="dadosFormulario.obitos.faixa_menor_1"
                />
              </td>
              <td>
                <input type="number" min="0" v-model.number="dadosFormulario.obitos.faixa_1_a_4" />
              </td>
              <td>
                <input type="number" min="0" v-model.number="dadosFormulario.obitos.faixa_5_a_9" />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="dadosFormulario.obitos.faixa_10_mais"
                />
              </td>
              <td>
                <input type="number" min="0" v-model.number="dadosFormulario.obitos.faixa_ing" />
              </td>
              <td class="total-celula">{{ obitosComputado.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, CheckCircle, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { ServicoMDDA } from '../servicos/ServicoMDDA'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const salvando = ref(false)

// Refs para lidar com múltiplos anos
const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

// Watch para atualizar as semanas quando o ano mudar
watch(anoSelecionado, (novoAno) => {
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(novoAno)
  semanaKeySelecionada.value = null
  dadosFormulario.value = criarEstadoInicial()
})

const criarEstadoInicial = () => ({
  microareas: [],
  obitos: {
    ocorreu: 'nao',
    faixa_menor_1: 0,
    faixa_1_a_4: 0,
    faixa_5_a_9: 0,
    faixa_10_mais: 0,
    faixa_ing: 0,
  },
  finalizado: false,
})
const dadosFormulario = ref(criarEstadoInicial())

const microareasComputadas = computed(() => {
  return dadosFormulario.value.microareas.map((item) => {
    const totalFaixaEtaria =
      (item.faixa_menor_1 || 0) +
      (item.faixa_1_a_4 || 0) +
      (item.faixa_5_a_9 || 0) +
      (item.faixa_10_mais || 0) +
      (item.faixa_ing || 0)
    const totalPlanoTratamento =
      (item.planoA || 0) + (item.planoB || 0) + (item.planoC || 0) + (item.plano_ing || 0)
    const isValido = totalFaixaEtaria === totalPlanoTratamento
    return { ...item, totalFaixaEtaria, totalPlanoTratamento, isValido }
  })
})
const obitosComputado = computed(() => {
  const ob = dadosFormulario.value.obitos
  const total =
    (ob.faixa_menor_1 || 0) +
    (ob.faixa_1_a_4 || 0) +
    (ob.faixa_5_a_9 || 0) +
    (ob.faixa_10_mais || 0) +
    (ob.faixa_ing || 0)
  return { ...ob, total }
})

const isFormularioValido = computed(() => {
  return microareasComputadas.value.every((item) => item.isValido)
})

const primeiraMicroareaInvalida = computed(() => {
  return microareasComputadas.value.find((item) => !item.isValido) || {}
})

function adicionarMicroarea() {
  dadosFormulario.value.microareas.push({
    id: Date.now(),
    numero: '',
    faixa_menor_1: 0,
    faixa_1_a_4: 0,
    faixa_5_a_9: 0,
    faixa_10_mais: 0,
    faixa_ing: 0,
    planoA: 0,
    planoB: 0,
    planoC: 0,
    plano_ing: 0,
    surto_num: 0,
    surto_invest: 0,
    surto_nao: 0,
    surto_inform: 0,
  })
}
function removerMicroarea(index) {
  dadosFormulario.value.microareas.splice(index, 1)
}

async function buscarDados() {
  carregando.value = true
  const equipeId = storeUsuario.usuario?.equipeId
  if (equipeId && semanaKeySelecionada.value) {
    const dadosSalvos = await ServicoMDDA.carregarDados(semanaKeySelecionada.value, equipeId)
    dadosFormulario.value = dadosSalvos
      ? { ...criarEstadoInicial(), ...dadosSalvos }
      : criarEstadoInicial()
  } else {
    dadosFormulario.value = criarEstadoInicial()
  }
  carregando.value = false
}

onMounted(() => {
  anosDisponiveis.value = semanaEpidemiologicaUtils.getAnosDisponiveis()
  const anoAtual = new Date().getFullYear()

  if (anosDisponiveis.value.includes(anoAtual)) {
    anoSelecionado.value = anoAtual
  } else if (anosDisponiveis.value.length > 0) {
    anoSelecionado.value = anosDisponiveis.value[0]
  }

  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const semanaAtual = semanaEpidemiologicaUtils.getSemanaAtual()

  if (semanaAtual && String(semanaAtual.chave).startsWith(String(anoSelecionado.value))) {
    semanaKeySelecionada.value = semanaAtual.chave
  } else if (semanasDoAno.value.length > 0) {
    semanaKeySelecionada.value = semanasDoAno.value[0].chave
  }

  buscarDados()
})

async function salvar(finalizar) {
  if (finalizar) {
    if (!isFormularioValido.value) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `Não é possível finalizar. Corrija os totais da microárea "${primeiraMicroareaInvalida.value.numero || 'sem número'}".`,
        tipo: 'erro',
        duracao: 6000,
      })
      return
    }
    if (
      !confirm(
        `Tem certeza que deseja finalizar e entregar a produção da semana ${semanaKeySelecionada.value}? Após a finalização, não será possível editar.`,
      )
    ) {
      return
    }
  }

  salvando.value = true
  const equipeId = storeUsuario.usuario?.equipeId
  const usuarioId = storeUsuario.usuario?.uid
  const payload = { ...dadosFormulario.value, finalizado: finalizar }
  try {
    await ServicoMDDA.salvarDados(semanaKeySelecionada.value, equipeId, payload, usuarioId)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Produção MDDA ${finalizar ? 'finalizada' : 'salva'} com sucesso!`,
      tipo: 'sucesso',
    })
    if (finalizar) {
      dadosFormulario.value.finalizado = true
    }
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Falha ao salvar a produção.', tipo: 'erro' })
  } finally {
    salvando.value = false
  }
}

function voltar() {
  router.push({ name: 'EnfermeiroProducaoSemanal' })
}
</script>

<style scoped>
.filtros-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.botoes-acao {
  display: flex;
  gap: 1rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.campo select,
.campo input[type='text'].input-readonly {
  border: 1px solid var(--cor-borda-suave);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 350px;
}
.input-readonly {
  background-color: #f1f5f9;
}
.secao-formulario {
  margin-top: 1.5rem;
}
.secao-titulo {
  font-size: 1.25rem;
  margin-top: 0;
}
.tabela-container {
  overflow-x: auto;
}
.tabela-producao {
  width: 100%;
  white-space: nowrap;
}
.tabela-producao th,
.tabela-producao td {
  text-align: center;
  vertical-align: middle;
  padding: 8px 4px;
}
.tabela-producao th {
  font-size: 0.8rem;
}
.tabela-producao input[type='number'],
.tabela-producao input[type='text'] {
  width: 60px;
  padding: 6px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  text-align: center;
}
.tabela-producao input[type='checkbox'].checkbox-grande {
  width: 18px;
  height: 18px;
}
.total-celula {
  font-weight: bold;
  background-color: #f1f5f9;
}
.coluna-acao {
  width: 60px;
}
.botao-remover {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}
.rodape-tabela {
  margin-top: 1rem;
}
.grupo-radio {
  display: flex;
  gap: 1.5rem;
  padding: 8px 0;
}
.tabela-obitos {
  max-width: 600px;
}
.aviso-finalizado {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
}
.linha-invalida td {
  background-color: #fee2e2 !important;
}
.linha-invalida .total-celula {
  color: #991b1b;
}
.aviso-validacao {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
