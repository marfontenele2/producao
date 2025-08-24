import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../configuracao/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useStoreUsuario = defineStore('usuario', () => {
  const usuario = ref(null)
  const estaInicializado = ref(false)

  const estaLogado = computed(() => !!usuario.value)
  const ehAdmin = computed(() => usuario.value?.role === 'Administrador')
  const ehCoordenador = computed(() => usuario.value?.role === 'Coordenador')
  const ehGerente = computed(() => usuario.value?.role === 'Gerente')
  const ehEnfermeiro = computed(() => usuario.value?.role === 'Enfermeiro')

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

        // --- ADIÇÃO CIRÚRGICA: BUSCAR NOMES DA UBS E EQUIPE ---
        const { ubsId, equipeId } = perfilBase
        const promessasBusca = []

        // Adiciona a promessa de busca da UBS se o ID existir
        if (ubsId) {
          promessasBusca.push(getDoc(doc(db, 'ubs', ubsId)))
        } else {
          promessasBusca.push(Promise.resolve(null)) // Mantém a ordem do array
        }

        // Adiciona a promessa de busca da Equipe se o ID existir
        if (equipeId) {
          promessasBusca.push(getDoc(doc(db, 'equipes', equipeId)))
        } else {
          promessasBusca.push(Promise.resolve(null)) // Mantém a ordem do array
        }

        const [ubsDocSnap, equipeDocSnap] = await Promise.all(promessasBusca)

        if (ubsDocSnap?.exists()) {
          perfilBase.nomeUbs = ubsDocSnap.data().nome
        }
        if (equipeDocSnap?.exists()) {
          perfilBase.nomeEquipe = equipeDocSnap.data().nome
        }
        // --------------------------------------------------------

        usuario.value = perfilBase // Salva o perfil completo e enriquecido
        return usuario.value
      } else {
        console.error('Perfil do usuário não encontrado no Firestore. Deslogando...')
        await signOut(auth)
        return null
      }
    } catch (error) {
      console.error('Erro ao buscar perfil completo do usuário:', error)
      await signOut(auth) // Desloga em caso de erro para evitar estado inconsistente
      return null
    }
  }

  async function login(email, senha) {
    const credencial = await signInWithEmailAndPassword(auth, email, senha)
    await buscarPerfilUsuario(credencial.user.uid)
  }

  async function logout() {
    await signOut(auth)
    usuario.value = null
  }

  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (userFirebase) => {
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
  }
})
