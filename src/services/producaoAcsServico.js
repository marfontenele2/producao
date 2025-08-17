// 📄 ARQUIVO FINAL E COMPLETO: src/services/producaoAcsServico.js
import { db } from "@/firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { scnesService } from "./scnesService.js";

const COLECAO_PRODUCAO_INDIVIDUAL = "producaoIndividualAcs";
const COLECAO_PRODUCAO_CONSOLIDADA = "producaoAcs";

export const producaoAcsServico = {
  async buscarProfissionaisAcsDaEquipe(competencia, equipeId) {
    if (!competencia || !equipeId) return [];
    try {
      const documentoIdScnes = `${competencia}_${equipeId}`;
      const todosProfissionais = await scnesService.getProfissionais(
        documentoIdScnes
      );
      return todosProfissionais.filter(
        (p) => p.cargo === "Agente Comunitário de Saúde (ACS)"
      );
    } catch (erro) {
      console.error("Erro ao buscar profissionais ACS do SCNES:", erro);
      throw new Error("Não foi possível carregar os profissionais do SCNES.");
    }
  },

  monitorarProducaoIndividual(documentoId, callback) {
    const docRef = doc(db, COLECAO_PRODUCAO_INDIVIDUAL, documentoId);
    return onSnapshot(docRef, (snapshot) => {
      const dadosPadrao = {
        listasNominais: { nascidosVivos: [], obitos: [] },
        consolidado: {},
      };
      callback(snapshot.exists() ? snapshot.data() : dadosPadrao);
    });
  },

  async salvarProducaoIndividual(documentoId, dadosProducao, metadados) {
    const docRef = doc(db, COLECAO_PRODUCAO_INDIVIDUAL, documentoId);
    await setDoc(
      docRef,
      { ...dadosProducao, ...metadados, salvoEm: new Date() },
      { merge: true }
    );
  },

  async finalizarProducaoIndividual(documentoId) {
    const docRef = doc(db, COLECAO_PRODUCAO_INDIVIDUAL, documentoId);
    await setDoc(
      docRef,
      { finalizado: true, finalizadoEm: new Date() },
      { merge: true }
    );
  },

  async buscarProducoesDaEquipe(competencia, equipeId) {
    if (!competencia || !equipeId) return [];
    const q = query(
      collection(db, COLECAO_PRODUCAO_INDIVIDUAL),
      where("competencia", "==", competencia),
      where("equipeId", "==", equipeId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async consolidarProducaoEquipe(
    competencia,
    equipeId,
    ubsId,
    registrosIndividuais
  ) {
    const documentoId = `${competencia}_${equipeId}`;
    const docRef = doc(db, COLECAO_PRODUCAO_CONSOLIDADA, documentoId);

    // Mapeia para um resumo dos registros, se necessário
    const resumoRegistros = registrosIndividuais.map((r) => ({
      acsId: r.acsId,
      acsNome: r.acsNome,
      documentoOriginalId: r.id,
    }));

    await setDoc(
      docRef,
      {
        competencia,
        equipeId,
        ubsId,
        registros: resumoRegistros,
        consolidado: true,
        consolidadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  },
};
