import { db } from '@/nucleo/configuracao/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

const NOME_COLECAO = 'prazos'

/**
 * Serviço para gerenciar os prazos de produção mensais.
 */
export const servicoPrazos = {
  /**
   * Salva ou substitui completamente os prazos de uma competência (mês/ano).
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {object} dadosPrazos - Objeto com os prazos dos módulos mensais.
   * @returns {Promise<void>}
   */
  salvarPrazosDoMes(competencia, dadosPrazos) {
    const docRef = doc(db, NOME_COLECAO, competencia)
    return setDoc(docRef, dadosPrazos)
  },

  /**
   * Monitora os prazos de uma competência em tempo real.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {function(object): void} callback - Função que será chamada com os dados atualizados.
   * @returns {import("firebase/firestore").Unsubscribe} Função para cancelar o monitoramento.
   */
  monitorarPrazosDoMes(competencia, callback) {
    if (!competencia) {
      callback({})
      return () => {} // Retorna uma função vazia se não houver competência
    }
    const docRef = doc(db, NOME_COLECAO, competencia)
    return onSnapshot(docRef, (docSnapshot) => {
      callback(docSnapshot.exists() ? docSnapshot.data() : {})
    })
  },
}
