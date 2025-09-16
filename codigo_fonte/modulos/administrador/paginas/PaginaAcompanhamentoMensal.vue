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
import { LoaderCircle } from 'lucide-vue-next'

const carregando = ref(true)
const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const filtroProducao = ref('todas')
const filtroStatus = ref('todos')
const equipesComStatus = ref([])

// MODIFICADO: Lista de módulos agora inclui Saúde Mental e está ordenada
const modulosMensais = [
  { nome: 'Adolescente', chave: 'adolescente' },
  { nome: 'BPA', chave: 'bpa' },
  { nome: 'Educação Permanente', chave: 'educacaoPermanente' },
  { nome: 'Gestantes', chave: 'gestantes' },
  { nome: 'Saúde Mental', chave: 'saudeMental' },
  { nome: 'SCNES', chave: 'scnes' },
  { nome: 'Suplementos', chave: 'suplementos' },
]

const buscarStatusProducao = async (competencia) => {
  if (!competencia) return
  carregando.value = true

  const todasEquipes = await servicoEquipes.buscarTodas()

  const promessasStatus = todasEquipes.map(async (equipe) => {
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
/* Nenhum estilo precisa ser alterado aqui */
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
.grid-acompanhamento {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.aviso-sem-dados {
  width: 100%;
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
</style>
