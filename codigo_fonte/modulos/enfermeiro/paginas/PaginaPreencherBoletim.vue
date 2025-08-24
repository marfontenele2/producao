<template>
  <div class="pagina-container" v-if="teste">
    <header class="pagina-cabecalho">
      <h1>Lançamento: {{ teste.nome }}</h1>
      <button class="botao botao-primario" @click="salvar" :disabled="salvando">
        <Save :size="18" /> {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
      </button>
    </header>

    <div v-if="carregando" class="conteudo-card" style="margin-top: 1rem; text-align: center">
      Carregando...
    </div>
    <form v-else @submit.prevent="salvar" class="form-container">
      <div v-for="marca in marcasLiberadas" :key="marca.id" class="conteudo-card card-marca">
        <h2 class="secao-titulo">{{ marca.nome }}</h2>

        <div class="secao-dados">
          <h3 class="subtitulo">Realizados</h3>
          <div class="grid-campos">
            <div class="campo">
              <label>Pré-Natal</label
              ><input
                type="number"
                min="0"
                v-model.number="dadosEntrada.testes[teste.id][marca.id].realizados.preNatal"
              />
            </div>
            <div class="campo">
              <label>Mobilização</label
              ><input
                type="number"
                min="0"
                v-model.number="dadosEntrada.testes[teste.id][marca.id].realizados.mobilizacao"
              />
            </div>
            <div class="campo">
              <label>Treinamentos</label
              ><input
                type="number"
                min="0"
                v-model.number="dadosEntrada.testes[teste.id][marca.id].realizados.treinamentos"
              />
            </div>
            <div class="campo">
              <label>Rotina</label
              ><input
                type="number"
                min="0"
                v-model.number="dadosEntrada.testes[teste.id][marca.id].realizados.rotina"
              />
            </div>
          </div>
        </div>

        <div class="secao-dados">
          <h3 class="subtitulo">Resultados</h3>
          <div class="campo campo-reagentes">
            <label>Reagentes</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosEntrada.testes[teste.id][marca.id].reagentes"
            />
          </div>
        </div>

        <TabelaPerdasInvalidos
          titulo="Testes Inválidos"
          :itens="dadosEntrada.testes[teste.id][marca.id].invalidos"
        />
        <TabelaPerdasInvalidos
          titulo="Testes Perdidos"
          :itens="dadosEntrada.testes[teste.id][marca.id].perdidos"
          com-motivo
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { get, set } from 'lodash'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoLiberacoes } from '@/modulos/administrador/servicos/servicoLiberacoes'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoBoletim } from '@/modulos/enfermeiro/servicos/servicoBoletim'
import TabelaPerdasInvalidos from '@/modulos/enfermeiro/componentes/TabelaPerdasInvalidos.vue'
import { Save } from 'lucide-vue-next'

const route = useRoute()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const salvando = ref(false)
const teste = ref(null)
const marcasLiberadas = ref([])
const dadosEntrada = ref({ testes: {} })

const hoje = new Date()
const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
const testeId = route.params.testeId

onMounted(async () => {
  try {
    const equipeId = storeUsuario.usuario.equipeId

    const [catalogoTestes, liberacoes, dadosSalvos] = await Promise.all([
      servicoTestes.buscarTodos(),
      new Promise((resolve) =>
        servicoLiberacoes.monitorarLiberacoes(competenciaAtual, (r) => resolve(r)),
      ),
      servicoBoletim.buscarDados(competenciaAtual, equipeId),
    ])

    teste.value = catalogoTestes.find((t) => t.id === testeId)

    // [CORRIGIDO] Adiciona verificação para o caso de teste não ser encontrado no catálogo
    if (!teste.value) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: 'O teste selecionado não foi encontrado no catálogo.',
        tipo: 'erro',
      })
      carregando.value = false
      return
    }

    const idsMarcasLiberadas = Object.keys(get(liberacoes, ['testesLiberados', testeId], {}))
    marcasLiberadas.value = teste.value.marcas.filter((m) => idsMarcasLiberadas.includes(m.id))

    dadosEntrada.value = dadosSalvos || { testes: {} }

    set(dadosEntrada.value, ['testes', testeId], get(dadosEntrada.value, ['testes', testeId], {}))

    marcasLiberadas.value.forEach((marca) => {
      const basePath = ['testes', testeId, marca.id]
      const defaults = {
        realizados: { preNatal: 0, mobilizacao: 0, treinamentos: 0, rotina: 0 },
        reagentes: 0,
        invalidos: [],
        perdidos: [],
      }
      const dadosExistentes = get(dadosEntrada.value, basePath, {})
      set(dadosEntrada.value, basePath, { ...defaults, ...dadosExistentes })
    })
  } catch (error) {
    console.error('Erro ao montar página de preenchimento do boletim:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Erro ao carregar dados da página.',
      tipo: 'erro',
    })
  } finally {
    carregando.value = false
  }
})

async function salvar() {
  salvando.value = true
  try {
    const { equipeId, ubsId, uid } = storeUsuario.usuario
    await servicoBoletim.salvarDados(competenciaAtual, equipeId, ubsId, uid, dadosEntrada.value)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Alterações salvas com sucesso!',
      tipo: 'sucesso',
    })
  } catch (error) {
    console.error(error)
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao salvar alterações.', tipo: 'erro' })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card-marca {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.secao-titulo {
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.subtitulo {
  font-size: 1rem;
  margin: 0;
}
.grid-campos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
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
.campo-reagentes {
  max-width: 200px;
}
</style>
