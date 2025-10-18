<template>
  <div class="modal-backdrop" @click.self="emitirFechar">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>Agendar Dia da Saúde Mental para {{ competenciaFormatada }}</h2>
        <button class="botao-fechar" @click="emitirFechar"><X :size="24" /></button>
      </header>
      <main class="modal-corpo">
        <form id="form-agenda-componente" @submit.prevent="emitirSalvar">
          <div class="campo">
            <label for="data-agenda">Selecione o dia</label>
            <input
              type="date"
              id="data-agenda"
              v-model="formState.data"
              class="input-padrao"
              :min="minDate"
              :max="maxDate"
              required
            />
          </div>
          <div class="campo">
            <label>Selecione os Profissionais Participantes</label>
            <div class="seletor-profissionais">
              <div v-if="profissionaisMapeados.length === 0">
                Nenhum profissional encontrado na lista do SCNES.
              </div>
              <label v-for="prof in profissionaisMapeados" :key="prof.selectableId">
                <input type="checkbox" :value="prof.selectableId" v-model="formState.selectedIds" />
                {{ prof.nome }} ({{ prof.cargo }})
                <span
                  v-if="prof.isTemporary"
                  title="Este profissional está sem ID no SCNES, mas pode ser selecionado."
                  >ℹ️</span
                >
              </label>
            </div>
          </div>
        </form>
      </main>
      <footer class="modal-rodape">
        <button class="botao botao-acao" @click="emitirFechar">Cancelar</button>
        <button class="botao botao-primario" type="submit" form="form-agenda-componente">
          <Save :size="18" /> Salvar Agenda
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watchEffect, computed } from 'vue'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Save, X } from 'lucide-vue-next'

const props = defineProps({
  profissionaisDaEquipe: { type: Array, required: true },
  competenciaParaAgendar: { type: String, required: true },
  agendaExistente: { type: Object, default: null },
})

const emit = defineEmits(['fechar', 'salvar'])

const formState = reactive({
  data: '',
  selectedIds: [], // Armazena os IDs reais ou temporários
})

// ===================================================================
// == 💥 LÓGICA CENTRAL: Mapeia profissionais para ter um ID selecionável
// ===================================================================
const profissionaisMapeados = computed(() => {
  console.log('[DETETIVE] Profissionais recebidos via props:', props.profissionaisDaEquipe)
  return (props.profissionaisDaEquipe || []).map((prof, index) => {
    const hasRealId = !!(prof && prof.id)
    return {
      ...prof,
      selectableId: hasRealId ? prof.id : `temp_${index}`, // Usa o ID real ou um ID temporário
      isTemporary: !hasRealId,
    }
  })
})

// Popula o formulário com dados existentes
watchEffect(() => {
  const agenda = props.agendaExistente || {}
  formState.data = agenda.data || ''

  // Se estiver editando, precisamos encontrar os selectableIds corretos
  if (Array.isArray(agenda.profissionaisIds)) {
    formState.selectedIds = agenda.profissionaisIds
      .map((savedId) => {
        const foundProf = profissionaisMapeados.value.find((p) => p.id === savedId)
        return foundProf ? foundProf.selectableId : null
      })
      .filter((id) => id !== null)
  } else {
    formState.selectedIds = []
  }
})

function emitirFechar() {
  emit('fechar')
}

function emitirSalvar() {
  // Encontra os profissionais completos (com nome e ID real) a partir dos IDs selecionados
  const profissionaisSelecionados = formState.selectedIds
    .map((selectedId) => {
      return profissionaisMapeados.value.find((p) => p.selectableId === selectedId)
    })
    .filter(Boolean) // Remove qualquer `undefined`

  const payload = {
    data: formState.data,
    // Garante que só os IDs REAIS sejam enviados para o banco
    profissionaisIds: profissionaisSelecionados
      .map((p) => p.id)
      .filter((id) => id && !String(id).startsWith('temp_')),
    // Envia os NOMES de todos os selecionados, com ou sem ID real
    profissionaisNomes: profissionaisSelecionados.map((p) => p.nome),
  }

  console.log('[DETETIVE FINAL] Payload enviado para o pai:', JSON.stringify(payload))
  emit('salvar', payload)
}

// Funções computadas para o date picker (inalteradas)
const competenciaFormatada = computed(() => {
  if (!props.competenciaParaAgendar) return ''
  const [ano, mes] = props.competenciaParaAgendar.split('-')
  return `${mes}/${ano}`
})
const minDate = computed(() => {
  if (!props.competenciaParaAgendar) return ''
  const data = startOfMonth(new Date(`${props.competenciaParaAgendar}-15T12:00:00`))
  return format(data, 'yyyy-MM-dd')
})
const maxDate = computed(() => {
  if (!props.competenciaParaAgendar) return ''
  const data = endOfMonth(new Date(`${props.competenciaParaAgendar}-15T12:00:00`))
  return format(data, 'yyyy-MM-dd')
})
</script>

<style scoped>
/* CSS do modal permanece o mesmo */
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
  max-width: 550px;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
}
.input-padrao {
  height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
}
.seletor-profissionais {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
}
.seletor-profissionais label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.seletor-profissionais span {
  cursor: help;
}
</style>
