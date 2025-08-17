// 📄 ARQUIVO CORRIGIDO: src/services/saudeMentalService.js
import { db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  getDocs, // Adicionado para a nova função
  getDoc, // Adicionado para a nova função
} from "firebase/firestore";

const PACIENTES_COLLECTION = (equipeId) =>
  `equipes/${equipeId}/pacientesSaudeMental`;
const ACOMPANHAMENTOS_COLLECTION = "acompanhamentosSaudeMental";

export const saudeMentalService = {
  monitorarPacientes(equipeId, callback) {
    const q = query(
      collection(db, PACIENTES_COLLECTION(equipeId)),
      orderBy("nome")
    );
    return onSnapshot(q, (snapshot) => {
      const pacientes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pacientes);
    });
  },

  adicionarPaciente(equipeId, pacienteData) {
    return addDoc(collection(db, PACIENTES_COLLECTION(equipeId)), pacienteData);
  },

  removerPaciente(equipeId, pacienteId) {
    return deleteDoc(doc(db, PACIENTES_COLLECTION(equipeId), pacienteId));
  },

  monitorarAcompanhamentos(documentoId, callback) {
    const docRef = doc(db, ACOMPANHAMENTOS_COLLECTION, documentoId);
    return onSnapshot(docRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data().acompanhamentos || {} : {});
    });
  },

  salvarAcompanhamentos(documentoId, acompanhamentosData, equipeId, ubsId) {
    const docRef = doc(db, ACOMPANHAMENTOS_COLLECTION, documentoId);
    return setDoc(
      docRef,
      {
        acompanhamentos: acompanhamentosData,
        atualizadoEm: new Date(),
        equipeId: equipeId,
        ubsId: ubsId,
        competencia: documentoId.split("_")[0],
      },
      { merge: true }
    );
  },

  /**
   * Busca os dados completos para impressão de uma competência.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   * @param {string} equipeId - ID da equipe.
   * @returns {Promise<object>}
   */
  async getAcompanhamentosCompletos(documentoId, equipeId) {
    const [pacientesSnapshot, acompanhamentosSnapshot, equipeDoc] =
      await Promise.all([
        getDocs(
          query(collection(db, PACIENTES_COLLECTION(equipeId)), orderBy("nome"))
        ),
        getDoc(doc(db, ACOMPANHAMENTOS_COLLECTION, documentoId)),
        getDoc(doc(db, "equipes", equipeId)),
      ]);

    const pacientes = pacientesSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const acompanhamentos = acompanhamentosSnapshot.exists()
      ? acompanhamentosSnapshot.data().acompanhamentos || {}
      : {};

    const pacientesComStatus = pacientes.map((p) => ({
      ...p,
      status: acompanhamentos[p.id] || "Não Informado",
    }));

    let nomeEquipe = "";
    let nomeUbs = "";
    if (equipeDoc.exists()) {
      const equipeData = equipeDoc.data();
      nomeEquipe = equipeData.nome;
      if (equipeData.ubsId) {
        const ubsDoc = await getDoc(doc(db, "ubs", equipeData.ubsId));
        if (ubsDoc.exists()) {
          nomeUbs = ubsDoc.data().nome;
        }
      }
    }

    return { pacientesComStatus, nomeEquipe, nomeUbs };
  },
};
