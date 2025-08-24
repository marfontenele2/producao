import { db } from '@/nucleo/configuracao/firebase'
import { collection, getDocs } from 'firebase/firestore'

const NOME_COLECAO = 'boletimTestes'

export const servicoTestes = {
  /**
   * Busca todos os testes e marcas do catálogo.
   * @returns {Promise<Array<object>>} Uma lista de testes.
   */
  async buscarTodos() {
    const snapshot = await getDocs(collection(db, NOME_COLECAO))
    if (snapshot.empty) {
      return []
    }
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },
}
