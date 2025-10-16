import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { subMonths, format } from 'date-fns'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'

const NOME_COLECAO = 'scnes'

export const ServicoSCNES = {
  /**
   * Carrega a lista de profissionais de uma equipe para uma competência específica.
   */
  async carregarProfissionais(competencia, equipeId) {
    if (!competencia || !equipeId) return []
    const docId = `${competencia}_${equipeId}`
    const docRef = doc(db, NOME_COLECAO, docId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && docSnap.data().profissionais) {
      return docSnap.data().profissionais
    }
    return []
  },

  /**
   * Salva a lista de profissionais para uma competência e equipe.
   */
  async salvarProfissionais(competencia, equipeId, profissionais) {
    const notificacaoStore = useStoreNotificacoes()
    if (!competencia || !equipeId || !profissionais) {
      notificacaoStore.mostrarNotificacao({
        tipo: 'erro',
        mensagem: 'Dados insuficientes para salvar.',
      })
      return false
    }
    const docId = `${competencia}_${equipeId}`
    const docRef = doc(db, NOME_COLECAO, docId)
    try {
      await setDoc(docRef, { profissionais: profissionais }, { merge: true })
      return true
    } catch (error) {
      console.error('Erro ao salvar profissionais SCNES: ', error)
      return false
    }
  },

  /**
   * Busca a lista de profissionais mais recente de uma equipe.
   */
  async buscarProfissionaisMaisRecentes(equipeId) {
    if (!equipeId) return []
    let dataDeBusca = new Date()
    for (let i = 0; i < 4; i++) {
      const competencia = format(dataDeBusca, 'yyyy-MM')
      const docId = `${competencia}_${equipeId}`
      const docRef = doc(db, NOME_COLECAO, docId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists() && docSnap.data().profissionais?.length > 0) {
        return docSnap.data().profissionais
      }
      dataDeBusca = subMonths(dataDeBusca, 1)
    }
    return []
  },
}
