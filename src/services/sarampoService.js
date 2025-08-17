// 📄 ARQUIVO GERADO: src/services/sarampoService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "producaoSarampo";

const estruturaVazia = {
  casos: [],
  acumuladoSarampo: null,
  acumuladoRubeola: null,
  finalizado: false,
};

export const sarampoService = {
  monitorarProducao(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : estruturaVazia);
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
        semana,
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
