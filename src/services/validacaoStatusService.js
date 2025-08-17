// 📄 ARQUIVO CORRIGIDO E FINAL: src/services/validacaoStatusService.js
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

// ✅ LISTA CORRETA E COMPLETA de módulos que o Enfermeiro entrega e o Gerente valida.
// ✅ LISTA CORRETA E COMPLETA de módulos que o Enfermeiro entrega e o Gerente valida.
const modulosDeValidacao = [
  {
    chave: "producaoAcs",
    colecao: "producaoAcs",
    nome: "Produção ACS",
    tipoEntrega: "consolidado", // O gerente valida após o enfermeiro consolidar
  },
  {
    chave: "cronograma",
    colecao: "cronogramas",
    nome: "Cronograma",
    tipoEntrega: "existencia", // A simples existência do doc já conta como entrega
  },
  {
    chave: "boletim",
    colecao: "boletimDados",
    nome: "Boletim de Testes Rápidos",
    tipoEntrega: "finalizado", // O gerente valida após o enfermeiro finalizar
  },
  {
    chave: "suplementos",
    colecao: "producaoSuplementos",
    nome: "Suplementos",
    tipoEntrega: "finalizado",
  },
  {
    chave: "educacaoPermanente",
    colecao: "producaoEducacaoPermanente",
    nome: "Educação Permanente",
    tipoEntrega: "finalizado",
  },
  {
    chave: "adolescente",
    colecao: "producaoAdolescente",
    nome: "Adolescente",
    tipoEntrega: "finalizado",
  },
  {
    chave: "gestantes",
    colecao: "producaoGestantes",
    nome: "Gestantes",
    tipoEntrega: "finalizado",
  },
];

export const validacaoStatusService = {
  /**
   * Busca o status de entrega de todos os módulos para todas as equipes da UBS.
   * A lógica agora reflete o ciclo de vida completo: Aberto -> Pendente -> Entregue -> Validado.
   */
  async getStatusProducaoEquipes(competencia, ubsId) {
    if (!competencia || !ubsId) return [];

    // 1. Busca as equipes da UBS
    const equipesQuery = query(
      collection(db, "equipes"),
      where("ubsId", "==", ubsId)
    );
    const equipesSnapshot = await getDocs(equipesQuery);
    if (equipesSnapshot.empty) return [];
    const equipes = equipesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const equipeIds = equipes.map((e) => e.id);

    // 2. Busca os prazos do mês
    const prazosDoc = await getDoc(doc(db, "prazos", competencia));
    const prazosData = prazosDoc.exists() ? prazosDoc.data() : {};

    // 3. Busca todos os documentos de produção relevantes de uma vez
    const producaoData = {};
    for (const modulo of modulosDeValidacao) {
      const docIds = equipeIds.map((id) => `${competencia}_${id}`);
      if (docIds.length > 0) {
        const producaoQuery = query(
          collection(db, modulo.colecao),
          where("__name__", "in", docIds)
        );
        const producaoSnapshot = await getDocs(producaoQuery);
        producaoData[modulo.chave] = new Map(
          producaoSnapshot.docs.map((d) => [d.id, d.data()])
        );
      }
    }

    // 4. Mapeia os dados para gerar o status de cada equipe/módulo
    return equipes.map((equipe) => {
      const statusEquipe = { id: equipe.id, nome: equipe.nome, modulos: {} };

      for (const modulo of modulosDeValidacao) {
        const docId = `${competencia}_${equipe.id}`;
        const docProducao = producaoData[modulo.chave]?.get(docId);

        let status = "Pendente";
        let cor = "#6c757d"; // Cinza (Pendente/Aberto)

        const prazo = prazosData[modulo.chave];
        let prazoExpirado = false;
        if (prazo && prazo.fechamento) {
          const hoje = new Date();
          const dataFechamento = new Date(prazo.fechamento + "T23:59:59Z");
          if (hoje > dataFechamento) {
            prazoExpirado = true;
          }
        }

        // --- INÍCIO DO BLOCO CORRIGIDO ---
        if (docProducao) {
          const isEntregue =
            (modulo.tipoEntrega === "consolidado" && docProducao.consolidado) ||
            (modulo.tipoEntrega === "finalizado" && docProducao.finalizado) ||
            modulo.tipoEntrega === "existencia";

          if (docProducao.validado) {
            status = "VALIDADO";
            cor = "#007bff"; // Azul
          } else if (isEntregue) {
            status = "ENTREGUE";
            cor = "#28a745"; // Verde
          } else {
            status = "Pendente";
            cor = "#ffc107"; // Amarelo
          }
        } else {
          if (prazoExpirado) {
            status = "Não Entregue";
            cor = "#dc3545"; // Vermelho
          } else {
            status = "Aberto";
            cor = "#6c757d"; // Cinza
          }
        }
        // --- FIM DO BLOCO CORRIGIDO ---

        statusEquipe.modulos[modulo.chave] = { status, cor, nome: modulo.nome };
      }
      return statusEquipe;
    });
  },

  getModulosDeValidacao() {
    return modulosDeValidacao;
  },
};
