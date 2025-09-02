<template>
  <div class="modal-backdrop" @click.self="fechar">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Registrar Entrada no Estoque</h2>
        <button class="botao-fechar" @click="fechar">
          <X :size="24" />
        </button>
      </header>

      <main class="modal-corpo">
        <form id="form-entrada-estoque" @submit.prevent="submeterFormulario">
          <div class="grid-formulario">
            <div class="campo">
              <label for="tipo-teste">Tipo de Teste</label>
              <select id="tipo-teste" v-model="lote.testeId" @change="aoSelecionarTeste" required>
                <option :value="null" disabled>Selecione um tipo de teste</option>
                <option v-for="teste in props.catalogoTestes" :key="teste.id" :value="teste.id">
                  {{ teste.nome }}
                </option>
              </select>
            </div>
            <div class="campo">
              <label for="marca-comercial">Marca Comercial</label>
              <select
                id="marca-comercial"
                v-model="lote.marcaId"
                @change="aoSelecionarMarca"
                :disabled="!lote.testeId"
                required
              >
                <option :value="null" disabled>Selecione uma marca</option>
                <option v-for="marca in marcasDisponiveis" :key="marca.id" :value="marca.id">
                  {{ marca.nome }}
                </option>
              </select>
            </div>

            <div class="campo">
              <label for="codigo-lote">Código do Lote</label>
              <input
                type="text"
                id="codigo-lote"
                v-model.trim="lote.codigoLote"
                required
                placeholder="Ex: A1B2C3D4"
              />
            </div>
            <div class="campo">
              <label for="data-validade">Data de Validade</label>
              <input type="date" id="data-validade" v-model="lote.dataValidade" required />
            </div>

            <div class="campo">
              <label for="qtd-caixa">Quantidade de Testes por Caixa</label>
              <input
                type="number"
                id="qtd-caixa"
                min="1"
                v-model.number="lote.quantidadePorCaixa"
                required
              />
            </div>
            <div class="campo">
              <label for="num-caixas">Nº de Caixas Recebidas</label>
              <input
                type="number"
                id="num-caixas"
                min="1"
                v-model.number="lote.numeroCaixas"
                required
              />
            </div>
          </div>
        </form>
      </main>

      <footer class="modal-rodape">
        <div class="total-calculado">
          <span>Total a ser adicionado:</span>
          <strong>{{ quantidadeTotalInicial }} testes</strong>
        </div>
        <div class="botoes-acao">
          <button class="botao botao-acao" @click="fechar">Cancelar</button>
          <button
            class="botao botao-primario"
            type="submit"
            form="form-entrada-estoque"
            :disabled="!isFormularioValido"
          >
            <Save :size="18" />
            Registrar Entrada
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({
  catalogoTestes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['fechar', 'salvar'])

const storeNotificacoes = useStoreNotificacoes()
const storeUsuario = useStoreUsuario()

const criarLoteInicial = () => ({
  testeId: null,
  testeNome: '',
  marcaId: null,
  marcaNome: '',
  codigoLote: '',
  dataValidade: '',
  quantidadePorCaixa: null,
  numeroCaixas: null,
})

const lote = ref(criarLoteInicial())

const marcasDisponiveis = computed(() => {
  if (!lote.value.testeId || !props.catalogoTestes) return []
  const testeSelecionado = props.catalogoTestes.find((t) => t.id === lote.value.testeId)
  return testeSelecionado ? testeSelecionado.marcas : []
})

const quantidadeTotalInicial = computed(() => {
  const porCaixa = lote.value.quantidadePorCaixa || 0
  const numCaixas = lote.value.numeroCaixas || 0
  return porCaixa * numCaixas
})

const isFormularioValido = computed(() => {
  return (
    Object.values(lote.value).every((val) => val !== null && val !== '') &&
    quantidadeTotalInicial.value > 0
  )
})

function aoSelecionarTeste() {
  lote.value.marcaId = null
  lote.value.marcaNome = ''
  const testeSelecionado = props.catalogoTestes.find((t) => t.id === lote.value.testeId)
  if (testeSelecionado) {
    lote.value.testeNome = testeSelecionado.nome
  }
}

function aoSelecionarMarca() {
  const marcaSelecionada = marcasDisponiveis.value.find((m) => m.id === lote.value.marcaId)
  if (marcaSelecionada) {
    lote.value.marcaNome = marcaSelecionada.nome
  }
}

function submeterFormulario() {
  if (!isFormularioValido.value) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Por favor, preencha todos os campos.',
      tipo: 'alerta',
    })
    return
  }
  const dadosLoteParaSalvar = {
    testeId: lote.value.testeId,
    testeNome: lote.value.testeNome,
    marcaId: lote.value.marcaId,
    marcaNome: lote.value.marcaNome,
    lote: lote.value.codigoLote,
    validade: lote.value.dataValidade,
    quantidadeInicial: quantidadeTotalInicial.value,
    // --- CORREÇÃO ADICIONADA AQUI ---
    quantidadePorCaixa: lote.value.quantidadePorCaixa,
    numeroCaixas: lote.value.numeroCaixas,
    // ---------------------------------
    registradoPor: storeUsuario.usuario.uid,
  }
  emit('salvar', dadosLoteParaSalvar)
}

function fechar() {
  emit('fechar')
}
</script>

<style scoped>
/* Estilos permanecem inalterados */
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
  max-width: 700px;
  display: flex;
  flex-direction: column;
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
}
.grid-formulario {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.campo input,
.campo select {
  padding: 10px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.modal-rodape {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
  border-radius: 0 0 8px 8px;
}
.total-calculado strong {
  color: var(--cor-primaria);
  font-weight: bold;
  margin-left: 8px;
}
.botoes-acao {
  display: flex;
  gap: 0.5rem;
}
</style>
