<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>{{ ehEdicao ? 'Editar UBS' : 'Adicionar Nova UBS' }}</h2>
        <button class="botao-fechar" @click="$emit('fechar')">&times;</button>
      </header>

      <main class="modal-corpo">
        <form @submit.prevent="submeter">
          <div class="grupo-formulario">
            <label for="nome">Nome da UBS</label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              required
              placeholder="Ex: UBS Centro da Granja"
            />
          </div>
        </form>
      </main>

      <footer class="modal-rodape">
        <button class="botao-cancelar" @click="$emit('fechar')">Cancelar</button>
        <button class="botao-salvar" @click="submeter">Salvar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  ubsParaEditar: { type: Object, default: null },
})
const emit = defineEmits(['fechar', 'salvar'])

const ehEdicao = computed(() => !!props.ubsParaEditar)

const form = ref({})

watch(
  () => props.ubsParaEditar,
  (novoValor) => {
    // Se for edição, preenche o form. Se não, inicia vazio.
    form.value = novoValor ? { ...novoValor } : { nome: '' }
  },
  { immediate: true },
)

function submeter() {
  // Validação simples para não salvar em branco
  if (form.value.nome && form.value.nome.trim()) {
    emit('salvar', form.value)
  }
}
</script>

<style scoped>
/* Estilos do modal (padrão do sistema) */
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
.grupo-formulario input {
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
