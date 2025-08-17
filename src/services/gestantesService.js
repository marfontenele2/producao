// 📄 ARQUIVO GERADO: src/services/gestantesService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "producaoGestantes";

const estruturaVazia = {
  riscoHabitual: { total: null, branca: null, parda: null, preta: null },
  riscoIntermediario: { total: null, branca: null, parda: null, preta: null },
  altoRisco: { total: null, branca: null, parda: null, preta: null },
  finalizado: false,
};

export const gestantesService = {
  monitorarProducao(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // Mescla para garantir que a estrutura local esteja sempre completa
        const data = docSnap.data();
        const mergedData = JSON.parse(JSON.stringify(estruturaVazia));
        Object.keys(mergedData).forEach((key) => {
          if (data[key] && typeof data[key] === "object") {
            Object.assign(mergedData[key], data[key]);
          }
        });
        mergedData.finalizado = data.finalizado || false;
        callback(mergedData);
      } else {
        callback(estruturaVazia);
      }
    });
  },

  async salvarProducao(documentoId, dados, equipeId, ubsId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const competencia = documentoId.split("_")[0];
    await setDoc(
      docRef,
      { ...dados, competencia, equipeId, ubsId, atualizadoEm: new Date() },
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
    return docSnap.exists() ? docSnap.data() : estruturaVazia;
  },
};
