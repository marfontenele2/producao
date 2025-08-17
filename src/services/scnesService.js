// 📄 ARQUIVO CORRIGIDO COM LIMPEZA: src/services/scnesService.js
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const collectionName = "scnes";

export const scnesService = {
  monitorarProfissionais(documentoId, callback) {
    if (!documentoId) {
      callback({ profissionais: [], finalizado: false });
      return () => {};
    }
    const docRef = doc(db, collectionName, documentoId);
    return onSnapshot(docRef, (docSnapshot) => {
      callback(
        docSnapshot.exists()
          ? docSnapshot.data()
          : { profissionais: [], finalizado: false }
      );
    });
  },

  async salvarProfissionais(documentoId, profissionais, equipeId, ubsId) {
    // ✅ LÓGICA DE LIMPEZA: Garantir que o ID seja gerado aqui centralizadamente.
    // Isso remove a necessidade de manipular o ID em outros locais.
    const profissionaisComId = profissionais.map((p) => {
      const { id, ...resto } = p; // Remove o ID antigo se houver (para cópias)
      return { id: id || uuidv4(), ...resto };
    });

    const docRef = doc(db, collectionName, documentoId);
    await setDoc(
      docRef,
      {
        profissionais: profissionaisComId,
        atualizadoEm: new Date(),
        equipeId: equipeId,
        ubsId: ubsId,
      },
      { merge: true }
    );
  },

  async finalizarMes(documentoId) {
    const docRef = doc(db, collectionName, documentoId);
    await setDoc(
      docRef,
      { finalizado: true, finalizadoEm: new Date() },
      { merge: true }
    );
  },

  async getProfissionais(documentoId) {
    const docRef = doc(db, collectionName, documentoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().profissionais || [] : [];
  },
};
