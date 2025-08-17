// ARQUIVO GERADO: src/services/cronogramaService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const collectionName = "cronogramas";

export const cronogramaService = {
  monitorarCronograma(documentoId, callback) {
    const docRef = doc(db, collectionName, documentoId);
    return onSnapshot(docRef, (docSnapshot) => {
      // Garante que o objeto retornado sempre tenha as três listas de eventos, mesmo se o documento não existir.
      const data = docSnapshot.exists()
        ? docSnapshot.data()
        : { eventosEnfermeiro: [], eventosMedico: [], eventosTecnico: [] };
      callback(data);
    });
  },

  async salvarCronograma(documentoId, cronogramaData, equipeId, ubsId) {
    // Itera sobre as chaves de eventos para garantir que cada evento tenha um ID.
    // Isso é crucial para edições e exclusões futuras.
    ["eventosEnfermeiro", "eventosMedico", "eventosTecnico"].forEach((key) => {
      if (cronogramaData[key]) {
        cronogramaData[key] = cronogramaData[key].map((evento) => ({
          ...evento,
          id: evento.id || uuidv4(), // Adiciona um ID se não existir
        }));
      }
    });

    const docRef = doc(db, collectionName, documentoId);
    await setDoc(
      docRef,
      {
        ...cronogramaData,
        atualizadoEm: new Date(),
        equipeId: equipeId,
        ubsId: ubsId,
        competencia: documentoId.split("_")[0],
      },
      { merge: true }
    );
  },
};
