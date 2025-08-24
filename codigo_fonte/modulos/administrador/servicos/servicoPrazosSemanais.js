import { db } from '@/nucleo/configuracao/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const NOME_COLECAO = 'prazosSemanais'
const ID_DOCUMENTO = 'config' // Documento único para todas as configurações semanais

/**
 * Serviço para gerenciar as configurações globais de prazos semanais.
 */
export const servicoPrazosSemanais = {
  /**
   * Monitora as configurações de prazos semanais em tempo real.
   * @param {function(object): void} callback - Função que será chamada com os dados.
   * @returns {import("firebase/firestore").Unsubscribe} Função para cancelar o monitoramento.
   */
  monitorarPrazos(callback) {
    const docRef = doc(db, NOME_COLECAO, ID_DOCUMENTO)
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : {})
    })
  },

  /**
   * Salva a configuração de prazos semanais.
   * @param {object} dadosPrazos - Objeto contendo os prazos para os módulos semanais.
   * @returns {Promise<void>}
   */
  salvarPrazos(dadosPrazos) {
    const docRef = doc(db, NOME_COLECAO, ID_DOCUMENTO)
    return setDoc(docRef, dadosPrazos, { merge: true })
  },
}
