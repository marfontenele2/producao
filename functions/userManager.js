// C:\producao\functions\userManager.js

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

exports.userManager = onCall(async (request) => {
  // 1. Verifica se o usuário que está chamando a função é um Administrador.
  if (request.auth.token.role !== 'Administrador') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem gerenciar usuários.')
  }

  const { action, payload } = request.data
  const auth = getAuth()
  const db = getFirestore()

  try {
    switch (action) {
      case 'createUser': {
        const { email, senha, nome, role, ubsId, equipeId } = payload
        // Cria o usuário no Firebase Authentication
        const userRecord = await auth.createUser({
          email: email,
          password: senha,
          displayName: nome,
        })
        // Define as permissões (claims) do usuário
        await auth.setCustomUserClaims(userRecord.uid, { role: role })
        // Cria o documento de perfil do usuário no Firestore
        await db
          .collection('users')
          .doc(userRecord.uid)
          .set({
            nome,
            email,
            role,
            ubsId: ubsId || null,
            equipeId: equipeId || null,
          })
        return { success: true, message: `Usuário ${nome} criado com sucesso.` }
      }

      case 'setUserRole': {
        const { uid, role, ubsId, equipeId } = payload
        await auth.setCustomUserClaims(uid, { role: role })
        await db
          .collection('users')
          .doc(uid)
          .update({
            role,
            ubsId: ubsId || null,
            equipeId: equipeId || null,
          })
        return { success: true, message: 'Usuário atualizado com sucesso.' }
      }

      case 'deleteUser': {
        const { uid } = payload
        await auth.deleteUser(uid)
        await db.collection('users').doc(uid).delete()
        return { success: true, message: 'Usuário excluído com sucesso.' }
      }

      default:
        throw new HttpsError('invalid-argument', 'Ação desconhecida.')
    }
  } catch (error) {
    console.error(`Erro na ação '${action}':`, error)
    throw new HttpsError('internal', `Ocorreu um erro ao executar a ação '${action}'.`)
  }
})
