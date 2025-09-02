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
} from 'firebase/firestore'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

const NOME_COLECAO = 'solicitacoesEstoque'

export const servicoSolicitacoes = {
  /**
   * @JSDoc
   * Cria um novo registro de solicitação de insumos no Firestore.
   * @param {Array<object>} itensSolicitados - Um array de itens que o enfermeiro está solicitando.
   * @returns {Promise<void>}
   */
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

  /**
   * @JSDoc
   * Monitora em tempo real as solicitações feitas por uma equipe específica.
   * @param {string} equipeId - O ID da equipe para filtrar as solicitações.
   * @param {function} callback - Função que será chamada com a lista de solicitações.
   * @returns {import('firebase/firestore').Unsubscribe} Função para parar de ouvir as atualizações.
   */
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

  /**
   * @JSDoc
   * Monitora em tempo real todas as solicitações com status 'pendente'.
   * @param {function} callback - Função que será chamada com a lista de solicitações pendentes.
   * @returns {import('firebase/firestore').Unsubscribe} Função para parar de ouvir as atualizações.
   */
  monitorarSolicitacoesPendentes(callback) {
    const q = query(
      collection(db, NOME_COLECAO),
      where('status', '==', 'pendente'),
      orderBy('solicitadoEm', 'asc'), // Pega as mais antigas primeiro
    )
    return onSnapshot(q, (snapshot) => {
      const solicitacoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      callback(solicitacoes)
    })
  },

  /**
   * @JSDoc
   * Atualiza o status de uma solicitação para 'atendido'.
   * @param {string} solicitacaoId - O ID da solicitação a ser atualizada.
   * @param {string} adminId - O UID do administrador que atendeu ao pedido.
   * @returns {Promise<void>}
   */
  marcarComoAtendida(solicitacaoId, adminId) {
    const docRef = doc(db, NOME_COLECAO, solicitacaoId)
    return updateDoc(docRef, {
      status: 'atendido',
      atendidoPor: adminId,
      atendidoEm: serverTimestamp(),
    })
  },

  /**
   * @JSDoc
   * Busca todas as solicitações de uma determinada competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array<object>>} Uma lista com os dados das solicitações.
   */
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
