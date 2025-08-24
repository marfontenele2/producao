import { db } from '@/nucleo/configuracao/firebase'
import { collection, getDocs } from 'firebase/firestore'

/**
 * Serviço para realizar verificações de integridade e saúde do sistema.
 */
export const servicoDiagnostico = {
  /**
   * Verifica a integridade dos dados, procurando por usuários e equipes "órfãos".
   * @returns {Promise<object>} Um objeto com os resultados da verificação.
   */
  async verificarIntegridade() {
    try {
      // Busca todas as coleções principais em paralelo para otimizar
      const [usuariosSnap, equipesSnap, ubsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'equipes')),
        getDocs(collection(db, 'ubs')),
      ])

      const usuarios = usuariosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const equipes = equipesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Cria conjuntos de IDs para verificação rápida
      const ubsIds = new Set(ubsSnap.docs.map((doc) => doc.id))
      const equipeIds = new Set(equipes.map((doc) => doc.id))

      // Filtra usuários cujo ubsId ou equipeId não existe mais
      const usuariosOrfaos = usuarios
        .filter(
          (u) => (u.ubsId && !ubsIds.has(u.ubsId)) || (u.equipeId && !equipeIds.has(u.equipeId)),
        )
        .map((u) => ({
          nome: u.nome,
          email: u.email,
          id: u.id,
          ubsId_invalido: u.ubsId && !ubsIds.has(u.ubsId) ? u.ubsId : null,
          equipeId_invalido: u.equipeId && !equipeIds.has(u.equipeId) ? u.equipeId : null,
        }))

      // Filtra equipes cujo ubsId não existe mais
      const equipesOrfas = equipes
        .filter((e) => e.ubsId && !ubsIds.has(e.ubsId))
        .map((e) => ({ nome: e.nome, id: e.id, ubsId_invalido: e.ubsId }))

      return {
        usuariosOrfaos,
        equipesOrfas,
        totalUsuarios: usuarios.length,
        totalEquipes: equipes.length,
        totalUbs: ubsIds.size,
      }
    } catch (error) {
      console.error('Erro ao verificar integridade:', error)
      throw new Error('Falha ao executar a verificação de integridade.')
    }
  },
}
