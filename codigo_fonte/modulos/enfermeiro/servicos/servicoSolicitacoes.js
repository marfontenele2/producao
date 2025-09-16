import { db } from '@/nucleo/configuracao/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  getDocs,
  runTransaction,
} from 'firebase/firestore'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

const NOME_COLECAO = 'solicitacoesEstoque'
const NOME_COLECAO_ESTOQUE = 'estoqueTestesRapidos'

export const servicoSolicitacoes = {
  async criarSolicitacao(itensSolicitados) {
    const storeUsuario = useStoreUsuario()
    const { uid, nome, equipeId, nomeEquipe, ubsId, nomeUbs } = storeUsuario.usuario

    if (!equipeId) {
      throw new Error('Usuário sem equipe associada. Não é possível criar a solicitação.')
    }

    const dadosParaSalvar = {
      solicitanteId: uid,
      solicitanteNome: nome,
      equipeId,
      equipeNome: nomeEquipe,
      ubsId,
      ubsNome: nomeUbs,
      itens: itensSolicitados,
      status: 'pendente',
      solicitadoEm: serverTimestamp(),
      atendidoEm: null,
      atendidoPor: null,
    }

    return addDoc(collection(db, NOME_COLECAO), dadosParaSalvar)
  },

  monitorarSolicitacoesPorEquipe(equipeId, callback) {
    const q = query(
      collection(db, NOME_COLECAO),
      where('equipeId', '==', equipeId),
      orderBy('solicitadoEm', 'desc'),
    )
    return onSnapshot(q, (snapshot) => {
      const solicitacoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(solicitacoes)
    })
  },

  monitorarSolicitacoesPendentes(callback) {
    const q = query(
      collection(db, NOME_COLECAO),
      where('status', 'in', ['pendente', 'parcialmente_atendido']), // Agora busca ambos os status
      orderBy('solicitadoEm', 'asc'),
    )
    return onSnapshot(q, (snapshot) => {
      const solicitacoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(solicitacoes)
    })
  },

  async atenderItemSolicitacao({
    solicitacaoId,
    itemSolicitado,
    loteDispensado,
    caixasDispensadas,
    adminId,
  }) {
    const loteRef = doc(db, NOME_COLECAO_ESTOQUE, loteDispensado.id)
    const solicitacaoRef = doc(db, NOME_COLECAO, solicitacaoId)

    const unidadesDispensadas = caixasDispensadas * itemSolicitado.quantidadePorCaixa

    return runTransaction(db, async (transaction) => {
      const loteDoc = await transaction.get(loteRef)
      const solicitacaoDoc = await transaction.get(solicitacaoRef)

      if (!loteDoc.exists()) throw new Error('Lote de estoque não encontrado.')
      if (!solicitacaoDoc.exists()) throw new Error('Solicitação não encontrada.')

      const quantidadeAtualLote = loteDoc.data().quantidadeAtual
      if (unidadesDispensadas > quantidadeAtualLote) {
        throw new Error('Quantidade solicitada excede o estoque disponível neste lote.')
      }

      const novaQuantidadeLote = quantidadeAtualLote - unidadesDispensadas
      transaction.update(loteRef, { quantidadeAtual: novaQuantidadeLote })

      const dadosSolicitacao = solicitacaoDoc.data()
      const itensAtualizados = dadosSolicitacao.itens.map((item) => {
        if (item.testeId === itemSolicitado.testeId && item.marcaId === itemSolicitado.marcaId) {
          const dispensasAnteriores = item.dispensas || []
          const novaDispensa = {
            loteId: loteDispensado.id,
            codigoLote: loteDispensado.codigoLote,
            caixasAtendidas: caixasDispensadas,
            unidadesAtendidas: unidadesDispensadas,
            atendidoPor: adminId,
            // ===================================================================
            // === CORREÇÃO: Trocado serverTimestamp() por new Date()
            // ===================================================================
            atendidoEm: new Date(),
            // ===================================================================
          }
          return { ...item, dispensas: [...dispensasAnteriores, novaDispensa] }
        }
        return item
      })

      let todosItensAtendidos = true
      for (const item of itensAtualizados) {
        const totalAtendido = (item.dispensas || []).reduce((acc, d) => acc + d.caixasAtendidas, 0)
        if (totalAtendido < item.caixasSolicitadas) {
          todosItensAtendidos = false
          break
        }
      }

      const novoStatusGeral = todosItensAtendidos ? 'atendido' : 'parcialmente_atendido'

      transaction.update(solicitacaoRef, {
        itens: itensAtualizados,
        status: novoStatusGeral,
        ...(todosItensAtendidos && { atendidoEm: serverTimestamp(), atendidoPor: adminId }),
      })
    })
  },

  marcarComoAtendida(solicitacaoId, adminId) {
    const docRef = doc(db, NOME_COLECAO, solicitacaoId)
    return updateDoc(docRef, {
      status: 'atendido',
      atendidoPor: adminId,
      atendidoEm: serverTimestamp(),
    })
  },

  async buscarTodasAsSolicitacoesDaCompetencia(competencia) {
    const [ano, mes] = competencia.split('-')
    const inicioMes = new Date(ano, parseInt(mes, 10) - 1, 1)
    const fimMes = new Date(ano, parseInt(mes, 10), 0, 23, 59, 59)

    const q = query(
      collection(db, NOME_COLECAO),
      where('solicitadoEm', '>=', inicioMes),
      where('solicitadoEm', '<=', fimMes),
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return []
    }
    return querySnapshot.docs.map((doc) => doc.data())
  },
}
