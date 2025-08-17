// ARQUIVO ATUALIZADO: src/services/boletimProfissionalService.js
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  updateDoc, // Adicionado para a finalização
} from "firebase/firestore";

export const boletimProfissionalService = {
  async getTestesLiberados(competencia) {
    if (!competencia) return [];

    const liberacaoRef = doc(db, "boletimLiberacoes", competencia);
    const liberacaoSnap = await getDoc(liberacaoRef);
    if (!liberacaoSnap.exists()) return [];
    const liberacaoData = liberacaoSnap.data().testesLiberados || {};

    const testesCollectionRef = collection(db, "boletimTestes");
    const todosTestesSnap = await getDocs(testesCollectionRef);
    const todosTestes = todosTestesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const testesLiberados = todosTestes
      .map((teste) => {
        const marcasLiberadasIds = liberacaoData[teste.id] || [];
        if (marcasLiberadasIds.length === 0) return null;
        const marcasFiltradas = teste.marcas.filter((marca) =>
          marcasLiberadasIds.includes(marca.id)
        );
        if (marcasFiltradas.length === 0) return null;
        return { ...teste, marcas: marcasFiltradas };
      })
      .filter(Boolean);
    return testesLiberados;
  },

  monitorarBoletimEquipe(documentoId, callback) {
    const docRef = doc(db, "boletimDados", documentoId);
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : {});
    });
  },

  async salvarDadosBoletim(documentoId, dadosBoletim, ubsId, equipeId) {
    const docRef = doc(db, "boletimDados", documentoId);
    await setDoc(
      docRef,
      {
        ...dadosBoletim,
        competencia: documentoId.split("_")[0],
        equipeId,
        ubsId,
        atualizadoEm: new Date(),
      },
      { merge: true }
    );
  },

  /**
   * ✅ NOVA FUNÇÃO: Marca o boletim da competência como finalizado.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   */
  async finalizarBoletim(documentoId) {
    const docRef = doc(db, "boletimDados", documentoId);
    // Usamos update para garantir que o documento já exista.
    await updateDoc(docRef, {
      finalizado: true,
      finalizadoEm: new Date(),
    });
  },
};
