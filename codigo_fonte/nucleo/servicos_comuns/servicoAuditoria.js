import { db } from '@/nucleo/configuracao/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'

const NOME_COLECAO = 'auditoriaLogs'

/**
 * Serviço para registrar e consultar logs de auditoria do sistema.
 */
export const servicoAuditoria = {
  /**
   * Registra uma nova ação no log de auditoria.
   * @param {object} dadosLog - Informações sobre o evento.
   * @param {string} dadosLog.acao - Descrição da ação (ex: 'CRIOU_USUARIO', 'EXCLUIU_UBS').
   * @param {string} dadosLog.uidUsuario - UID do usuário que realizou a ação.
   * @param {string} dadosLog.nomeUsuario - Nome do usuário.
   * @param {object} [dadosLog.detalhes] - Objeto com informações adicionais relevantes.
   */
  registrar(dadosLog) {
    return addDoc(collection(db, NOME_COLECAO), {
      ...dadosLog,
      timestamp: serverTimestamp(),
    })
  },

  /**
   * Monitora os logs de auditoria em tempo real.
   * @param {function(Array<object>): void} callback - Função que recebe a lista de logs.
   * @returns {import("firebase/firestore").Unsubscribe}
   */
  monitorarLogs(callback) {
    const q = query(collection(db, NOME_COLECAO), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(logs)
    })
  },
}
