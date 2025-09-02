import { db } from '@/nucleo/configuracao/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

export const servicoProducaoAdolescente = {
  async salvarProducao(competencia, equipeId, dadosProducao) {
    const storeUsuario = useStoreUsuario()
    const { uid, ubsId } = storeUsuario.usuario

    if (!equipeId) {
      throw new Error('Usuário sem equipe associada. Não é possível salvar.')
    }
    if (!competencia) {
      throw new Error('Competência não fornecida. Não é possível salvar.')
    }

    // CORREÇÃO: A ordem do ID agora é "competencia_equipeId" para ser consistente
    // com o serviço de verificação.
    const docId = `${competencia}_${equipeId}`
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

  async buscarProducaoPorCompetencia(competencia, equipeId) {
    if (!competencia || !equipeId) return null

    // A ordem aqui já estava correta, o que causava a inconsistência.
    const docId = `${competencia}_${equipeId}`
    const docRef = doc(db, 'producaoAdolescente', docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return null
    }
  },
}
