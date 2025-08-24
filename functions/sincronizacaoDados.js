// Arquivo: functions/sincronizacaoDados.js

const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')

/**
 * Atualiza o nome da equipe em todas as movimentações de estoque
 * sempre que o nome de uma equipe for alterado.
 * @param {import('firebase-functions/v2/firestore').FirestoreEvent<import('firebase-functions/v2/firestore').Change<import('firebase-admin/firestore').DocumentSnapshot>>} event
 */
async function atualizarNomeEquipeEmMovimentacoes(event) {
  const antes = event.data.before.data()
  const depois = event.data.after.data()

  // Verifica se o nome realmente mudou para evitar execuções desnecessárias
  if (antes.nome === depois.nome) {
    console.log(`Nome da equipe ${event.params.equipeId} não mudou.`)
    return null
  }

  const equipeId = event.params.equipeId
  const novoNome = depois.nome
  const db = getFirestore()

  console.log(
    `Mudança de nome para equipe ${equipeId}: "${antes.nome}" -> "${novoNome}". Atualizando logs...`,
  )

  const movimentacoesRef = db.collection('movimentacoesEstoque')
  const q = movimentacoesRef.where('equipeDestinoId', '==', equipeId)

  const snapshot = await q.get()

  if (snapshot.empty) {
    console.log(`Nenhuma movimentação de estoque encontrada para a equipe ${equipeId}.`)
    return null
  }

  // Atualiza todos os documentos encontrados em um batch para otimização
  const batch = db.batch()
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { equipeDestinoNome: novoNome })
  })

  await batch.commit()
  console.log(`${snapshot.size} registros de movimentação atualizados para a equipe ${equipeId}.`)
  return { count: snapshot.size }
}

module.exports = {
  onUpdateEquipe: onDocumentUpdated('equipes/{equipeId}', atualizarNomeEquipeEmMovimentacoes),
}
