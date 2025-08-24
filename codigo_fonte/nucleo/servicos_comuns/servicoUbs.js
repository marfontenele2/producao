// producao-nova/codigo_fonte/nucleo/servicos_comuns/servicoUbs.js
import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

/**
 * Serviço para gerenciar as operações de CRUD para as Unidades Básicas de Saúde (UBS).
 */
export const servicoUbs = {
  /**
   * Monitora a coleção de UBS em tempo real, ordenando por nome.
   * @param {function(Array<object>): void} callback - Função que recebe a lista de UBS atualizada.
   * @returns {import("firebase/firestore").Unsubscribe} Função para cancelar o monitoramento.
   */
  monitorarUbs(callback) {
    const q = query(collection(db, 'ubs'), orderBy('nome'))
    return onSnapshot(q, (querySnapshot) => {
      const listaUbs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(listaUbs)
    })
  },

  /**
   * Adiciona uma nova UBS ao banco de dados.
   * @param {object} dadosUbs - Objeto com os dados da UBS (ex: { nome: 'UBS Central' }).
   * @returns {Promise<import("firebase/firestore").DocumentReference>}
   */
  adicionarUbs(dadosUbs) {
    return addDoc(collection(db, 'ubs'), dadosUbs)
  },

  /**
   * Atualiza os dados de uma UBS existente.
   * @param {string} idUbs - O ID da UBS a ser atualizada.
   * @param {object} dadosUbs - Objeto com os campos a serem atualizados.
   * @returns {Promise<void>}
   */
  atualizarUbs(idUbs, dadosUbs) {
    const docRef = doc(db, 'ubs', idUbs)
    return updateDoc(docRef, dadosUbs)
  },

  /**
   * Exclui uma UBS do banco de dados.
   * @param {string} idUbs - O ID da UBS a ser excluída.
   * @returns {Promise<void>}
   */
  excluirUbs(idUbs) {
    const docRef = doc(db, 'ubs', idUbs)
    return deleteDoc(docRef)
  },
}
