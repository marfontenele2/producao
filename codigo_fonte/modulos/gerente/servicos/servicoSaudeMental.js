import { db } from '@/nucleo/configuracao/firebase'
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  getDoc,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

const NOME_COLECAO = 'saudeMental'

export const servicoSaudeMental = {
  /**
   * Monitora em tempo real o documento de uma equipe.
   */
  monitorarDadosDaEquipe(equipeId, callback) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data())
      } else {
        callback({ pacientes: [], acompanhamentos: {}, agendaSaudeMental: {} })
      }
    })
  },

  /**
   * Busca os dados de saúde mental de uma equipe uma única vez.
   */
  async buscarDadosDaEquipe(equipeId) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return { pacientes: [], acompanhamentos: {}, agendaSaudeMental: {} }
  },

  /**
   * Adiciona um novo paciente à lista persistente da equipe.
   */
  async adicionarPaciente(equipeId, dadosPaciente) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    const novoPaciente = {
      id: uuidv4(),
      ...dadosPaciente,
    }
    return setDoc(docRef, { pacientes: arrayUnion(novoPaciente) }, { merge: true })
  },

  /**
   * Atualiza os dados cadastrais de um paciente existente.
   */
  async atualizarPaciente(equipeId, pacienteAtualizado) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    return runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('Documento da equipe não encontrado.')
      }
      const dadosAtuais = docSnap.data()
      const pacientesAtuais = dadosAtuais.pacientes || []
      const index = pacientesAtuais.findIndex((p) => p.id === pacienteAtualizado.id)
      if (index === -1) {
        throw new Error('Paciente não encontrado na lista para atualizar.')
      }
      pacientesAtuais[index] = pacienteAtualizado
      transaction.update(docRef, { pacientes: pacientesAtuais })
    })
  },

  /**
   * Remove um paciente da lista persistente da equipe.
   */
  async removerPaciente(equipeId, pacienteParaRemover) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    return updateDoc(docRef, { pacientes: arrayRemove(pacienteParaRemover) })
  },

  /**
   * Salva o status de acompanhamento de um único paciente para uma competência.
   */
  async salvarAcompanhamento({ equipeId, competencia, pacienteId, status }) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    const campoParaAtualizar = `acompanhamentos.${competencia}.${pacienteId}`

    return updateDoc(docRef, {
      [campoParaAtualizar]: status,
    })
  },

  /**
   * Salva ou atualiza a agenda de saúde mental para uma competência específica.
   */
  async salvarAgendaDoMes({ equipeId, competencia, dadosAgenda }) {
    const docRef = doc(db, NOME_COLECAO, equipeId)
    const campoParaAtualizar = `agendaSaudeMental.${competencia}`

    return setDoc(
      docRef,
      {
        agendaSaudeMental: {
          [competencia]: dadosAgenda,
        },
      },
      { merge: true },
    )
  },
}
