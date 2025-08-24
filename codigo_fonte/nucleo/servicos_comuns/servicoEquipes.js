import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  getDoc, // Import adicionado
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

/**
 * Serviço para gerenciar as operações de CRUD para as Equipes de Saúde.
 */
export const servicoEquipes = {
  /**
   * Monitora a coleção de equipes em tempo real, ordenando por nome.
   * @param {function(Array<object>): void} callback - Função que recebe a lista de equipes.
   * @returns {import("firebase/firestore").Unsubscribe} Função para cancelar o monitoramento.
   */
  monitorarEquipes(callback) {
    const q = query(collection(db, 'equipes'), orderBy('nome'))
    return onSnapshot(q, (snapshot) => {
      const equipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(equipes)
    })
  },

  /**
   * Busca equipes associadas a uma ou mais UBSs, uma única vez.
   * @param {Array<string>} idsUbs - Array de IDs das UBS.
   * @returns {Promise<Array<object>>} Uma lista de equipes.
   */
  async buscarEquipesPorUbs(idsUbs) {
    if (!idsUbs || idsUbs.length === 0) return []
    const q = query(collection(db, 'equipes'), where('ubsId', 'in', idsUbs), orderBy('nome'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  /**
   * Busca uma única equipe pelo seu ID.
   * @param {string} idEquipe - O ID da equipe a ser buscada.
   * @returns {Promise<object|null>} O objeto da equipe ou null se não for encontrada.
   */
  async buscarEquipePorId(idEquipe) {
    if (!idEquipe) return null
    try {
      const docRef = doc(db, 'equipes', idEquipe)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar equipe por ID:', error)
      return null
    }
  },

  /**
   * Adiciona uma nova equipe.
   * @param {object} dadosEquipe - Dados da nova equipe.
   * @returns {Promise<any>}
   */
  adicionarEquipe(dadosEquipe) {
    return addDoc(collection(db, 'equipes'), dadosEquipe)
  },

  /**
   * Atualiza uma equipe existente.
   * @param {string} idEquipe - O ID da equipe.
   * @param {object} dadosEquipe - Novos dados da equipe.
   * @returns {Promise<void>}
   */
  atualizarEquipe(idEquipe, dadosEquipe) {
    return updateDoc(doc(db, 'equipes', idEquipe), dadosEquipe)
  },

  /**
   * Exclui uma equipe.
   * @param {string} idEquipe - O ID da equipe.
   * @returns {Promise<void>}
   */
  excluirEquipe(idEquipe) {
    return deleteDoc(doc(db, 'equipes', idEquipe))
  },
}
