import { db } from '@/nucleo/configuracao/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

/**
 * Serviço para gerenciar a produção do módulo de Saúde do Adolescente.
 */
export const servicoProducaoAdolescente = {
  /**
   * Salva os dados de produção do adolescente para uma competência.
   * @param {object} dadosProducao - O objeto reativo com os dados do formulário.
   * @returns {Promise<void>}
   */
  async salvarProducao(dadosProducao) {
    const storeUsuario = useStoreUsuario()
    const { uid, equipeId, ubsId } = storeUsuario.usuario

    if (!equipeId) {
      throw new Error('Usuário sem equipe associada. Não é possível salvar.')
    }

    const hoje = new Date()
    const competencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

    const docId = `${equipeId}_${competencia}`
    const docRef = doc(db, 'producaoAdolescente', docId)

    const dadosParaSalvar = {
      ...JSON.parse(JSON.stringify(dadosProducao)),
      competencia,
      equipeId,
      ubsId,
      atualizadoEm: serverTimestamp(),
      atualizadoPor: uid,
    }

    return setDoc(docRef, dadosParaSalvar, { merge: true })
  },

  /**
   * Busca um registro de produção de adolescente por competência e equipe.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<object|null>} Os dados da produção ou nulo se não encontrado.
   */
  async buscarProducaoPorCompetencia(competencia, equipeId) {
    if (!competencia || !equipeId) return null

    const docId = `${equipeId}_${competencia}`
    const docRef = doc(db, 'producaoAdolescente', docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return null
    }
  },
}
