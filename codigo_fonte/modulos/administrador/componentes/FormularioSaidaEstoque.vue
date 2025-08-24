<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Registrar Saída de Estoque</h2>
        <button class="botao-fechar" @click="$emit('fechar')">&times;</button>
      </header>

      <main class="modal-corpo">
        <div class="info-lote">
          <p><strong>Teste:</strong> {{ itemEstoque.testeNome }}</p>
          <p><strong>Marca:</strong> {{ itemEstoque.marcaNome }}</p>
          <p><strong>Lote:</strong> {{ itemEstoque.lote }}</p>
          <p><strong>Disponível:</strong> {{ itemEstoque.quantidadeAtual }} unidades</p>
        </div>

        <form @submit.prevent="submeter">
          <div class="grupo-formulario">
            <label for="quantidade">Quantidade da Saída</label>
            <input
              id="quantidade"
              v-model.number="form.quantidadeSaida"
              type="number"
              min="1"
              :max="itemEstoque.quantidadeAtual"
              required
            />
          </div>
          <div class="grupo-formulario">
            <label for="equipe">Equipe de Destino</label>
            <select id="equipe" v-model="form.equipeDestinoId" required>
              <option disabled value="">Selecione a equipe</option>
              <option v-for="equipe in listaEquipes" :key="equipe.id" :value="equipe.id">
                {{ getNomeUbs(equipe.ubsId) }} - {{ equipe.nome }}
              </option>
            </select>
          </div>
        </form>
      </main>

      <footer class="modal-rodape">
        <button class="botao-cancelar" @click="$emit('fechar')">Cancelar</button>
        <button class="botao-salvar" @click="submeter">Confirmar Saída</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  itemEstoque: { type: Object, required: true },
  listaEquipes: { type: Array, required: true },
  listaUbs: { type: Array, required: true },
})
const emit = defineEmits(['fechar', 'salvar'])

const form = ref({
  quantidadeSaida: 1,
  equipeDestinoId: '',
})

function getNomeUbs(ubsId) {
  return props.listaUbs.find((u) => u.id === ubsId)?.nome || 'UBS não encontrada'
}

function submeter() {
  if (!form.value.quantidadeSaida || form.value.quantidadeSaida <= 0) {
    alert('A quantidade deve ser maior que zero.')
    return
  }
  if (form.value.quantidadeSaida > props.itemEstoque.quantidadeAtual) {
    alert('A quantidade de saída excede o estoque disponível.')
    return
  }
  if (!form.value.equipeDestinoId) {
    alert('Por favor, selecione uma equipe de destino.')
    return
  }

  const equipeDestino = props.listaEquipes.find((e) => e.id === form.value.equipeDestinoId)

  emit('salvar', {
    lote: props.itemEstoque,
    quantidadeSaida: form.value.quantidadeSaida,
    equipeDestino: equipeDestino,
  })
}
</script>

<style scoped>
/* --- ESTILOS PADRÃO PARA MODAL ADICIONADOS --- */
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
  line-height: 1;
}
.modal-corpo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.info-lote {
  background-color: #f8fafc;
  border: 1px solid var(--cor-borda-suave);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.info-lote p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
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
.botao-cancelar:hover {
  background-color: #cbd5e1;
}
.botao-salvar {
  background-color: var(--cor-primaria);
  color: white;
}
.botao-salvar:hover {
  background-color: #1e40af;
}
</style>
