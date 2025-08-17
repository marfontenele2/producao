// 📄 ARQUIVO CORRIGIDO: src/services/coordenadorService.js
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { validacaoStatusService } from "./validacaoStatusService";

const modulosDeValidacaoSemanal = [
  {
    chave: "mdda",
    colecao: "producaoMDDA",
    nome: "MDDA",
    tipoEntrega: "finalizado",
  },
  {
    chave: "notificacaoSemanal",
    colecao: "notificacaoSemanal",
    nome: "Notificação Semanal",
    tipoEntrega: "finalizado",
  },
  {
    chave: "sarampo",
    colecao: "producaoSarampo",
    nome: "Sarampo",
    tipoEntrega: "finalizado",
  },
];

export const coordenadorService = {
  async getStatusProducaoGeral(competencia) {
    if (!competencia) return [];
    const [ubsSnap, equipesSnap, prazosDoc] = await Promise.all([
      getDocs(collection(db, "ubs")),
      getDocs(collection(db, "equipes")),
      getDoc(doc(db, "prazos", competencia)),
    ]);
    const ubsList = ubsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const equipesList = equipesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const prazosData = prazosDoc.exists() ? prazosDoc.data() : {};
    const modulos = validacaoStatusService.getModulosDeValidacao();
    const producaoData = {};
    for (const modulo of modulos) {
      const producaoQuery = query(
        collection(db, modulo.colecao),
        where("competencia", "==", competencia)
      );
      const producaoSnapshot = await getDocs(producaoQuery);
      producaoData[modulo.chave] = new Map(
        producaoSnapshot.docs.map((d) => [d.id, d.data()])
      );
    }
    return ubsList.map((ubs) => {
      const equipesDaUbs = equipesList
        .filter((e) => e.ubsId === ubs.id)
        .sort((a, b) => a.nome.localeCompare(b.nome));
      const statusEquipes = equipesDaUbs.map((equipe) => {
        const statusEquipe = { id: equipe.id, nome: equipe.nome, modulos: {} };
        for (const modulo of modulos) {
          const docId = `${competencia}_${equipe.id}`;
          const docProducao = producaoData[modulo.chave]?.get(docId);
          let status = "Pendente";
          let cor = "#6c757d";
          const prazo = prazosData[modulo.chave];
          let prazoExpirado = false;
          if (prazo && prazo.fechamento) {
            const hoje = new Date();
            const dataFechamento = new Date(prazo.fechamento + "T23:59:59Z");
            if (hoje > dataFechamento) prazoExpirado = true;
          }
          if (docProducao) {
            const isEntregue =
              (modulo.tipoEntrega === "consolidado" &&
                docProducao.consolidado) ||
              (modulo.tipoEntrega === "finalizado" && docProducao.finalizado) ||
              modulo.tipoEntrega === "existencia";
            if (docProducao.validado) {
              status = "VALIDADO";
              cor = "#007bff";
            } else if (isEntregue) {
              status = "ENTREGUE";
              cor = "#28a745";
            } else {
              status = "Pendente";
              cor = "#ffc107";
            }
          } else {
            status = prazoExpirado ? "Não Entregue" : "Aberto";
            cor = prazoExpirado ? "#dc3545" : "#6c757d";
          }
          statusEquipe.modulos[modulo.chave] = {
            status,
            cor,
            nome: modulo.nome,
          };
        }
        return statusEquipe;
      });
      return { ...ubs, equipes: statusEquipes };
    });
  },

  async getStatusProducaoSemanalGeral(semanas) {
    if (!semanas || semanas.length === 0) return [];
    const [ubsSnap, equipesSnap, prazosDoc] = await Promise.all([
      getDocs(collection(db, "ubs")),
      getDocs(collection(db, "equipes")),
      getDoc(doc(db, "prazosSemanais", "config")),
    ]);
    const ubsList = ubsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const equipesList = equipesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    const prazosData = prazosDoc.exists() ? prazosDoc.data() : {};
    const producaoData = {};
    const docIds = semanas.flatMap((semana) =>
      equipesList.map((equipe) => `${semana}_${equipe.id}`)
    );
    for (const modulo of modulosDeValidacaoSemanal) {
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
    return ubsList.map((ubs) => {
      const equipesDaUbs = equipesList
        .filter((e) => e.ubsId === ubs.id)
        .sort((a, b) => a.nome.localeCompare(b.nome));
      const statusEquipes = equipesDaUbs.map((equipe) => {
        const statusEquipe = { id: equipe.id, nome: equipe.nome, modulos: {} };
        for (const modulo of modulosDeValidacaoSemanal) {
          let statusAgregado = "Aberto";
          let corAgregada = "#6c757d";
          const entregasDaEquipe = semanas.map((semana) => {
            const docId = `${semana}_${equipe.id}`;
            return producaoData[modulo.chave]?.get(docId)?.finalizado || false;
          });
          if (entregasDaEquipe.every((e) => e === true)) {
            statusAgregado = "ENTREGUE";
            corAgregada = "#28a745";
          } else if (entregasDaEquipe.some((e) => e === true)) {
            statusAgregado = "Parcial";
            corAgregada = "#ffc107";
          } else {
            const prazo = prazosData[modulo.chave];
            let isAberto = false;
            if (prazo && typeof prazo.abertura === "number") {
              const hoje = new Date().getDay();
              if (prazo.abertura > prazo.fechamento) {
                isAberto = hoje >= prazo.abertura || hoje <= prazo.fechamento;
              } else {
                isAberto = hoje >= prazo.abertura && hoje <= prazo.fechamento;
              }
            }
            statusAgregado = isAberto ? "Aberto" : "Encerrado";
            corAgregada = isAberto ? "#6c757d" : "#dc3545";
          }
          statusEquipe.modulos[modulo.chave] = {
            status: statusAgregado,
            cor: corAgregada,
            nome: modulo.nome,
          };
        }
        return statusEquipe;
      });
      return { ...ubs, equipes: statusEquipes };
    });
  },

  getModulosDeValidacaoSemanal() {
    return modulosDeValidacaoSemanal;
  },

  async getRelatorioScnes({ competencia, ubsIds = [], equipeIds = [] }) {
    if (!competencia) return [];
    const [equipesSnap, ubsSnap] = await Promise.all([
      getDocs(collection(db, "equipes")),
      getDocs(collection(db, "ubs")),
    ]);
    const ubsMap = new Map(ubsSnap.docs.map((doc) => [doc.id, doc.data()]));
    let equipesFiltradas = equipesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (ubsIds.length > 0)
      equipesFiltradas = equipesFiltradas.filter((e) =>
        ubsIds.includes(e.ubsId)
      );
    if (equipeIds.length > 0)
      equipesFiltradas = equipesFiltradas.filter((e) =>
        equipeIds.includes(e.id)
      );
    const docIds = equipesFiltradas.map((e) => `${competencia}_${e.id}`);
    if (docIds.length === 0) return [];
    const scnesQuery = query(
      collection(db, "scnes"),
      where("__name__", "in", docIds)
    );
    const scnesSnapshot = await getDocs(scnesQuery);
    const relatorio = [];
    scnesSnapshot.forEach((doc) => {
      const data = doc.data();
      const equipeInfo = equipesFiltradas.find((e) => e.id === data.equipeId);
      if (equipeInfo && data.profissionais) {
        const ubsInfo = ubsMap.get(equipeInfo.ubsId);
        data.profissionais.forEach((prof) => {
          relatorio.push({
            ...prof,
            equipeNome: equipeInfo.nome,
            ubsNome: ubsInfo ? ubsInfo.nome : "N/A",
          });
        });
      }
    });
    return relatorio.sort((a, b) => a.nome.localeCompare(b.nome));
  },

  async getRelatorioSaudeMental({ competencia, ubsIds = [], equipeIds = [] }) {
    if (!competencia) return [];
    const [equipesSnap, ubsSnap] = await Promise.all([
      getDocs(collection(db, "equipes")),
      getDocs(collection(db, "ubs")),
    ]);
    const ubsMap = new Map(ubsSnap.docs.map((doc) => [doc.id, doc.data()]));
    let equipesFiltradas = equipesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (ubsIds.length > 0)
      equipesFiltradas = equipesFiltradas.filter((e) =>
        ubsIds.includes(e.ubsId)
      );
    if (equipeIds.length > 0)
      equipesFiltradas = equipesFiltradas.filter((e) =>
        equipeIds.includes(e.id)
      );
    if (equipesFiltradas.length === 0) return [];
    const acompanhamentosData = new Map();
    const docIdsAcompanhamento = equipesFiltradas.map(
      (e) => `${competencia}_${e.id}`
    );
    const acompanhamentosQuery = query(
      collection(db, "acompanhamentosSaudeMental"),
      where("__name__", "in", docIdsAcompanhamento)
    );
    const acompanhamentosSnapshot = await getDocs(acompanhamentosQuery);
    acompanhamentosSnapshot.forEach((doc) => {
      acompanhamentosData.set(doc.id, doc.data().acompanhamentos || {});
    });
    const relatorioFinal = [];
    for (const equipe of equipesFiltradas) {
      const ubsInfo = ubsMap.get(equipe.ubsId);
      const pacientesCollection = `equipes/${equipe.id}/pacientesSaudeMental`;
      const pacientesQuery = query(
        collection(db, pacientesCollection),
        orderBy("nome")
      );
      const pacientesSnapshot = await getDocs(pacientesQuery);
      const acompanhamentosDaEquipe =
        acompanhamentosData.get(`${competencia}_${equipe.id}`) || {};
      pacientesSnapshot.forEach((pacienteDoc) => {
        const pacienteData = pacienteDoc.data();
        relatorioFinal.push({
          id: pacienteDoc.id,
          nome: pacienteData.nome,
          cns: pacienteData.cns,
          status: acompanhamentosDaEquipe[pacienteDoc.id] || "Não Informado",
          equipeNome: equipe.nome,
          ubsNome: ubsInfo ? ubsInfo.nome : "N/A",
        });
      });
    }
    return relatorioFinal;
  },

  async getRelatorioAdolescente({ competencia, ubsIds = [], equipeIds = [] }) {
    if (!competencia) return null;
    let equipesQuery = collection(db, "equipes");
    if (ubsIds.length > 0) {
      equipesQuery = query(equipesQuery, where("ubsId", "in", ubsIds));
    }
    const equipesSnap = await getDocs(equipesQuery);
    let equipesFiltradas = equipesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (equipeIds.length > 0) {
      equipesFiltradas = equipesFiltradas.filter((e) =>
        equipeIds.includes(e.id)
      );
    }
    const docIds = equipesFiltradas.map((e) => `${competencia}_${e.id}`);
    if (docIds.length === 0) return null;
    const relatoriosQuery = query(
      collection(db, "producaoAdolescente"),
      where("__name__", "in", docIds)
    );
    const relatoriosSnapshot = await getDocs(relatoriosQuery);
    const consolidado = {
      atendimentos: {
        acompanhamentoCrescimento: {},
        planejamentoFamiliar: {},
        imunizacao: {},
        preNatal: {},
        ist: {},
        queixasGineco: {},
        queixasClinicas: {},
        dentista: {},
        nutricao: {},
        transtornosEmocionais: {},
        oficinasEducativas: {},
      },
      metodos: {
        preservativoMasc: {},
        anticoncepcionalOral: {},
        anticoncepcionalInjetavel: {},
      },
    };
    const somar = (obj, path, valor) => {
      const keys = path.split(".");
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] =
        (current[keys[keys.length - 1]] || 0) + (Number(valor) || 0);
    };
    relatoriosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.atendimentos) {
        for (const secao in data.atendimentos) {
          for (const campo in data.atendimentos[secao]) {
            somar(
              consolidado,
              `atendimentos.${secao}.${campo}`,
              data.atendimentos[secao][campo]
            );
          }
        }
      }
      if (data.metodos) {
        for (const secao in data.metodos) {
          for (const campo in data.metodos[secao]) {
            somar(
              consolidado,
              `metodos.${secao}.${campo}`,
              data.metodos[secao][campo]
            );
          }
        }
      }
    });
    return consolidado;
  },
};
