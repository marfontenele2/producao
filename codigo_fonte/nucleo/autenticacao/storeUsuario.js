import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/nucleo/configuracao/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useStoreUsuario = defineStore('usuario', () => {
  const usuario = ref(null)
  const estaInicializado = ref(false)
  const activeListeners = ref([])

  const estaLogado = computed(() => !!usuario.value)
  const ehAdmin = computed(() => usuario.value?.role === 'Administrador')
  const ehEnfermeiro = computed(() => usuario.value?.role === 'Enfermeiro')
  const ehGerente = computed(() => usuario.value?.role === 'Gerente')
  const ehCoordenador = computed(() => usuario.value?.role === 'Coordenador')

  function addActiveListener(unsubscribeFunc) {
    if (unsubscribeFunc && typeof unsubscribeFunc === 'function') {
      activeListeners.value.push(unsubscribeFunc)
    }
  }

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
        await signOut(auth)
        return null
      }
    } catch (error) {
      await signOut(auth)
      return null
    }
  }

  async function login(email, senha) {
    const credencial = await signInWithEmailAndPassword(auth, email, senha)
    await buscarPerfilUsuario(credencial.user.uid)
  }

  async function logout() {
    clearActiveListeners()
    await signOut(auth)
    usuario.value = null
  }

  function init(router) {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (userFirebase) => {
        clearActiveListeners()
        await buscarPerfilUsuario(userFirebase?.uid)

        if (usuario.value && router) {
          const rotaAtual = router.currentRoute.value
          const papeisRequeridos = rotaAtual.meta.roles

          if (papeisRequeridos && !papeisRequeridos.includes(usuario.value.role)) {
            console.warn(
              `[Auth Store] Usuário '${usuario.value.role}' sem permissão para a rota '${rotaAtual.name}'. Redirecionando...`,
            )
            router.push({ name: 'Home' })
          }
        }

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
    ehEnfermeiro,
    ehGerente,
    ehCoordenador,
    login,
    logout,
    init,
    addActiveListener,
  }
})
