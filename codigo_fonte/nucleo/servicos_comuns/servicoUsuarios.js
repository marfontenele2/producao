import { db, functions } from '@/nucleo/configuracao/firebase'
import { httpsCallable } from 'firebase/functions'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

// Aponta para a Firebase Function 'userManager' que criamos
const userManager = httpsCallable(functions, 'userManager')

/**
 * Serviço para gerenciar as operações de CRUD de usuários, utilizando as Cloud Functions.
 */
export const servicoUsuarios = {
  /**
   * Cria um novo usuário no Firebase Auth e no Firestore.
   * @param {object} dadosUsuario - Dados do usuário { nome, email, senha, perfil, ubsId?, equipeId? }.
   * @returns {Promise<any>}
   */
  criarNovoUsuario(dadosUsuario) {
    return userManager({ action: 'createUser', payload: dadosUsuario })
  },

  /**
   * Atualiza o perfil e escopo de um usuário.
   * @param {string} uid - O ID do usuário.
   * @param {object} dadosUsuario - Dados a serem atualizados { perfil, ubsId?, equipeId? }.
   * @returns {Promise<any>}
   */
  atualizarUsuario(uid, dadosUsuario) {
    return userManager({
      action: 'setUserRole',
      payload: {
        uid: uid,
        role: dadosUsuario.role,
        ubsId: dadosUsuario.ubsId || null,
        equipeId: dadosUsuario.equipeId || null,
      },
    })
  },

  /**
   * Exclui um usuário do Firebase Auth e do Firestore.
   * @param {string} uid - O ID do usuário.
   * @returns {Promise<any>}
   */
  excluirUsuario(uid) {
    return userManager({ action: 'deleteUser', payload: { uid } })
  },

  /**
   * Monitora a coleção de usuários em tempo real.
   * @param {function(Array<object>): void} callback - Função que recebe a lista de usuários.
   * @returns {import("firebase/firestore").Unsubscribe}
   */
  monitorarUsuarios(callback) {
    const q = query(collection(db, 'users'), orderBy('nome'))
    return onSnapshot(q, (snapshot) => {
      const usuarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(usuarios)
    })
  },
}
