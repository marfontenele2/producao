// ARQUIVO NOVO: src/services/inspetorService.js

import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Serviço de debug para buscar todos os documentos de produção de uma competência,
 * independentemente do status, para fins de inspeção.
 */
export const inspetorService = {
  async inspecionarProducoes(competencia, ubsId) {
    const colecoes = [
      "scnes",
      "producaoAcs",
      "acompanhamentosSaudeMental",
      // Adicione aqui outras coleções de produção se necessário
    ];

    const resultados = {};

    for (const col of colecoes) {
      const q = query(
        collection(db, col),
        where("competencia", "==", competencia),
        where("ubsId", "==", ubsId)
      );
      const snapshot = await getDocs(q);
      resultados[col] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return resultados;
  },
};
