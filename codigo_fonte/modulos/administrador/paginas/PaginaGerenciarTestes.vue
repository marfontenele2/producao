<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciar Catálogo de Testes e Marcas</h1>
    </header>

    <div v-if="carregando" class="mensagem-info">Carregando catálogo de testes...</div>

    <div class="grid-testes" v-else>
      <div v-for="teste in catalogo" :key="teste.id" class="conteudo-card">
        <h3 class="nome-teste">{{ teste.nome }}</h3>

        <div class="cabecalho-marcas">
          <span>Marca Comercial</span>
          <span>Qtd. por Caixa</span>
        </div>

        <ul class="lista-marcas">
          <li v-if="!teste.marcas || teste.marcas.length === 0" class="item-vazio">
            Nenhuma marca cadastrada.
          </li>
          <li v-for="marca in teste.marcas" :key="marca.id" class="item-marca">
            <span class="nome-marca">{{ marca.nome }}</span>
            <input
              type="number"
              min="1"
              placeholder="Ex: 20"
              class="input-qtd"
              v-model.number="marca.quantidadePorCaixa"
            />
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
            v-model="novasMarcas[teste.id].nome"
            placeholder="Nome da nova marca"
            required
            class="input-nome-marca"
          />
          <input
            type="number"
            min="1"
            v-model.number="novasMarcas[teste.id].quantidadePorCaixa"
            placeholder="Qtd/Caixa"
            required
            class="input-qtd-nova"
          />
          <button type="submit" class="botao-adicionar-marca">
            <Plus :size="18" />
          </button>
        </form>

        <div class="rodape-card">
          <button @click="atualizarTeste(teste)" class="botao botao-secundario">
            <Save :size="16" /> Salvar Alterações em {{ teste.nome }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoTestes } from '../servicos/servicoTestes.js'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { v4 as uuidv4 } from 'uuid'
import { Plus, Trash2, Save } from 'lucide-vue-next'

const catalogo = ref([])
const carregando = ref(true)
const novasMarcas = ref({})
const storeNotificacoes = useStoreNotificacoes()

let unsubscribe = null

onMounted(async () => {
  await servicoTestes.inicializarTestesPadrao()

  unsubscribe = servicoTestes.monitorarTestes((lista) => {
    catalogo.value = lista
    lista.forEach((t) => {
      if (!novasMarcas.value[t.id]) {
        novasMarcas.value[t.id] = { nome: '', quantidadePorCaixa: null }
      }
    })
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function adicionarNovaMarca(idTeste) {
  const novaMarca = novasMarcas.value[idTeste]
  const nomeMarca = novaMarca?.nome?.trim()
  const qtd = novaMarca?.quantidadePorCaixa

  if (!nomeMarca || !qtd || qtd < 1) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Por favor, preencha o nome da marca e a quantidade por caixa (maior que zero).',
      tipo: 'alerta',
    })
    return
  }

  try {
    await servicoTestes.adicionarMarca(idTeste, {
      id: uuidv4(),
      nome: nomeMarca,
      quantidadePorCaixa: qtd,
    })
    novasMarcas.value[idTeste] = { nome: '', quantidadePorCaixa: null }
  } catch (error) {
    console.error('Erro ao adicionar marca:', error)
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao adicionar a marca.' })
  }
}

async function atualizarTeste(teste) {
  const marcaInvalida = teste.marcas.find((m) => !m.quantidadePorCaixa || m.quantidadePorCaixa < 1)
  if (marcaInvalida) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: `A marca "${marcaInvalida.nome}" precisa ter uma quantidade por caixa válida (maior que zero).`,
      tipo: 'alerta',
    })
    return
  }

  try {
    await servicoTestes.atualizarTeste(teste.id, { marcas: teste.marcas })
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Alterações em "${teste.nome}" salvas com sucesso!`,
      tipo: 'sucesso',
    })
  } catch (error) {
    console.error(`Erro ao atualizar teste ${teste.id}:`, error)
    storeNotificacoes.mostrarNotificacao({
      tipo: 'erro',
      mensagem: 'Falha ao salvar as alterações.',
    })
  }
}

async function removerMarca(idTeste, marca) {
  if (window.confirm(`Tem certeza que deseja remover a marca "${marca.nome}"?`)) {
    try {
      await servicoTestes.removerMarca(idTeste, marca)
      storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Marca removida.' })
    } catch (error) {
      console.error('Erro ao remover marca:', error)
      storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao remover a marca.' })
    }
  }
}
</script>

<style scoped>
.grid-testes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}
.nome-teste {
  margin-top: 0;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  color: var(--cor-primaria);
}
.cabecalho-marcas {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--cor-texto-secundario);
  padding: 0 40px 0.5rem 0.5rem;
}
.lista-marcas {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  min-height: 100px;
}
.item-marca {
  display: grid;
  grid-template-columns: 1fr 100px 32px;
  gap: 0.5rem;
  align-items: center;
  padding: 8px 4px;
  border-bottom: 1px solid #f1f5f9;
}
.input-qtd {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  text-align: center;
}
.item-vazio {
  color: #94a3b8;
  font-style: italic;
  padding: 1rem 0;
}
.botao-remover {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  justify-self: center;
}
.botao-remover:hover {
  opacity: 1;
}
.form-adicionar-marca {
  display: grid;
  grid-template-columns: 1fr 100px 40px;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda-suave);
}
.form-adicionar-marca input {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
}
.input-qtd-nova {
  text-align: center;
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
.rodape-card {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda-suave);
  display: flex;
  justify-content: flex-end;
}
.conteudo-card {
  display: flex;
  flex-direction: column;
}
</style>
