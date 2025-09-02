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
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { Save } from 'lucide-vue-next'

const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const carregando = ref(true)
const catalogo = ref([])
const liberacoesAtuais = ref({})
const storeNotificacoes = useStoreNotificacoes()

let unsubTestes = null

async function carregarDadosDaCompetencia() {
  carregando.value = true
  try {
    const dados = await servicoLiberacoes.buscarLiberacoes(competenciaSelecionada.value)
    liberacoesAtuais.value = dados.testesLiberados || {}
  } catch (error) {
    console.error('Erro ao buscar liberações:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao carregar as liberações.',
      tipo: 'erro',
    })
    liberacoesAtuais.value = {}
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  unsubTestes = servicoTestes.monitorarTestes((lista) => {
    catalogo.value = lista
  })
  carregarDadosDaCompetencia()
})

watch(competenciaSelecionada, carregarDadosDaCompetencia)

onUnmounted(() => {
  if (unsubTestes) unsubTestes()
})

function isMarcaLiberada(idTeste, idMarca) {
  return !!liberacoesAtuais.value[idTeste]?.[idMarca]
}

/**
 * @JSDoc_MODIFICADO
 * Refatorado para usar spread syntax (...) para garantir imutabilidade e reatividade.
 * Em vez de clonar o objeto inteiro, criamos uma nova referência para o objeto principal
 * e para o sub-objeto do teste que está sendo modificado.
 */
function toggleMarca(idTeste, idMarca) {
  console.group(`[DEBUG ADMIN] Toggle Marca: ${idTeste} - ${idMarca}`)
  console.log('Estado ANTES da alteração:', JSON.parse(JSON.stringify(liberacoesAtuais.value)))

  // Cria uma cópia do sub-objeto (marcas) do teste específico
  const marcasDoTesteAtualizado = { ...(liberacoesAtuais.value[idTeste] || {}) }

  if (marcasDoTesteAtualizado[idMarca]) {
    delete marcasDoTesteAtualizado[idMarca]
  } else {
    marcasDoTesteAtualizado[idMarca] = true
  }

  // Cria uma nova referência para o objeto principal, garantindo a reatividade
  liberacoesAtuais.value = {
    ...liberacoesAtuais.value,
    [idTeste]: marcasDoTesteAtualizado,
  }

  console.log('Estado DEPOIS da alteração:', JSON.parse(JSON.stringify(liberacoesAtuais.value)))
  console.groupEnd()
}

async function salvar() {
  carregando.value = true
  try {
    await servicoLiberacoes.salvarLiberacoes(competenciaSelecionada.value, {
      testesLiberados: liberacoesAtuais.value,
    })
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Liberações salvas com sucesso!',
      tipo: 'sucesso',
    })
  } catch (error) {
    console.error('Erro ao salvar liberações:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao salvar as liberações.',
      tipo: 'erro',
    })
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
/* Estilos permanecem inalterados */
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
