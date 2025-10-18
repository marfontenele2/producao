<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-container">
      <header class="modal-cabecalho">
        <h2>{{ ehEdicao ? 'Editar Usuário' : 'Adicionar Novo Usuário' }}</h2>
        <button class="botao-fechar" @click="$emit('fechar')">&times;</button>
      </header>

      <main class="modal-corpo">
        <form @submit.prevent="submeterFormulario">
          <div class="grupo-formulario">
            <label for="nome">Nome Completo</label>
            <input id="nome" v-model="form.nome" type="text" required />
          </div>
          <div class="grupo-formulario">
            <label for="email">E-mail</label>
            <input id="email" v-model="form.email" type="email" required :disabled="ehEdicao" />
          </div>

          <div class="grupo-formulario" v-if="!ehEdicao">
            <label for="senha">Senha</label>
            <div class="campo-senha-container">
              <input
                id="senha"
                v-model="form.password"
                :type="mostrarSenha ? 'text' : 'password'"
                required
              />
              <button type="button" class="botao-ver-senha" @click="mostrarSenha = !mostrarSenha">
                <Eye v-if="!mostrarSenha" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>
          <div class="grupo-formulario">
            <label for="perfil">Perfil de Acesso</label>
            <select id="perfil" v-model="form.role" required>
              <option value="Enfermeiro">Enfermeiro</option>
              <option value="Gerente">Gerente</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div
            v-if="form.role === 'Gerente' || form.role === 'Enfermeiro'"
            class="grupo-formulario"
          >
            <label for="ubs">UBS</label>
            <select id="ubs" v-model="form.ubsId" required>
              <option value="">Selecione uma UBS</option>
              <option v-for="ubs in listaUbs" :key="ubs.id" :value="ubs.id">{{ ubs.nome }}</option>
            </select>
          </div>

          <div v-if="form.role === 'Enfermeiro'" class="grupo-formulario">
            <label for="equipe">Equipe</label>
            <select id="equipe" v-model="form.equipeId" required :disabled="!form.ubsId">
              <option value="">Selecione uma Equipe</option>
              <option v-for="equipe in equipesFiltradas" :key="equipe.id" :value="equipe.id">
                {{ equipe.nome }}
              </option>
            </select>
          </div>
        </form>
      </main>

      <footer class="modal-rodape">
        <button class="botao-cancelar" @click="$emit('fechar')">Cancelar</button>
        <button class="botao-salvar" @click="submeterFormulario">Salvar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes.js'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  usuarioParaEditar: { type: Object, default: null },
  listaUbs: { type: Array, required: true },
})

const emit = defineEmits(['fechar', 'salvar'])

const ehEdicao = computed(() => !!props.usuarioParaEditar)
const mostrarSenha = ref(false)
let unsubEquipes = null

const form = ref({
  nome: '',
  email: '',
  password: '',
  role: 'Enfermeiro',
  ubsId: '',
  equipeId: '',
})

const todasAsEquipes = ref([])
const carregandoEquipes = ref(false)

const equipesFiltradas = computed(() => {
  if (!form.value.ubsId) return []
  return todasAsEquipes.value.filter((e) => e.ubsId === form.value.ubsId)
})

watch(
  () => props.usuarioParaEditar,
  (novoValor) => {
    if (novoValor) {
      form.value = { ...novoValor }
    } else {
      form.value = {
        nome: '',
        email: '',
        password: '',
        role: 'Enfermeiro',
        ubsId: '',
        equipeId: '',
      }
    }
  },
  { immediate: true },
)

// ===================================================================
// == 💥 CORREÇÃO CRÍTICA: LÓGICA DE LIMPEZA REATIVA
// Este watch garante que o formulário sempre tenha um estado válido.
// ===================================================================
watch(
  () => form.value.role,
  (newRole) => {
    if (newRole === 'Gerente') {
      form.value.equipeId = '' // Gerente não tem equipe, apenas UBS
    } else if (newRole === 'Administrador' || newRole === 'Coordenador') {
      form.value.ubsId = '' // Admin/Coord não tem UBS nem equipe
      form.value.equipeId = ''
    }
  },
)
// Limpa a equipe se a UBS for alterada
watch(
  () => form.value.ubsId,
  () => {
    form.value.equipeId = ''
  },
)

async function buscarTodasAsEquipes() {
  carregandoEquipes.value = true
  // Se já houver um listener, cancela antes de criar um novo
  if (unsubEquipes) unsubEquipes()
  unsubEquipes = servicoEquipes.monitorarEquipes((lista) => {
    todasAsEquipes.value = lista
    carregandoEquipes.value = false
  })
}

function submeterFormulario() {
  // A lógica de limpeza agora é tratada pelo watch, garantindo que os dados
  // já estão corretos antes de serem emitidos.
  emit('salvar', { ...form.value })
}

onMounted(() => {
  buscarTodasAsEquipes()
})

onUnmounted(() => {
  if (unsubEquipes) unsubEquipes()
})
</script>

<style scoped>
/* Estilos permanecem inalterados */
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
.campo-senha-container {
  position: relative;
  display: flex;
  align-items: center;
}
.campo-senha-container input {
  width: 100%;
  padding-right: 40px;
}
.botao-ver-senha {
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  border: none;
  background: transparent;
  padding: 0 10px;
  cursor: pointer;
  color: #666;
}
</style>
