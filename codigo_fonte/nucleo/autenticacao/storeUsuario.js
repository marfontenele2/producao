// producao-nova/codigo_fonte/nucleo/autenticacao/storeUsuario.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '../configuracao/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

/**
 * Store para gerenciar o estado e ações do usuário.
 */
export const useStoreUsuario = defineStore('usuario', () => {
  /** @type {import("vue").Ref<object|null>} */
  const usuario = ref(null)
  /** @type {import("vue").Ref<boolean>} */
  const estaInicializado = ref(false)

  // --- GETTERS ---
  const estaLogado = computed(() => !!usuario.value)
  const ehAdmin = computed(() => usuario.value?.role === 'Administrador')
  const ehCoordenador = computed(() => usuario.value?.role === 'Coordenador')
  const ehGerente = computed(() => usuario.value?.role === 'Gerente')
  const ehEnfermeiro = computed(() => usuario.value?.role === 'Enfermeiro')

  // --- AÇÕES ---

  /**
   * Busca o perfil do usuário no Firestore e atualiza o estado da store.
   * @param {string | null} uid - O ID do usuário do Firebase Auth.
   * @returns {Promise<object|null>}
   */
  async function buscarPerfilUsuario(uid) {
    if (!uid) {
      usuario.value = null
      return null
    }
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      usuario.value = { uid, ...docSnap.data() }
      return usuario.value
    } else {
      console.error('Perfil do usuário não encontrado no Firestore. Deslogando...')
      await signOut(auth)
      return null
    }
  }

  /**
   * Realiza o login do usuário.
   * @param {string} email - O email do usuário.
   * @param {string} senha - A senha do usuário.
   */
  async function login(email, senha) {
    const credencial = await signInWithEmailAndPassword(auth, email, senha)
    await buscarPerfilUsuario(credencial.user.uid)
  }

  /**
   * Realiza o logout do usuário.
   */
  async function logout() {
    await signOut(auth)
    usuario.value = null
  }

  /**
   * Inicializa o listener de autenticação para manter o usuário logado.
   * @returns {Promise<any>}
   */
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
