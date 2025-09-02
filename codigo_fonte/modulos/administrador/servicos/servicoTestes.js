import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
  getDocs, // ADICIONADO
} from 'firebase/firestore'

const NOME_COLECAO = 'boletimTestes'

export const servicoTestes = {
  // ADICIONADO: Função para buscar o catálogo uma única vez.
  // Essencial para a página de Entrada de Estoque.
  async buscarTodos() {
    const q = collection(db, NOME_COLECAO)
    const snapshot = await getDocs(q)
    const testes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return testes.sort((a, b) => a.nome.localeCompare(b.nome))
  },

  monitorarTestes(callback) {
    const q = collection(db, NOME_COLECAO)
    return onSnapshot(q, (snapshot) => {
      const testes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      testes.sort((a, b) => a.nome.localeCompare(b.nome))
      callback(testes)
    })
  },

  adicionarMarca(idTeste, dadosMarca) {
    const docRef = doc(db, NOME_COLECAO, idTeste)
    return updateDoc(docRef, {
      marcas: arrayUnion(dadosMarca),
    })
  },

  async atualizarTeste(idTeste, dadosParaAtualizar) {
    const docRef = doc(db, NOME_COLECAO, idTeste)
    return updateDoc(docRef, dadosParaAtualizar)
  },

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
