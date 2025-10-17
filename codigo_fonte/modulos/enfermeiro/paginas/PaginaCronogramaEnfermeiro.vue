<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Cronograma da Equipe</h1>
    </header>

    <div class="conteudo-card card-filtros">
      <div class="campo">
        <label for="competencia">Competência de Lançamento</label>
        <input id="competencia" type="month" v-model="competencia" class="input-padrao" />
      </div>
      <button class="botao botao-primario" @click="abrirModalEvento()">
        <CalendarPlus :size="18" /> Adicionar Evento
      </button>
    </div>

    <div class="conteudo-card" style="margin-top: 1.5rem">
      <div class="filtros-container">
        <span class="filtro-label">Filtrar por Categoria:</span>
        <div class="grupo-filtros">
          <label v-for="categoria in categoriasFiltro" :key="categoria.nome">
            <input type="checkbox" v-model="categoria.selecionado" />
            <span class="letra-categoria-filtro" :class="categoria.classeCss">{{
              categoria.letra
            }}</span>
            {{ categoria.nome }}
          </label>
        </div>
      </div>

      <div v-if="carregando">Carregando dados...</div>
      <FullCalendar v-else :options="calendarOptions" ref="fullCalendarRef">
        <template #eventContent="arg">
          <div class="evento-customizado">
            <span
              class="letra-categoria"
              :class="
                getEstiloParaCategoria(arg.event.extendedProps.categoriaProfissional).classeCss
              "
            >
              {{ getEstiloParaCategoria(arg.event.extendedProps.categoriaProfissional).letra }}
            </span>
            <span class="titulo-evento">{{ arg.event.title }}</span>
          </div>
        </template>
      </FullCalendar>
    </div>

    <div v-if="modal.visivel" class="modal-backdrop" @click.self="fecharModal">
      <div class="modal-container">
        <header class="modal-cabecalho">
          <h2>{{ modal.modo === 'adicionar' ? 'Adicionar Novo Evento' : 'Editar Evento' }}</h2>
          <button class="botao-fechar" @click="fecharModal"><X :size="24" /></button>
        </header>
        <main class="modal-corpo">
          <form id="form-evento" @submit.prevent="handleSalvarEvento">
            <div class="campo">
              <label for="data-evento">Data</label>
              <input
                type="date"
                id="data-evento"
                v-model="eventoEmEdicao.data"
                class="input-padrao"
                required
                :disabled="recorrencia.ativa"
              />
            </div>
            <div class="campo">
              <label for="descricao-evento">Título / Descrição da Atividade</label>
              <input
                type="text"
                id="descricao-evento"
                v-model="eventoEmEdicao.titulo"
                class="input-padrao"
                required
              />
            </div>
            <div class="campo">
              <label for="local-evento">Local</label>
              <input
                type="text"
                id="local-evento"
                v-model="eventoEmEdicao.local"
                class="input-padrao"
              />
            </div>
            <div class="campo">
              <label for="profissional-evento">Profissional Responsável (do SCNES)</label>
              <select
                id="profissional-evento"
                v-model="eventoEmEdicao.profissionalId"
                class="input-padrao"
                required
              >
                <option :value="null" disabled>
                  {{
                    profissionaisDaEquipe.length > 0
                      ? 'Selecione um profissional...'
                      : 'Nenhum profissional no SCNES para este mês'
                  }}
                </option>
                <option v-for="prof in profissionaisDaEquipe" :key="prof.id" :value="prof.id">
                  {{ prof.nome }} ({{ prof.cargo }})
                </option>
              </select>
            </div>
            <div class="container-recorrencia" v-if="modal.modo === 'adicionar'">
              <div class="campo-checkbox">
                <input type="checkbox" id="repetir-evento" v-model="recorrencia.ativa" />
                <label for="repetir-evento"
                  >Repetir no mês de <strong>{{ competenciaVisualizadaFormatada }}</strong></label
                >
              </div>
              <div v-if="recorrencia.ativa" class="opcoes-recorrencia">
                <label>Repetir nos dias:</label>
                <div class="dias-semana">
                  <label v-for="dia in diasDaSemana" :key="dia.valor">
                    <input type="checkbox" :value="dia.valor" v-model="recorrencia.dias" />
                    <span>{{ dia.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </main>
        <footer class="modal-rodape">
          <button
            v-if="modal.modo === 'editar'"
            type="button"
            class="botao botao-acao excluir"
            @click="handleRemoverEvento"
            style="margin-right: auto"
            :disabled="salvando"
          >
            <Trash2 :size="18" /> Remover Evento
          </button>
          <button class="botao botao-acao" @click="fecharModal">Cancelar</button>
          <button
            class="botao botao-primario"
            type="submit"
            form="form-evento"
            :disabled="salvando"
          >
            <LoaderCircle v-if="salvando" :size="18" class="animate-spin" />
            <Save v-else :size="18" />
            <span>{{ salvando ? 'Salvando...' : 'Salvar' }}</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { ServicoSCNES } from '@/modulos/gerente/servicos/ServicoSCNES'
import { servicoCronograma } from '../servicos/servicoCronograma'
import { v4 as uuidv4 } from 'uuid'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { addMonths, format } from 'date-fns'
import { CalendarPlus, Save, X, Trash2, LoaderCircle } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()
const competencia = ref(new Date().toISOString().slice(0, 7))
const carregando = ref(true)
const salvando = ref(false)
const profissionaisDaEquipe = ref([])
const eventosMaster = ref([])
const modal = reactive({ visivel: false, modo: 'adicionar' })
const eventoEmEdicao = ref({})
const fullCalendarRef = ref(null)
const recorrencia = reactive({ ativa: false, dias: [] })
const diasDaSemana = [
  { label: 'D', valor: 0 },
  { label: 'S', valor: 1 },
  { label: 'T', valor: 2 },
  { label: 'Q', valor: 3 },
  { label: 'Q', valor: 4 },
  { label: 'S', valor: 5 },
  { label: 'S', valor: 6 },
]

const categoriasFiltro = reactive([
  { nome: 'Enfermeiro', letra: 'E', selecionado: true, classeCss: 'cor-enf' },
  { nome: 'Médico', letra: 'M', selecionado: true, classeCss: 'cor-med' },
  { nome: 'Técnico de Enfermagem', letra: 'T', selecionado: true, classeCss: 'cor-tec' },
  { nome: 'Gerente', letra: 'G', selecionado: true, classeCss: 'cor-ger' },
  { nome: 'Outros', letra: 'O', selecionado: true, classeCss: 'cor-outros' },
])

function getEstiloParaCategoria(cargo) {
  const mapa = {
    Enfermeiro: { letra: 'E', classeCss: 'cor-enf' },
    Médico: { letra: 'M', classeCss: 'cor-med' },
    'Técnico de Enfermagem': { letra: 'T', classeCss: 'cor-tec' },
    Gerente: { letra: 'G', classeCss: 'cor-ger' },
  }
  return mapa[cargo] || { letra: 'O', classeCss: 'cor-outros' }
}

const eventosFiltrados = computed(() => {
  const categoriasSelecionadas = categoriasFiltro.filter((c) => c.selecionado).map((c) => c.nome)
  return eventosMaster.value
    .map((e) => ({ id: e.id, title: e.titulo, start: e.data, extendedProps: e }))
    .filter((evento) => {
      const categoriaDoEvento = evento.extendedProps.categoriaProfissional
      if (categoriasSelecionadas.includes(categoriaDoEvento)) return true
      if (
        !['Enfermeiro', 'Médico', 'Técnico de Enfermagem', 'Gerente'].includes(categoriaDoEvento) &&
        categoriasSelecionadas.includes('Outros')
      )
        return true
      return false
    })
})

const calendarOptions = reactive({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'pt-br',
  headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
  buttonText: { today: 'Hoje' },
  events: eventosFiltrados,
  dateClick: (info) => handleDateClick(info),
  eventClick: (info) => handleEventClick(info),
})

watch(
  competencia,
  async (novaCompetencia) => {
    if (!novaCompetencia) return
    await carregarDados(novaCompetencia)
    const [ano, mes] = novaCompetencia.split('-').map(Number)
    const dataProximoMes = addMonths(new Date(ano, mes - 1, 15), 1)
    if (fullCalendarRef.value) {
      const calendarApi = fullCalendarRef.value.getApi()
      calendarApi.gotoDate(dataProximoMes)
    }
  },
  { immediate: true },
)

async function carregarDados(competenciaAtual) {
  carregando.value = true
  const equipeId = storeUsuario.usuario?.equipeId
  if (!equipeId) {
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'ID da equipe não encontrado.' })
    carregando.value = false
    return
  }
  try {
    const [profissionais, eventos] = await Promise.all([
      ServicoSCNES.carregarProfissionais(competenciaAtual, equipeId),
      servicoCronograma.buscarCronograma(competenciaAtual, equipeId),
    ])
    profissionaisDaEquipe.value = profissionais
    eventosMaster.value = eventos
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao carregar dados.' })
  } finally {
    carregando.value = false
  }
}

function abrirModalEvento(dadosIniciais = {}) {
  const defaults = {
    data: new Date().toISOString().slice(0, 10),
    titulo: '',
    local: '',
    profissionalId: null,
  }
  recorrencia.ativa = false
  recorrencia.dias = []
  eventoEmEdicao.value = { ...defaults, ...dadosIniciais }
  modal.modo = dadosIniciais.id ? 'editar' : 'adicionar'
  modal.visivel = true
}

function handleDateClick(clickInfo) {
  abrirModalEvento({ data: clickInfo.dateStr })
}

function handleEventClick(clickInfo) {
  abrirModalEvento({ ...clickInfo.event.extendedProps })
}

function fecharModal() {
  modal.visivel = false
}

const competenciaVisualizada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-').map(Number)
  const dataProximoMes = addMonths(new Date(ano, mes - 1, 15), 1)
  return format(dataProximoMes, 'yyyy-MM')
})
const competenciaVisualizadaFormatada = computed(() => {
  if (!competenciaVisualizada.value) return ''
  const [ano, mes] = competenciaVisualizada.value.split('-')
  return `${mes}/${ano}`
})

async function handleSalvarEvento() {
  salvando.value = true
  try {
    const profSelecionado = profissionaisDaEquipe.value.find(
      (p) => p.id === eventoEmEdicao.value.profissionalId,
    )
    if (!profSelecionado) {
      storeNotificacoes.mostrarNotificacao({
        tipo: 'alerta',
        mensagem: 'Selecione um profissional.',
      })
      salvando.value = false
      return
    }

    const eventoBase = {
      titulo: eventoEmEdicao.value.titulo,
      local: eventoEmEdicao.value.local,
      profissionalId: eventoEmEdicao.value.profissionalId,
      profissionalNome: profSelecionado.nome,
      categoriaProfissional: profSelecionado.cargo,
    }
    let eventosAtuais = [...eventosMaster.value]

    if (modal.modo === 'editar') {
      const index = eventosAtuais.findIndex((e) => e.id === eventoEmEdicao.value.id)
      if (index !== -1) {
        eventosAtuais[index] = { ...eventoEmEdicao.value, ...eventoBase }
      }
    } else {
      if (recorrencia.ativa && recorrencia.dias.length > 0) {
        const [ano, mes] = competenciaVisualizada.value.split('-').map(Number)
        const diasNoMes = new Date(ano, mes, 0).getDate()
        let eventosParaSalvar = []

        for (let dia = 1; dia <= diasNoMes; dia++) {
          const dataAtual = new Date(ano, mes - 1, dia)
          if (recorrencia.dias.includes(dataAtual.getDay())) {
            eventosParaSalvar.push({
              ...eventoBase,
              id: uuidv4(),
              data: dataAtual.toISOString().slice(0, 10),
            })
          }
        }
        if (eventosParaSalvar.length === 0) {
          storeNotificacoes.mostrarNotificacao({
            tipo: 'alerta',
            mensagem: 'Nenhum dia correspondente encontrado no mês do calendário.',
          })
          salvando.value = false
          return
        }
        eventosAtuais.push(...eventosParaSalvar)
      } else {
        eventosAtuais.push({ ...eventoBase, id: uuidv4(), data: eventoEmEdicao.value.data })
      }
    }

    await servicoCronograma.salvarCronograma(
      competencia.value,
      storeUsuario.usuario.equipeId,
      eventosAtuais,
    )
    storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Cronograma salvo!' })
    eventosMaster.value = eventosAtuais
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar cronograma:', error)
    storeNotificacoes.mostrarNotificacao({
      tipo: 'erro',
      mensagem: 'Falha ao salvar o cronograma.',
    })
  } finally {
    salvando.value = false
  }
}

async function handleRemoverEvento() {
  if (!confirm('Tem certeza que deseja remover este evento?')) return
  salvando.value = true
  try {
    const eventosFiltrados = eventosMaster.value.filter((e) => e.id !== eventoEmEdicao.value.id)
    await servicoCronograma.salvarCronograma(
      competencia.value,
      storeUsuario.usuario.equipeId,
      eventosFiltrados,
    )
    storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Evento removido!' })
    eventosMaster.value = eventosFiltrados
    fecharModal()
  } catch (error) {
    console.error('Erro ao remover evento:', error)
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao remover o evento.' })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.filtros-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
  flex-wrap: wrap;
}
.filtro-label {
  font-weight: 500;
}
.grupo-filtros label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}
.evento-customizado {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  overflow: hidden;
}
.titulo-evento {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
  max-width: 550px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
}
.input-padrao {
  height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.botao-primario span {
  margin-left: 0.5rem;
}
.container-recorrencia {
  border-top: 1px solid var(--cor-borda-suave);
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}
.campo-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.campo-checkbox label {
  font-weight: 500;
  cursor: pointer;
}
.opcoes-recorrencia {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid #e2e8f0;
}
.dias-semana {
  display: flex;
  gap: 0.5rem;
}
.dias-semana label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}
.dias-semana span {
  font-size: 0.8rem;
  padding: 0.5rem;
  width: 32px;
  height: 32px;
  display: grid;
  place-content: center;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 50%;
}
.dias-semana input[type='checkbox'] {
  display: none;
}
.dias-semana input[type='checkbox']:checked + span {
  background-color: var(--cor-primaria);
  color: white;
  border-color: var(--cor-primaria);
}

.letra-categoria,
.letra-categoria-filtro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}
.letra-categoria-filtro {
  width: 18px;
  height: 18px;
  font-size: 12px;
}
.cor-enf {
  background-color: #3b82f6;
} /* Azul */
.cor-med {
  background-color: #16a34a;
} /* Verde */
.cor-tec {
  background-color: #f97316;
} /* Laranja */
.cor-ger {
  background-color: #6d28d9;
} /* Roxo */
.cor-outros {
  background-color: #64748b;
} /* Cinza */
</style>
