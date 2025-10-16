<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Painel de Acompanhamento Mensal</h1>
    </header>

    <div class="conteudo-card card-filtros">
      <div class="campo">
        <label for="competencia">Competência</label>
        <input
          id="competencia"
          type="month"
          v-model="competenciaSelecionada"
          class="input-padrao"
        />
      </div>

      <div class="campo">
        <label>Equipes</label>
        <div class="dropdown-multiselect">
          <button @click="toggleDropdown" class="input-padrao dropdown-botao">
            <span>{{ dropdownLabel }}</span>
            <ChevronDown :size="16" :class="{ 'dropdown-aberto': isDropdownOpen }" />
          </button>
          <div v-if="isDropdownOpen" class="dropdown-painel">
            <label>
              <input
                type="checkbox"
                @change="toggleTodasEquipes"
                :checked="todasEquipesSelecionadas"
              />
              <strong>(Marcar/Desmarcar Todas)</strong>
            </label>
            <label v-for="equipe in todasAsEquipes" :key="equipe.id">
              <input type="checkbox" :value="equipe.id" v-model="equipesSelecionadas" />
              {{ equipe.nome }}
            </label>
          </div>
        </div>
      </div>

      <div class="campo">
        <label for="filtro-producao">Filtrar Produção</label>
        <select id="filtro-producao" v-model="filtroProducao" class="input-padrao">
          <option value="todas">Todas as Produções</option>
          <option v-for="mod in modulosMensais" :key="mod.chave" :value="mod.chave">
            {{ mod.nome }}
          </option>
        </select>
      </div>
      <div class="campo">
        <label for="filtro-status">Filtrar Status</label>
        <select id="filtro-status" v-model="filtroStatus" class="input-padrao">
          <option value="todos">Todos</option>
          <option value="Pendente">Pendentes</option>
          <option value="Entregue">Entregues</option>
        </select>
      </div>
    </div>

    <div v-if="carregando" class="carregando-container">
      <LoaderCircle :size="32" class="animate-spin" />
      <span>Buscando status de todas as equipes...</span>
    </div>
    <div v-else class="grid-acompanhamento">
      <div v-if="equipesFiltradas.length === 0" class="aviso-sem-dados">
        Nenhuma equipe encontrada para os filtros selecionados.
      </div>
      <div v-for="equipe in equipesFiltradas" :key="equipe.id" class="card-equipe">
        <div class="cabecalho-card">
          <h3 class="nome-equipe">{{ equipe.nome }}</h3>
          <span class="nome-ubs">{{ equipe.nomeUbs }}</span>
        </div>
        <ul class="lista-producao">
          <li v-for="modulo in equipe.modulos" :key="modulo.chave">
            <span>{{ modulo.nome }}</span>
            <IndicadorStatusProducao :status="modulo.status" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { servicoVerificacaoProducao } from '@/modulos/enfermeiro/servicos/servicoVerificacaoProducao'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'
import { LoaderCircle, ChevronDown } from 'lucide-vue-next'

const carregando = ref(true)
const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const filtroProducao = ref('todas')
const filtroStatus = ref('todos')
const equipesComStatus = ref([])
const todasAsEquipes = ref([])

const equipesSelecionadas = ref([])
const isDropdownOpen = ref(false)

const modulosMensais = [
  { nome: 'Adolescente', chave: 'adolescente' },
  { nome: 'Boletim de Testes', chave: 'boletimTestesRapidos' },
  { nome: 'BPA', chave: 'bpa' },
  { nome: 'Cronograma', chave: 'cronograma' },
  { nome: 'Educação Permanente', chave: 'educacaoPermanente' },
  { nome: 'Gestantes', chave: 'gestantes' },
  { nome: 'Saúde Mental', chave: 'saudeMental' },
  { nome: 'SCNES', chave: 'scnes' },
  { nome: 'Suplementos', chave: 'suplementos' },
].sort((a, b) => a.nome.localeCompare(b.nome))

const todasEquipesSelecionadas = computed(
  () =>
    todasAsEquipes.value.length > 0 &&
    equipesSelecionadas.value.length === todasAsEquipes.value.length,
)
const dropdownLabel = computed(() => {
  if (equipesSelecionadas.value.length === 0) return 'Todas as equipes'
  if (equipesSelecionadas.value.length === 1) return '1 equipe selecionada'
  return `${equipesSelecionadas.value.length} equipes selecionadas`
})
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}
function toggleTodasEquipes(event) {
  equipesSelecionadas.value = event.target.checked ? todasAsEquipes.value.map((e) => e.id) : []
}

const buscarStatusProducao = async (competencia) => {
  if (!competencia) return
  carregando.value = true

  if (todasAsEquipes.value.length === 0) {
    const equipesBuscadas = await servicoEquipes.buscarTodas()
    // ======================================================================================
    // == ALTERAÇÃO CIRÚRGICA: Garante a ordenação alfabética pelo nome da equipe.
    // ======================================================================================
    todasAsEquipes.value = equipesBuscadas.sort((a, b) => a.nome.localeCompare(b.nome))
  }

  const promessasStatus = todasAsEquipes.value.map(async (equipe) => {
    const promessasModulos = modulosMensais.map(async (modulo) => {
      const foiEntregue = await servicoVerificacaoProducao.verificarEntregaMensal(
        competencia,
        equipe.id,
        modulo.chave,
      )
      return { ...modulo, status: foiEntregue ? 'Entregue' : 'Pendente' }
    })

    const modulos = await Promise.all(promessasModulos)
    return { ...equipe, modulos }
  })

  equipesComStatus.value = await Promise.all(promessasStatus)
  carregando.value = false
}

const equipesFiltradas = computed(() => {
  return equipesComStatus.value
    .filter((equipe) => {
      if (equipesSelecionadas.value.length === 0) return true
      return equipesSelecionadas.value.includes(equipe.id)
    })
    .map((equipe) => {
      const modulosParaExibir =
        filtroProducao.value === 'todas'
          ? equipe.modulos
          : equipe.modulos.filter((m) => m.chave === filtroProducao.value)
      return { ...equipe, modulos: modulosParaExibir }
    })
    .filter((equipe) => {
      if (filtroStatus.value === 'todos') {
        return true
      }
      if (filtroStatus.value === 'Pendente') {
        return equipe.modulos.some((m) => m.status === 'Pendente')
      }
      if (filtroStatus.value === 'Entregue') {
        return equipe.modulos.length > 0 && equipe.modulos.every((m) => m.status === 'Entregue')
      }
      return true
    })
})

watch(competenciaSelecionada, buscarStatusProducao, { immediate: true })
</script>

<style scoped>
.card-filtros {
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}
.input-padrao {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 240px;
  height: 42px;
}
.carregando-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--cor-texto-padrao);
}
.animate-spin {
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.grid-acompanhamento {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.aviso-sem-dados {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  color: #475569;
}
.card-equipe {
  background-color: #fff;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}
.cabecalho-card {
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.nome-equipe {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
.nome-ubs {
  font-size: 0.8rem;
  color: #64748b;
}
.lista-producao {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.lista-producao li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ESTILOS PARA O DROPDOWN */
.dropdown-multiselect {
  position: relative;
}
.dropdown-botao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
  background-color: white;
  cursor: pointer;
}
.dropdown-botao svg {
  transition: transform 0.2s;
}
.dropdown-botao .dropdown-aberto {
  transform: rotate(180deg);
}
.dropdown-painel {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 300px;
  max-height: 250px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 0.5rem;
}
.dropdown-painel label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}
.dropdown-painel label:hover {
  background-color: #f8fafc;
}
</style>
