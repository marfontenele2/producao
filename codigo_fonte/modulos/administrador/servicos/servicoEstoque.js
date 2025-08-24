import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction, // <-- Importação para transações seguras
} from 'firebase/firestore'

const NOME_COLECAO_ESTOQUE = 'estoqueTestesRapidos'
const NOME_COLECAO_MOVIMENTACOES = 'movimentacoesEstoque'

/**
 * Serviço para gerenciar o estoque de testes rápidos.
 */
export const servicoEstoque = {
  monitorarEstoque(callback) {
    const q = query(collection(db, NOME_COLECAO_ESTOQUE), orderBy('criadoEm', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const estoque = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(estoque)
    })
  },

  adicionarLote(dadosLote) {
    const dadosParaSalvar = {
      ...dadosLote,
      quantidadeAtual: dadosLote.quantidadeInicial,
      criadoEm: serverTimestamp(),
    }
    return addDoc(collection(db, NOME_COLECAO_ESTOQUE), dadosParaSalvar)
  },

  /**
   * --- FUNÇÃO NOVA E MELHORADA ---
   * Registra uma saída de estoque de forma transacional, garantindo a consistência dos dados.
   * @param {object} payload - Dados da operação de saída.
   * @param {object} payload.lote - O objeto completo do lote de estoque.
   * @param {number} payload.quantidadeSaida - A quantidade a ser removida.
   * @param {object} payload.equipeDestino - O objeto da equipe de destino.
   * @param {string} payload.idUsuarioAdmin - UID do administrador que realizou a operação.
   * @returns {Promise<void>}
   */
  async registrarSaidaDeLote({ lote, quantidadeSaida, equipeDestino, idUsuarioAdmin }) {
    const loteRef = doc(db, NOME_COLECAO_ESTOQUE, lote.id)
    const movimentacaoRef = doc(collection(db, NOME_COLECAO_MOVIMENTACOES))

    return runTransaction(db, async (transaction) => {
      const loteDoc = await transaction.get(loteRef)
      if (!loteDoc.exists()) {
        throw 'Erro: O lote de estoque não foi encontrado.'
      }

      const quantidadeAtual = loteDoc.data().quantidadeAtual
      if (quantidadeSaida > quantidadeAtual) {
        throw 'Erro: Quantidade de saída maior que o estoque atual.'
      }

      const novaQuantidade = quantidadeAtual - quantidadeSaida
      transaction.update(loteRef, { quantidadeAtual: novaQuantidade })

      transaction.set(movimentacaoRef, {
        tipo: 'saida',
        loteId: lote.id,
        testeNome: lote.testeNome,
        marcaNome: lote.marcaNome,
        loteCodigo: lote.lote,
        quantidade: quantidadeSaida,
        equipeDestinoId: equipeDestino.id,
        equipeDestinoNome: equipeDestino.nome,
        ubsId: equipeDestino.ubsId,
        realizadoPor: idUsuarioAdmin,
        realizadoEm: serverTimestamp(),
      })
    })
  },
}
