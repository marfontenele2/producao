// ARQUIVO NOVO: src/components/admin/DataCorrectionUtil.vue
<template>
  <div class="correction-util">
    <h4>Ferramenta de Correção de Dados</h4>
    <p>
      Use este botão uma única vez para adicionar IDs únicos às marcas de testes
      que não os possuem.
    </p>
    <button @click="correctData" :disabled="running">
      {{ running ? "Corrigindo..." : "Corrigir Dados Antigos" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const running = ref(false);

const correctData = async () => {
  if (
    !confirm(
      "Esta ação irá modificar os dados no Firestore para garantir a consistência. Deseja continuar?"
    )
  ) {
    return;
  }
  running.value = true;
  console.log("Iniciando script de correção de dados...");
  try {
    const testesRef = collection(db, "boletimTestes");
    const snapshot = await getDocs(testesRef);

    if (snapshot.empty) {
      alert("Nenhum teste encontrado para corrigir.");
      console.warn("Nenhum teste encontrado para corrigir.");
      running.value = false;
      return;
    }

    let correcoes = 0;
    for (const testeDoc of snapshot.docs) {
      const data = testeDoc.data();
      if (!data.marcas || !Array.isArray(data.marcas)) continue;

      let marcasAtualizadas = false;
      const novasMarcas = data.marcas.map((marca) => {
        if (typeof marca === "object" && marca !== null && !marca.id) {
          marcasAtualizadas = true;
          correcoes++;
          return { ...marca, id: uuidv4() };
        }
        return marca;
      });

      if (marcasAtualizadas) {
        console.log(`Corrigindo marcas para o teste: ${testeDoc.id}`);
        const docRef = doc(db, "boletimTestes", testeDoc.id);
        await updateDoc(docRef, { marcas: novasMarcas });
      }
    }

    if (correcoes > 0) {
      console.log(
        `Correção finalizada! ${correcoes} marcas foram atualizadas. A página será recarregada.`
      );
      alert(
        `Correção finalizada! ${correcoes} marcas foram atualizadas. A página será recarregada.`
      );
      location.reload();
    } else {
      console.log(
        "Nenhuma correção necessária. Todos os dados já estão consistentes."
      );
      alert(
        "Nenhuma correção necessária. Todos os dados já estão consistentes."
      );
    }
  } catch (e) {
    console.error("ERRO AO EXECUTAR O SCRIPT DE CORREÇÃO:", e);
    alert(
      "Ocorreu um erro ao executar o script de correção. Verifique o console."
    );
  } finally {
    running.value = false;
  }
};
</script>

<style scoped>
.correction-util {
  border: 2px dashed #dc3545;
  background-color: #fff3f3;
  padding: 16px;
  margin: 24px 0;
  border-radius: 8px;
}
.correction-util h4 {
  margin-top: 0;
  color: #dc3545;
}
.correction-util button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.correction-util button:disabled {
  background-color: #ccc;
}
</style>
