<template>
  <div class="modal-backdrop" @click.self="fechar">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Ajustar Estoque do Lote</h2>
        <button class="botao-fechar" @click="fechar"><X :size="24" /></button>
      </header>
      <main class="modal-corpo">
        <div class="info-lote">
          <span><strong>Teste:</strong> {{ itemEstoque.testeNome }}</span>
          <span><strong>Marca:</strong> {{ itemEstoque.marcaNome }}</span>
          <span><strong>Lote:</strong> {{ itemEstoque.lote }}</span>
        </div>
        <form id="form-ajuste" @submit.prevent="submeterAjuste">
          <div class="campo">
            <label>Quantidade Atual</label>
            <input type="number" :value="itemEstoque.quantidadeAtual" disabled />
          </div>
          <div class="campo">
            <label for="quantidade-nova">Nova Quantidade Correta</label>
            <input
              id="quantidade-nova"
              type="number"
              min="0"
              v-model.number="quantidadeNova"
              required
            />
          </div>
          <div class="campo">
            <label for="motivo">Motivo do Ajuste</label>
            <textarea
              id="motivo"
              v-model.trim="motivo"
              required
              placeholder="Ex: Contagem física, perda, dano..."
            ></textarea>
            <small
              class="feedback-validacao"
              :class="{ invalido: motivo.length > 0 && motivo.length < 4 }"
            >
              Mínimo de 4 caracteres
            </small>
          </div>
        </form>
      </main>
      <footer class="modal-rodape">
        <button class="botao botao-acao" @click="fechar">Cancelar</button>
        <button
          class="botao botao-primario"
          type="submit"
          form="form-ajuste"
          :disabled="!isFormularioValido || salvando"
        >
          {{ salvando ? 'Salvando...' : 'Confirmar Ajuste' }}
        </button>
      </footer>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  itemEstoque: { type: Object, required: true },
})
const emit = defineEmits(['fechar', 'salvar'])
const quantidadeNova = ref(props.itemEstoque.quantidadeAtual)
const motivo = ref('')
const salvando = ref(false)
const isFormularioValido = computed(() => {
  return typeof quantidadeNova.value === 'number' && motivo.value.length >= 4
})
function submeterAjuste() {
  if (!isFormularioValido.value) return
  salvando.value = true
  const payload = {
    loteId: props.itemEstoque.id,
    quantidadeAnterior: props.itemEstoque.quantidadeAtual,
    quantidadeNova: quantidadeNova.value,
    motivo: motivo.value,
  }
  emit('salvar', payload)
}
function fechar() {
  emit('fechar')
}
</script>
<style scoped>
.info-lote {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--cor-borda-suave);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.campo input,
.campo textarea {
  padding: 10px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.campo input:disabled {
  background-color: #f1f5f9;
}
.campo textarea {
  min-height: 80px;
  resize: vertical;
}
.feedback-validacao {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: right;
}
.feedback-validacao.invalido {
  color: #ef4444;
}
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
  max-width: 500px;
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
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}
</style>
