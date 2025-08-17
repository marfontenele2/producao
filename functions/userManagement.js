// 📄 ARQUIVO: functions/userManagement.js
// ✅ VERSÃO FINAL: A verificação de segurança foi restaurada.

const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

async function createUser(data, context) {
  if (context.auth.token.role !== "Administrador") {
    throw new HttpsError(
      "permission-denied",
      "Apenas administradores podem criar usuários."
    );
  }

  const { email, password, nome, role, ubsId, equipeId } = data.payload;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nome,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        nome,
        email,
        role,
        ubsId: ubsId || null,
        equipeId: equipeId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error("Erro detalhado ao criar usuário:", error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao criar o usuário.",
      error.message
    );
  }
}

async function deleteUser(data, context) {
  if (context.auth.token.role !== "Administrador") {
    throw new HttpsError(
      "permission-denied",
      "Apenas administradores podem deletar usuários."
    );
  }
  const { uid } = data.payload;
  try {
    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();
    return { success: true, message: "Usuário excluído com sucesso." };
  } catch (error) {
    console.error("Erro detalhado ao excluir usuário:", error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao excluir o usuário.",
      error.message
    );
  }
}

async function setUserRole(data, context) {
  // ✅ Verificação de segurança restaurada.
  // Agora que você é admin, apenas você poderá executar esta função.
  if (context.auth.token.role !== "Administrador") {
    throw new HttpsError(
      "permission-denied",
      "Apenas administradores podem definir roles."
    );
  }

  const { uid, role } = data.payload;
  if (!uid || !role) {
    throw new HttpsError("invalid-argument", "UID e role são obrigatórios.");
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    // Atualiza também no Firestore para consistência
    await admin.firestore().collection("users").doc(uid).update({ role: role });

    return {
      success: true,
      message: `Role '${role}' definida para o usuário ${uid}.`,
    };
  } catch (error) {
    console.error("Erro ao definir a role:", error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao definir a role.",
      error.message
    );
  }
}

module.exports = {
  createUser,
  deleteUser,
  setUserRole,
};
