<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Painel de Acompanhamento Semanal</h1>
    </header>

    <div class="filtros-card">
      <div class="campo">
        <label for="ano">Ano</label>
        <select id="ano" v-model="anoSelecionado" class="input-padrao">
          <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
        </select>
      </div>
      <div class="campo">
        <label for="semana">Semana Epidemiológica</label>
        <select
          id="semana"
          v-model="semanaKeySelecionada"
          :disabled="!anoSelecionado"
          class="input-padrao"
        >
          <option :value="null" disabled>Selecione uma semana</option>
          <option v-for="semana in semanasDoAno" :key="semana.chave" :value="semana.chave">
            {{ semana.display }}
          </option>
        </select>
      </div>
      <div class="campo">
        <label for="producao">Filtrar Produção</label>
        <select id="producao" v-model="filtroProducao" class="input-padrao">
          <option value="todos">Todas</option>
          <option value="mdda">MDDA</option>
          <option value="notificacaoSemanal">Notificação Semanal</option>
          <option value="sarampo">Sarampo</option>
        </select>
      </div>
      <div class="campo">
        <label for="status">Filtrar Status</label>
        <select id="status" v-model="filtroStatus" class="input-padrao">
          <option value="todos">Todos</option>
          <option value="Pendente">Pendentes</option>
          <option value="Entregue">Entregues</option>
        </select>
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card" style="margin-top: 2rem">
      <p>Buscando status de todas as equipes...</p>
    </div>

    <div v-else class="grid-acompanhamento">
      <div v-if="equipesFiltradas.length === 0" class="mensagem-info">
        Nenhuma equipe encontrada para os filtros selecionados.
      </div>
      <div v-for="equipe in equipesFiltradas" :key="equipe.equipeId" class="card-equipe">
        <div class="card-equipe-cabecalho">
          <h3 class="nome-equipe">{{ equipe.equipeNome }}</h3>
          <span class="nome-ubs">{{ equipe.ubsNome }}</span>
        </div>
        <div class="card-equipe-conteudo">
          <ul>
            <li v-if="filtroProducao === 'todos' || filtroProducao === 'mdda'">
              <span>MDDA</span>
              <IndicadorStatusProducao :status="equipe.statusModulos.mdda" />
            </li>
            <li v-if="filtroProducao === 'todos' || filtroProducao === 'notificacaoSemanal'">
              <span>Notificação Semanal</span>
              <IndicadorStatusProducao :status="equipe.statusModulos.notificacaoSemanal" />
            </li>
            <li v-if="filtroProducao === 'todos' || filtroProducao === 'sarampo'">
              <span>Sarampo</span>
              <IndicadorStatusProducao :status="equipe.statusModulos.sarampo" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'
import { ServicoAcompanhamento } from '../servicos/ServicoAcompanhamento'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'

const carregando = ref(true)
const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

const filtroProducao = ref('todos')
const filtroStatus = ref('todos')

const dadosCompletos = ref([])

watch(semanaKeySelecionada, (novaSemana) => {
  if (novaSemana) {
    buscarDadosDaSemana()
  }
})

onMounted(() => {
  anosDisponiveis.value = semanaEpidemiologicaUtils.getAnosDisponiveis()
  const anoAtual = new Date().getFullYear()

  if (anosDisponiveis.value.includes(anoAtual)) {
    anoSelecionado.value = anoAtual
  } else {
    anoSelecionado.value = anosDisponiveis.value[0]
  }

  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const semanaAtual = semanaEpidemiologicaUtils.getSemanaAtual()

  if (semanaAtual && String(semanaAtual.chave).startsWith(String(anoSelecionado.value))) {
    semanaKeySelecionada.value = semanaAtual.chave
  } else if (semanasDoAno.value.length > 0) {
    semanaKeySelecionada.value = semanasDoAno.value[0].chave
  } else {
    carregando.value = false
  }
})

async function buscarDadosDaSemana() {
  carregando.value = true
  dadosCompletos.value = []
  try {
    dadosCompletos.value = await ServicoAcompanhamento.buscarStatusProducaoSemanal(
      semanaKeySelecionada.value,
    )
  } catch (error) {
    console.error('Erro ao buscar dados de acompanhamento:', error)
  } finally {
    carregando.value = false
  }
}

const equipesFiltradas = computed(() => {
  return dadosCompletos.value.filter((equipe) => {
    // Filtro de Status
    if (filtroStatus.value !== 'todos') {
      if (filtroProducao.value !== 'todos') {
        if (equipe.statusModulos[filtroProducao.value] !== filtroStatus.value) return false
      } else {
        if (!Object.values(equipe.statusModulos).some((status) => status === filtroStatus.value))
          return false
      }
    }
    return true
  })
})

function deveExibirModulo(equipe, nomeModulo) {
  if (filtroProducao.value !== 'todos' && filtroProducao.value !== nomeModulo) {
    return false
  }
  return true
}
</script>

<style scoped>
/* O seletor .filtros-card agora não tem fundo, apenas organiza os elementos */
.filtros-card {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem 0; /* Adiciona um padding vertical para respiro */
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
  min-width: 220px;
}

/* ADICIONADO: Espaçamento acima da grade de cards */
.grid-acompanhamento {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem; /* Aumenta a distância dos filtros */
}

.card-equipe {
  background-color: #fff;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-equipe-cabecalho {
  padding: 1rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}

.nome-equipe {
  margin: 0;
  font-size: 1.1rem;
  color: var(--cor-texto-padrao);
}
.nome-ubs {
  font-size: 0.85rem;
  color: #64748b;
}

.card-equipe-conteudo ul {
  list-style: none;
  padding: 1rem;
  margin: 0;
}

.card-equipe-conteudo li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.card-equipe-conteudo li + li {
  border-top: 1px solid #f1f5f9;
}

.mensagem-info {
  text-align: center;
  padding: 2rem;
  font-weight: 500;
  color: #64748b;
  grid-column: 1 / -1; /* Faz a mensagem ocupar toda a largura do grid */
}
</style>
