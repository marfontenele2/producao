import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, // ADICIONADO: Import 'query'
  where, // ADICIONADO: Import 'where'
} from 'firebase/firestore'

const NOME_COLECAO = 'equipes'

export const servicoEquipes = {
  /**
   * Busca todas as equipes uma única vez. Ideal para painéis e relatórios.
   * @returns {Promise<Array<object>>} Uma lista de todas as equipes.
   */
  async buscarTodas() {
    const equipesSnap = await getDocs(collection(db, NOME_COLECAO))
    const ubsPromises = []
    const equipes = equipesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // Para cada equipe, busca o nome da UBS correspondente
    equipes.forEach((equipe) => {
      if (equipe.ubsId) {
        ubsPromises.push(getDoc(doc(db, 'ubs', equipe.ubsId)))
      }
    })

    const ubsDocs = await Promise.all(ubsPromises)
    const ubsMap = new Map()
    ubsDocs.forEach((doc) => {
      if (doc.exists()) {
        ubsMap.set(doc.id, doc.data().nome)
      }
    })

    equipes.forEach((equipe) => {
      if (equipe.ubsId && ubsMap.has(equipe.ubsId)) {
        equipe.nomeUbs = ubsMap.get(equipe.ubsId)
      } else {
        equipe.nomeUbs = 'UBS não encontrada'
      }
    })

    return equipes
  },

  /**
   * ADICIONADO: Nova função para buscar equipes por UBS.
   * Essencial para a tela do Gerente.
   * @param {string} ubsId - O ID da Unidade de Saúde.
   * @returns {Promise<Array<Object>>} Uma lista de objetos de equipe.
   */
  async buscarEquipesPorUbs(ubsId) {
    if (!ubsId) return []
    try {
      const equipesCol = collection(db, NOME_COLECAO)
      // Cria uma consulta que filtra as equipes pelo campo 'ubsId'
      const q = query(equipesCol, where('ubsId', '==', ubsId))
      const querySnapshot = await getDocs(q)
      const equipes = []
      querySnapshot.forEach((doc) => {
        equipes.push({ id: doc.id, ...doc.data() })
      })
      // Ordena as equipes por nome antes de retornar
      return equipes.sort((a, b) => a.nome.localeCompare(b.nome))
    } catch (error) {
      console.error('Erro ao buscar equipes por UBS:', error)
      return []
    }
  },

  /**
   * Monitora as equipes em tempo real.
   * @param {function} callback - A função que recebe a lista de equipes.
   */
  monitorarEquipes(callback) {
    const q = collection(db, NOME_COLECAO)
    return onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(lista.sort((a, b) => a.nome.localeCompare(b.nome)))
    })
  },

  // Funções de CRUD (adicionar, atualizar, excluir)
  adicionarEquipe(dados) {
    return addDoc(collection(db, NOME_COLECAO), dados)
  },
  atualizarEquipe(id, dados) {
    return updateDoc(doc(db, NOME_COLECAO, id), dados)
  },
  excluirEquipe(id) {
    return deleteDoc(doc(db, NOME_COLECAO, id))
  },
}
