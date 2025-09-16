// C:\producao\codigo_fonte\modulos\administrador\servicos\servicoEstoque.js

import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  where, // ADICIONADO
  getDocs, // ADICIONADO
} from 'firebase/firestore'

const NOME_COLECAO_ESTOQUE = 'estoqueTestesRapidos'
const NOME_COLECAO_MOVIMENTACOES = 'movimentacoesEstoque'
const NOME_COLECAO_AJUSTES = 'ajustesEstoque'

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

  // ===================================================================
  // === ADICIONADO: Nova função para a dispensação de insumos
  // ===================================================================
  /**
   * Busca todos os lotes de um item específico que ainda possuem estoque.
   * @param {string} testeId - O ID do tipo de teste.
   * @param {string} marcaId - O ID da marca do teste.
   * @returns {Promise<Array<object>>} Uma lista de lotes disponíveis, ordenados por validade.
   */
  async buscarLotesDisponiveis(testeId, marcaId) {
    const q = query(
      collection(db, NOME_COLECAO_ESTOQUE),
      where('testeId', '==', testeId),
      where('marcaId', '==', marcaId),
      where('quantidadeAtual', '>', 0),
      orderBy('dataValidade', 'asc'), // Primeiro que vence, primeiro que sai
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return []
    }
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },
  // ===================================================================

  async registrarSaidaDeLote({ lote, quantidadeSaida, equipeDestino, idUsuarioAdmin }) {
    const loteRef = doc(db, NOME_COLECAO_ESTOQUE, lote.id)
    const movimentacaoRef = doc(collection(db, NOME_COLECAO_MOVIMENTACOES))

    return runTransaction(db, async (transaction) => {
      const loteDoc = await transaction.get(loteRef)
      if (!loteDoc.exists()) {
        throw new Error('Erro: O lote de estoque não foi encontrado.')
      }
      const quantidadeAtual = loteDoc.data().quantidadeAtual
      if (quantidadeSaida > quantidadeAtual) {
        throw new Error('Erro: Quantidade de saída maior que o estoque atual.')
      }
      const novaQuantidade = quantidadeAtual - quantidadeSaida
      transaction.update(loteRef, { quantidadeAtual: novaQuantidade })

      const dadosMovimentacao = {
        tipo: 'saida',
        loteId: lote.id,
        testeId: lote.testeId,
        marcaId: lote.marcaId,
        testeNome: lote.testeNome,
        marcaNome: lote.marcaNome,
        loteCodigo: lote.codigoLote,
        quantidade: quantidadeSaida,
        equipeDestinoId: equipeDestino.id,
        equipeDestinoNome: equipeDestino.nome,
        ubsId: equipeDestino.ubsId,
        realizadoPor: idUsuarioAdmin,
        realizadoEm: serverTimestamp(),
      }
      transaction.set(movimentacaoRef, dadosMovimentacao)
    })
  },

  async ajustarEstoque({ loteId, quantidadeAnterior, quantidadeNova, motivo, adminId }) {
    const loteRef = doc(db, NOME_COLECAO_ESTOQUE, loteId)
    const ajusteRef = doc(collection(db, NOME_COLECAO_AJUSTES))

    return runTransaction(db, async (transaction) => {
      const loteDoc = await transaction.get(loteRef)
      if (!loteDoc.exists()) {
        throw new Error('Lote não encontrado. A operação foi cancelada.')
      }
      const dadosLote = loteDoc.data()
      transaction.update(loteRef, { quantidadeAtual: quantidadeNova })

      transaction.set(ajusteRef, {
        loteId,
        testeId: dadosLote.testeId,
        marcaId: dadosLote.marcaId,
        testeNome: dadosLote.testeNome,
        marcaNome: dadosLote.marcaNome,
        quantidadeAnterior,
        quantidadeNova,
        diferenca: quantidadeNova - quantidadeAnterior,
        motivo,
        realizadoPor: adminId,
        realizadoEm: serverTimestamp(),
      })
    })
  },
}
