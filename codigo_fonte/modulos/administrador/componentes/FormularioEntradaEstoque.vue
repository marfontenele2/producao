<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Registrar Entrada no Estoque</h2>
        <button class="botao-fechar" @click="$emit('fechar')">&times;</button>
      </header>
      <main class="modal-corpo">
        <form @submit.prevent="submeter">
          <div class="grupo-formulario">
            <label for="teste">Tipo de Teste</label>
            <select id="teste" v-model="form.testeId" required @change="form.marcaId = ''">
              <option disabled value="">Selecione o tipo</option>
              <option v-for="teste in catalogoTestes" :key="teste.id" :value="teste.id">
                {{ teste.nome }}
              </option>
            </select>
          </div>
          <div class="grupo-formulario">
            <label for="marca">Marca/Fornecedor</label>
            <select id="marca" v-model="form.marcaId" required :disabled="!form.testeId">
              <option disabled value="">Selecione a marca</option>
              <option v-for="marca in marcasFiltradas" :key="marca.id" :value="marca.id">
                {{ marca.nome }}
              </option>
            </select>
          </div>
          <div class="grupo-formulario">
            <label for="lote">Lote</label>
            <input id="lote" v-model="form.lote" type="text" required />
          </div>
          <div class="grupo-formulario">
            <label for="validade">Data de Validade</label>
            <input id="validade" v-model="form.validade" type="date" required />
          </div>
          <div class="grupo-formulario">
            <label for="quantidade">Quantidade Recebida</label>
            <input
              id="quantidade"
              v-model.number="form.quantidadeInicial"
              type="number"
              min="1"
              required
            />
          </div>
        </form>
      </main>
      <footer class="modal-rodape">
        <button class="botao-cancelar" @click="$emit('fechar')">Cancelar</button>
        <button class="botao-salvar" @click="submeter">Registrar Entrada</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  catalogoTestes: { type: Array, required: true },
})
const emit = defineEmits(['fechar', 'salvar'])

const form = ref({
  testeId: '',
  marcaId: '',
  lote: '',
  validade: '',
  quantidadeInicial: null,
})

const marcasFiltradas = computed(() => {
  if (!form.value.testeId) return []
  const testeSelecionado = props.catalogoTestes.find((t) => t.id === form.value.testeId)
  return testeSelecionado?.marcas || []
})

function submeter() {
  const testeSelecionado = props.catalogoTestes.find((t) => t.id === form.value.testeId)
  const marcaSelecionada = testeSelecionado?.marcas.find((m) => m.id === form.value.marcaId)

  if (testeSelecionado && marcaSelecionada) {
    const dadosCompletos = {
      ...form.value,
      testeNome: testeSelecionado.nome,
      marcaNome: marcaSelecionada.nome,
    }
    emit('salvar', dadosCompletos)
  }
}
</script>

<style scoped>
/* Estilos do modal reutilizados */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.modal-cabecalho h2 {
  margin: 0;
  font-size: 1.25rem;
}
.botao-fechar {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #888;
}
.modal-corpo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.grupo-formulario {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.grupo-formulario label {
  font-weight: 500;
  font-size: 0.9rem;
}
.grupo-formulario input,
.grupo-formulario select {
  padding: 0.75rem;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--cor-borda-suave);
  padding-top: 1rem;
  margin-top: 1.5rem;
}
.botao-cancelar,
.botao-salvar {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.botao-cancelar {
  background-color: #e2e8f0;
  color: var(--cor-texto-padrao);
}
.botao-salvar {
  background-color: var(--cor-primaria);
  color: white;
}
</style>
