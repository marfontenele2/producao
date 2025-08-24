import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from 'firebase/firestore'

const NOME_COLECAO = 'boletimTestes'

/**
 * Serviço para gerenciar o catálogo de testes rápidos e suas marcas comerciais.
 */
export const servicoTestes = {
  /**
   * Monitora o catálogo de testes em tempo real.
   * @param {function(Array<object>): void} callback - Função que recebe a lista de testes.
   * @returns {import("firebase/firestore").Unsubscribe}
   */
  monitorarTestes(callback) {
    const q = collection(db, NOME_COLECAO)
    return onSnapshot(q, (snapshot) => {
      const testes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      testes.sort((a, b) => a.nome.localeCompare(b.nome))
      callback(testes)
    })
  },

  /**
   * Adiciona uma nova marca comercial a um teste existente.
   * @param {string} idTeste - O ID do documento do teste (ex: 'HIV').
   * @param {object} dadosMarca - Objeto com os dados da marca (ex: { id: 'uuid', nome: 'Marca X' }).
   * @returns {Promise<void>}
   */
  adicionarMarca(idTeste, dadosMarca) {
    const docRef = doc(db, NOME_COLECAO, idTeste)
    return updateDoc(docRef, {
      marcas: arrayUnion(dadosMarca),
    })
  },

  /**
   * Remove uma marca comercial de um teste.
   * @param {string} idTeste - O ID do documento do teste.
   * @param {object} marcaParaRemover - O objeto da marca a ser removido.
   * @returns {Promise<void>}
   */
  async removerMarca(idTeste, marcaParaRemover) {
    const docRef = doc(db, NOME_COLECAO, idTeste)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const dadosAtuais = docSnap.data()
      const marcasAtuais = dadosAtuais.marcas || []
      const novasMarcas = marcasAtuais.filter((marca) => marca.id !== marcaParaRemover.id)
      await updateDoc(docRef, { marcas: novasMarcas })
    }
  },

  /**
   * Garante que os testes principais existam no Firestore.
   * Executar uma vez ou para garantir a integridade.
   */
  async inicializarTestesPadrao() {
    const testesFixos = [
      { id: 'HIV', nome: 'HIV' },
      { id: 'Sifilis', nome: 'Sífilis' },
      { id: 'HBV', nome: 'Hepatite B' },
      { id: 'HCV', nome: 'Hepatite C' },
      { id: 'DUO', nome: 'Teste DUO (HIV/Sífilis)' },
    ]
    for (const teste of testesFixos) {
      const docRef = doc(db, NOME_COLECAO, teste.id)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        await setDoc(docRef, { nome: teste.nome, marcas: [] })
      }
    }
  },
}
