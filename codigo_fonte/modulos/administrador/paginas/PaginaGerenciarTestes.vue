<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciar Catálogo de Testes e Marcas</h1>
    </header>

    <div v-if="carregando" class="mensagem-info">Carregando catálogo de testes...</div>

    <div class="grid-testes" v-else>
      <div v-for="teste in catalogo" :key="teste.id" class="conteudo-card">
        <h3 class="nome-teste">{{ teste.nome }}</h3>

        <ul class="lista-marcas">
          <li v-if="!teste.marcas || teste.marcas.length === 0" class="item-vazio">
            Nenhuma marca cadastrada.
          </li>
          <li v-for="marca in teste.marcas" :key="marca.id" class="item-marca">
            <span>{{ marca.nome }}</span>
            <button
              @click="removerMarca(teste.id, marca)"
              class="botao-remover"
              title="Remover Marca"
            >
              <Trash2 :size="16" />
            </button>
          </li>
        </ul>

        <form @submit.prevent="adicionarNovaMarca(teste.id)" class="form-adicionar-marca">
          <input
            type="text"
            v-model="novasMarcas[teste.id]"
            placeholder="Nome da nova marca"
            required
          />
          <button type="submit" class="botao-adicionar-marca">
            <Plus :size="18" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoTestes } from '../servicos/servicoTestes.js'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Trash2 } from 'lucide-vue-next'

const catalogo = ref([])
const carregando = ref(true)
const novasMarcas = ref({})

let unsubscribe = null

onMounted(async () => {
  // Garante que os testes base existam
  await servicoTestes.inicializarTestesPadrao()

  unsubscribe = servicoTestes.monitorarTestes((lista) => {
    catalogo.value = lista
    // Inicializa o objeto para os inputs de novas marcas
    lista.forEach((t) => {
      if (!novasMarcas.value[t.id]) {
        novasMarcas.value[t.id] = ''
      }
    })
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function adicionarNovaMarca(idTeste) {
  const nomeMarca = novasMarcas.value[idTeste]?.trim()
  if (!nomeMarca) return

  try {
    await servicoTestes.adicionarMarca(idTeste, { id: uuidv4(), nome: nomeMarca })
    novasMarcas.value[idTeste] = '' // Limpa o campo
  } catch (error) {
    console.error('Erro ao adicionar marca:', error)
  }
}

async function removerMarca(idTeste, marca) {
  if (window.confirm(`Tem certeza que deseja remover a marca "${marca.nome}"?`)) {
    try {
      await servicoTestes.removerMarca(idTeste, marca)
    } catch (error) {
      console.error('Erro ao remover marca:', error)
    }
  }
}
</script>

<style scoped>
.grid-testes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
.nome-teste {
  margin-top: 0;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  color: var(--cor-primaria);
}
.lista-marcas {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  min-height: 100px;
}
.item-marca {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  border-bottom: 1px solid #f1f5f9;
}
.item-vazio {
  color: #94a3b8;
  font-style: italic;
}
.botao-remover {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.botao-remover:hover {
  opacity: 1;
}
.form-adicionar-marca {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda-suave);
}
.form-adicionar-marca input {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
}
.form-adicionar-marca button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: var(--cor-primaria);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.conteudo-card {
  display: flex;
  flex-direction: column;
}
</style>
