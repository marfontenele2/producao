// 📄 ARQUIVO ATUALIZADO: src/services/notificacaoSemanalService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "notificacaoSemanal";

// ✅ ESTRUTURA UNIFICADA
const estruturaVazia = {
  tetanoNeonatal: null,
  paralisiaFlacida: null,
  casosSuspeitosSarampo: null,
  casosParalisia: [], // <-- CAMPO ADICIONADO
  finalizado: false,
};

export const notificacaoSemanalService = {
  monitorarProducao(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      // Garante que a estrutura esteja sempre completa
      callback({ ...estruturaVazia, ...data });
    });
  },

  async salvarProducao(documentoId, dados, equipeId, ubsId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const [ano, semana] = documentoId.split("_")[0].split("-W");
    await setDoc(
      docRef,
      {
        ...dados,
        ano,
        semana: semana.replace(/^0+/, ""),
        equipeId,
        ubsId,
        atualizadoEm: new Date(),
      },
      { merge: true }
    );
  },

  async finalizarCompetencia(documentoId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    await setDoc(
      docRef,
      { finalizado: true, finalizadoEm: new Date() },
      { merge: true }
    );
  },

  async getDadosCompetencia(documentoId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
};
