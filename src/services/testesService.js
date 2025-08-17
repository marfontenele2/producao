// ARQUIVO CORRIGIDO: src/services/testesService.js
import { db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

const collectionName = "boletimTestes";

export const testesService = {
  monitorarTestes(callback) {
    const q = collection(db, collectionName);
    return onSnapshot(q, (snapshot) => {
      const testes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      testes.sort((a, b) => a.nome.localeCompare(b.nome));
      callback(testes);
    });
  },

  async adicionarMarca(testeId, marcaData) {
    const docRef = doc(db, collectionName, testeId);
    await updateDoc(docRef, {
      marcas: arrayUnion(marcaData),
    });
  },

  async removerMarca(testeId, marcaParaRemover) {
    const docRef = doc(db, collectionName, testeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dadosAtuais = docSnap.data();
      const marcasAtuais = dadosAtuais.marcas || [];

      const novasMarcas = marcasAtuais.filter(
        (marca) => marca.id !== marcaParaRemover.id
      );

      await updateDoc(docRef, {
        marcas: novasMarcas,
      });
    } else {
      throw new Error("Documento do teste não encontrado.");
    }
  },

  async inicializarTestesPadrao() {
    const testesFixos = [
      { id: "HIV", nome: "HIV" },
      { id: "Sifilis", nome: "Sífilis" },
      { id: "HBV", nome: "Hepatite B" },
      { id: "HCV", nome: "Hepatite C" },
      { id: "DUO", nome: "Teste DUO (HIV/Sífilis)" },
    ];

    for (const teste of testesFixos) {
      const docRef = doc(db, collectionName, teste.id);
      await setDoc(docRef, { nome: teste.nome }, { merge: true });
      const docSnap = await getDoc(docRef);
      // ✅ CORREÇÃO: Usando Object.hasOwn para uma verificação mais segura.
      if (!Object.hasOwn(docSnap.data(), "marcas")) {
        await updateDoc(docRef, { marcas: [] });
      }
    }
  },
};
