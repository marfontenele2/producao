// codigo_fonte/modulos/gerente/servicos/ServicoSCNES.js

// CORRIGIDO: O caminho para o arquivo de configuração do Firebase foi ajustado.
import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

// ... (o restante do arquivo permanece o mesmo)
/**
 * @description
 * Gera o ID do documento no Firestore com base na competência e na equipe.
 * Formato: AAAA-MM_equipeId
 * @param {string} competencia - A competência no formato 'AAAA-MM'.
 * @param {string} equipeId - O ID da equipe.
 * @returns {string} O ID do documento formatado.
 */
const gerarDocumentoId = (competencia, equipeId) => `${competencia}_${equipeId}`

/**
 * @description
 * Carrega a lista de profissionais de uma equipe para uma competência específica.
 * Se o documento não existir no Firestore, retorna uma lista vazia,
 * permitindo que a interface inicie um novo cadastro.
 * @param {string} competencia - A competência no formato 'AAAA-MM'.
 * @param {string} equipeId - O ID da equipe.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para a lista de profissionais.
 */
export const carregarProfissionais = async (competencia, equipeId) => {
  if (!competencia || !equipeId) {
    console.warn('Competência ou ID da equipe não fornecidos para carregar SCNES.')
    return []
  }

  const docId = gerarDocumentoId(competencia, equipeId)
  const docRef = doc(db, 'scnes', docId)

  try {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const profissionais = docSnap.data().profissionais || []
      return profissionais.map((p) => ({ ...p, id: p.id || uuidv4() }))
    } else {
      return []
    }
  } catch (error) {
    console.error('Erro ao carregar lista de profissionais SCNES:', error)
    return []
  }
}

/**
 * @description
 * Salva (sobrescreve) a lista completa de profissionais para uma competência e equipe.
 * Garante que cada profissional na lista tenha um ID único antes de salvar.
 * @param {string} competencia - A competência no formato 'AAAA-MM'.
 * @param {string} equipeId - O ID da equipe.
 * @param {Array<Object>} listaProfissionais - A lista de objetos de profissionais a ser salva.
 * @returns {Promise<boolean>} Uma promessa que resolve para 'true' em caso de sucesso e 'false' em caso de falha.
 */
export const salvarProfissionais = async (competencia, equipeId, listaProfissionais) => {
  if (!competencia || !equipeId || !listaProfissionais) {
    console.error('Dados insuficientes para salvar a lista de profissionais SCNES.')
    return false
  }

  const profissionaisComId = listaProfissionais.map((profissional) => ({
    ...profissional,
    id: profissional.id || uuidv4(),
  }))

  const docId = gerarDocumentoId(competencia, equipeId)
  const docRef = doc(db, 'scnes', docId)

  try {
    await setDoc(docRef, {
      profissionais: profissionaisComId,
      ultimaAtualizacao: new Date().toISOString(),
      competencia: competencia,
      equipeId: equipeId,
    })
    return true
  } catch (error) {
    console.error('Erro ao salvar a lista de profissionais SCNES:', error)
    return false
  }
}
