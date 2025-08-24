<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciar Liberações do Boletim</h1>
      <button class="botao botao-primario" @click="salvar" :disabled="carregando">
        <Save :size="18" />
        <span>Salvar Liberações</span>
      </button>
    </header>

    <div class="conteudo-card">
      <div class="seletor-competencia">
        <label for="competencia">Selecione a Competência (Mês/Ano):</label>
        <input id="competencia" type="month" v-model="competenciaSelecionada" />
      </div>

      <p v-if="carregando" class="mensagem-info">Carregando catálogo e liberações...</p>

      <div v-else class="grid-testes">
        <div v-for="teste in catalogo" :key="teste.id" class="card-teste">
          <h3 class="nome-teste">{{ teste.nome }}</h3>
          <ul class="lista-marcas">
            <li v-if="!teste.marcas || teste.marcas.length === 0" class="item-vazio">
              Nenhuma marca cadastrada no catálogo.
            </li>
            <li v-for="marca in teste.marcas" :key="marca.id" class="item-marca">
              <label :for="marca.id">
                <input
                  type="checkbox"
                  :id="marca.id"
                  :checked="isMarcaLiberada(teste.id, marca.id)"
                  @change="toggleMarca(teste.id, marca.id)"
                />
                {{ marca.nome }}
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { servicoTestes } from '../servicos/servicoTestes.js'
import { servicoLiberacoes } from '../servicos/servicoLiberacoes.js'
import { Save } from 'lucide-vue-next'

const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const carregando = ref(true)
const catalogo = ref([])
const liberacoesAtuais = ref({})

let unsubTestes = null
let unsubLiberacoes = null

onMounted(() => {
  unsubTestes = servicoTestes.monitorarTestes((lista) => {
    catalogo.value = lista
  })
})

watch(
  competenciaSelecionada,
  (novaCompetencia) => {
    if (unsubLiberacoes) unsubLiberacoes()
    carregando.value = true

    unsubLiberacoes = servicoLiberacoes.monitorarLiberacoes(novaCompetencia, (dados) => {
      liberacoesAtuais.value = dados.testesLiberados || {}
      carregando.value = false
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  if (unsubTestes) unsubTestes()
  if (unsubLiberacoes) unsubLiberacoes()
})

function isMarcaLiberada(idTeste, idMarca) {
  return liberacoesAtuais.value[idTeste]?.includes(idMarca) || false
}

function toggleMarca(idTeste, idMarca) {
  if (!liberacoesAtuais.value[idTeste]) {
    liberacoesAtuais.value[idTeste] = []
  }

  const index = liberacoesAtuais.value[idTeste].indexOf(idMarca)
  if (index > -1) {
    liberacoesAtuais.value[idTeste].splice(index, 1)
  } else {
    liberacoesAtuais.value[idTeste].push(idMarca)
  }
}

async function salvar() {
  try {
    await servicoLiberacoes.salvarLiberacoes(competenciaSelecionada.value, {
      testesLiberados: liberacoesAtuais.value,
    })
    alert('Liberações salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar liberações:', error)
    alert('Falha ao salvar as liberações.')
  }
}
</script>

<style scoped>
.seletor-competencia {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.seletor-competencia label {
  margin-right: 1rem;
  font-weight: 500;
}
.seletor-competencia input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
  font-size: 1rem;
}

.grid-testes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.card-teste {
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  padding: 1rem;
}
.nome-teste {
  margin-top: 0;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--cor-primaria);
  border-bottom: 1px solid #e2e8f0;
}
.lista-marcas {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item-marca label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.item-marca label:hover {
  background-color: #f8fafc;
}
.item-marca input[type='checkbox'] {
  width: 18px;
  height: 18px;
}
.item-vazio {
  color: #94a3b8;
  font-style: italic;
  padding: 8px;
}
</style>
