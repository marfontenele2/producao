import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../configuracao/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useStoreUsuario = defineStore('usuario', () => {
  const usuario = ref(null)
  const estaInicializado = ref(false)

  // NOVO: Array para registrar todas as funções 'unsubscribe' dos listeners onSnapshot.
  const activeListeners = ref([])

  const estaLogado = computed(() => !!usuario.value)
  const ehAdmin = computed(() => usuario.value?.role === 'Administrador')
  const ehCoordenador = computed(() => usuario.value?.role === 'Coordenador')
  const ehGerente = computed(() => usuario.value?.role === 'Gerente')
  const ehEnfermeiro = computed(() => usuario.value?.role === 'Enfermeiro')

  /**
   * NOVO: Adiciona uma função de unsubscribe à lista de listeners ativos.
   * @param {Function} unsubscribeFunc - A função retornada por uma chamada onSnapshot.
   */
  function addActiveListener(unsubscribeFunc) {
    if (unsubscribeFunc && typeof unsubscribeFunc === 'function') {
      activeListeners.value.push(unsubscribeFunc)
    }
  }

  /**
   * NOVO: Executa todas as funções de unsubscribe e limpa a lista.
   * Garante que todos os listeners sejam fechados de forma limpa.
   */
  function clearActiveListeners() {
    console.log(`[Auth Store] Limpando ${activeListeners.value.length} listeners ativos...`)
    activeListeners.value.forEach((unsubscribe) => unsubscribe())
    activeListeners.value = []
  }

  async function buscarPerfilUsuario(uid) {
    if (!uid) {
      usuario.value = null
      return null
    }

    try {
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const perfilBase = { uid, ...userDocSnap.data() }

        const { ubsId, equipeId } = perfilBase
        const promessasBusca = []

        if (ubsId) {
          promessasBusca.push(getDoc(doc(db, 'ubs', ubsId)))
        } else {
          promessasBusca.push(Promise.resolve(null))
        }

        if (equipeId) {
          promessasBusca.push(getDoc(doc(db, 'equipes', equipeId)))
        } else {
          promessasBusca.push(Promise.resolve(null))
        }

        const [ubsDocSnap, equipeDocSnap] = await Promise.all(promessasBusca)

        if (ubsDocSnap?.exists()) {
          perfilBase.nomeUbs = ubsDocSnap.data().nome
        }
        if (equipeDocSnap?.exists()) {
          perfilBase.nomeEquipe = equipeDocSnap.data().nome
        }

        usuario.value = perfilBase
        return usuario.value
      } else {
        console.error('Perfil do usuário não encontrado no Firestore. Deslogando...')
        await signOut(auth)
        return null
      }
    } catch (error) {
      console.error('Erro ao buscar perfil completo do usuário:', error)
      await signOut(auth)
      return null
    }
  }

  async function login(email, senha) {
    const credencial = await signInWithEmailAndPassword(auth, email, senha)
    await buscarPerfilUsuario(credencial.user.uid)
  }

  /**
   * CORRIGIDO: Agora limpa os listeners ANTES de deslogar o usuário.
   */
  async function logout() {
    clearActiveListeners() // <-- PASSO CRÍTICO #1
    await signOut(auth) // <-- PASSO CRÍTICO #2
    usuario.value = null // <-- PASSO CRÍTICO #3
  }

  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (userFirebase) => {
        // Limpa listeners antigos caso a página seja recarregada
        clearActiveListeners()
        await buscarPerfilUsuario(userFirebase?.uid)
        if (!estaInicializado.value) {
          estaInicializado.value = true
          resolve(userFirebase)
        }
      })
    })
  }

  return {
    usuario,
    estaInicializado,
    estaLogado,
    ehAdmin,
    ehCoordenador,
    ehGerente,
    ehEnfermeiro,
    login,
    logout,
    init,
    addActiveListener, // <-- NOVO: Expor a função para os componentes usarem
  }
})
