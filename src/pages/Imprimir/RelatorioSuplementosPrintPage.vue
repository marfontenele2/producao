<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <div v-if="dados" class="report-content">
      <header class="print-header">
        <img
          src="@/assets/logo.png"
          alt="Logo da Prefeitura"
          class="logo-prefeitura"
        />
        <div class="header-text">
          <h2>
            CONSOLIDADO MENSAL DO ACOMPANHAMENTO DO FORNECIMENTO DE SUPLEMENTOS
          </h2>
          <p>
            <strong>Competência:</strong>
            {{ formatarCompetencia(props.competencia) }}
          </p>
          <p>
            <strong>UBS:</strong> {{ nomeUbs }} | <strong>Equipe:</strong>
            {{ nomeEquipe }}
          </p>
        </div>
      </header>

      <section>
        <h3>1- CRIANÇAS DE 4 A 24 MESES:</h3>
        <table>
          <thead>
            <tr>
              <th rowspan="2">Tipo de Suplemento</th>
              <th colspan="5">Quantidade de Entregas</th>
            </tr>
            <tr>
              <th>1ª</th>
              <th>2ª</th>
              <th>3ª</th>
              <th>4ª</th>
              <th>5ª</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dados.criancas?.xaropeSulfatoFerroso?.entrega1 || 0 }}</td>
              <td>{{ dados.criancas?.xaropeSulfatoFerroso?.entrega2 || 0 }}</td>
              <td>{{ dados.criancas?.xaropeSulfatoFerroso?.entrega3 || 0 }}</td>
              <td>{{ dados.criancas?.xaropeSulfatoFerroso?.entrega4 || 0 }}</td>
              <td>{{ dados.criancas?.xaropeSulfatoFerroso?.entrega5 || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>2- GESTANTES A PARTIR DA 20ª SEMANA:</h3>
        <table>
          <thead>
            <tr>
              <th rowspan="2">Tipo de Suplemento</th>
              <th colspan="5">Quantidade de Entregas</th>
            </tr>
            <tr>
              <th>1ª</th>
              <th>2ª</th>
              <th>3ª</th>
              <th>4ª</th>
              <th>5ª</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>
                {{ dados.gestantes?.xaropeSulfatoFerroso?.entrega1 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.xaropeSulfatoFerroso?.entrega2 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.xaropeSulfatoFerroso?.entrega3 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.xaropeSulfatoFerroso?.entrega4 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.xaropeSulfatoFerroso?.entrega5 || 0 }}
              </td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>
                {{ dados.gestantes?.comprimidoSulfatoFerroso?.entrega1 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoSulfatoFerroso?.entrega2 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoSulfatoFerroso?.entrega3 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoSulfatoFerroso?.entrega4 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoSulfatoFerroso?.entrega5 || 0 }}
              </td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td>
                {{ dados.gestantes?.comprimidoAcidoFolico?.entrega1 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoAcidoFolico?.entrega2 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoAcidoFolico?.entrega3 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoAcidoFolico?.entrega4 || 0 }}
              </td>
              <td>
                {{ dados.gestantes?.comprimidoAcidoFolico?.entrega5 || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>3- MULHERES ATÉ O 3º MÊS PÓS-PARTO E O 3º MÊS PÓS-ABORTO</h3>
        <table>
          <thead>
            <tr>
              <th rowspan="2">Tipo de Suplemento</th>
              <th colspan="3">Quantidade de Entregas</th>
            </tr>
            <tr>
              <th>1ª</th>
              <th>2ª</th>
              <th>3ª</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>
                {{ dados.puerperas?.xaropeSulfatoFerroso?.entrega1 || 0 }}
              </td>
              <td>
                {{ dados.puerperas?.xaropeSulfatoFerroso?.entrega2 || 0 }}
              </td>
              <td>
                {{ dados.puerperas?.xaropeSulfatoFerroso?.entrega3 || 0 }}
              </td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>
                {{ dados.puerperas?.comprimidoSulfatoFerroso?.entrega1 || 0 }}
              </td>
              <td>
                {{ dados.puerperas?.comprimidoSulfatoFerroso?.entrega2 || 0 }}
              </td>
              <td>
                {{ dados.puerperas?.comprimidoSulfatoFerroso?.entrega3 || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>Controle de Perdas:</h3>
        <table>
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>Vencimento</th>
              <th>Extravio</th>
              <th>Danificação</th>
              <th>Outros</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dados.perdas?.xaropeSulfatoFerroso?.vencimento || 0 }}</td>
              <td>{{ dados.perdas?.xaropeSulfatoFerroso?.extravio || 0 }}</td>
              <td>
                {{ dados.perdas?.xaropeSulfatoFerroso?.danificacao || 0 }}
              </td>
              <td>{{ dados.perdas?.xaropeSulfatoFerroso?.outros || 0 }}</td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>
                {{ dados.perdas?.comprimidoSulfatoFerroso?.vencimento || 0 }}
              </td>
              <td>
                {{ dados.perdas?.comprimidoSulfatoFerroso?.extravio || 0 }}
              </td>
              <td>
                {{ dados.perdas?.comprimidoSulfatoFerroso?.danificacao || 0 }}
              </td>
              <td>{{ dados.perdas?.comprimidoSulfatoFerroso?.outros || 0 }}</td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td>
                {{ dados.perdas?.comprimidoAcidoFolico?.vencimento || 0 }}
              </td>
              <td>{{ dados.perdas?.comprimidoAcidoFolico?.extravio || 0 }}</td>
              <td>
                {{ dados.perdas?.comprimidoAcidoFolico?.danificacao || 0 }}
              </td>
              <td>{{ dados.perdas?.comprimidoAcidoFolico?.outros || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="print-footer">
        <p>Gerado em: {{ new Date().toLocaleString("pt-BR") }}</p>
      </footer>
    </div>
    <div v-else>Carregando dados para impressão...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue"; // ✅ CORREÇÃO: usa defineProps
import { suplementosService } from "@/services/suplementosService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-vue-next";

// ✅ CORREÇÃO: Recebendo parâmetros da rota como props
const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

const dados = ref(null);
const nomeUbs = ref("");
const nomeEquipe = ref("");

const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};

const imprimirPagina = () => {
  window.print();
};

onMounted(async () => {
  const documentoId = `${props.competencia}_${props.equipeId}`;
  dados.value = await suplementosService.getDadosCompetencia(documentoId);

  if (props.equipeId) {
    const equipeDoc = await getDoc(doc(db, "equipes", props.equipeId));
    if (equipeDoc.exists()) {
      nomeEquipe.value = equipeDoc.data().nome;
      const ubsId = equipeDoc.data().ubsId;
      if (ubsId) {
        const ubsDoc = await getDoc(doc(db, "ubs", ubsId));
        if (ubsDoc.exists()) nomeUbs.value = ubsDoc.data().nome;
      }
    }
  }
});
</script>

<style scoped>
/* Estilos inalterados */
.print-container {
  font-family: Arial, sans-serif;
  color: #000;
  background-color: #fff;
}
.print-actions {
  padding: 1rem;
  text-align: right;
}
.print-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}
.report-content {
  padding: 0 2rem 2rem 2rem;
}
.print-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
  gap: 20px;
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
}
.logo-prefeitura {
  width: 80px;
  height: auto;
}
.header-text h2 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}
.header-text p {
  margin: 0;
  font-size: 1rem;
}
h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}
th,
td {
  border: 1px solid #000;
  padding: 4px;
  text-align: center;
}
th {
  background-color: #eee;
}
.print-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 9pt;
}

@media print {
  body {
    background-color: #fff;
  }
  .print-actions {
    display: none;
  }
  .report-content {
    padding: 0;
  }
  @page {
    size: A4;
    margin: 2cm;
  }
}
</style>
