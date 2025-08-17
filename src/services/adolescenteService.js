// 📄 ARQUIVO GERADO: src/services/adolescenteService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "producaoAdolescente";

// Estrutura de dados inicial para um novo documento
const estruturaVazia = {
  atendimentos: {
    acompanhamentoCrescimento: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    planejamentoFamiliar: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    imunizacao: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    preNatal: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    ist: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    queixasGineco: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    queixasClinicas: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    dentista: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    nutricao: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    transtornosEmocionais: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
    oficinasEducativas: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      med: null,
      enf: null,
      outros: null,
    },
  },
  metodos: {
    preservativoMasc: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      estoque: null,
    },
    anticoncepcionalOral: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      estoque: null,
    },
    anticoncepcionalInjetavel: {
      masc1: null,
      fem1: null,
      masc2: null,
      fem2: null,
      estoque: null,
    },
  },
  finalizado: false,
};

export const adolescenteService = {
  monitorarProducao(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      // Mescla os dados do banco com a estrutura vazia para garantir que todos os campos existam
      if (docSnap.exists()) {
        const data = docSnap.data();
        const mergedData = JSON.parse(JSON.stringify(estruturaVazia)); // Deep copy
        Object.keys(mergedData).forEach((section) => {
          if (data[section]) {
            Object.keys(mergedData[section]).forEach((item) => {
              if (data[section][item]) {
                Object.assign(mergedData[section][item], data[section][item]);
              }
            });
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
      {
        ...dados,
        competencia,
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
