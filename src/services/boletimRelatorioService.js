import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const boletimRelatorioService = {
  /**
   * ✅ FUNÇÃO RENOMEADA: Gera um relatório detalhado por equipe.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array>} - Dados consolidados para o relatório.
   */
  async gerarRelatorioPorEquipe(competencia) {
    if (!competencia) return [];

    const [boletinsSnapshot, equipesSnap, ubsSnap, testesSnap] =
      await Promise.all([
        getDocs(
          query(
            collection(db, "boletimDados"),
            where("competencia", "==", competencia)
          )
        ),
        getDocs(collection(db, "equipes")),
        getDocs(collection(db, "ubs")),
        getDocs(collection(db, "boletimTestes")),
      ]);

    if (boletinsSnapshot.empty) return [];

    const equipesMap = new Map(
      equipesSnap.docs.map((doc) => [doc.id, doc.data()])
    );
    const ubsMap = new Map(ubsSnap.docs.map((doc) => [doc.id, doc.data()]));
    const testesMap = new Map(
      testesSnap.docs.map((doc) => [doc.id, doc.data()])
    );

    const relatorio = [];
    boletinsSnapshot.forEach((doc) => {
      const dados = doc.data();
      const equipe = equipesMap.get(dados.equipeId);
      const ubs = ubsMap.get(dados.ubsId);
      if (!equipe || !ubs) return;

      for (const testeId in dados.testes) {
        const testeInfo = testesMap.get(testeId);
        if (!testeInfo) continue;

        for (const marcaId in dados.testes[testeId]) {
          const marcaInfo = testeInfo.marcas.find((m) => m.id === marcaId);
          const dadosMarca = dados.testes[testeId][marcaId];

          if (marcaInfo) {
            const totalRealizados =
              (dadosMarca.realizados.prenatal || 0) +
              (dadosMarca.realizados.mobilizacao || 0) +
              (dadosMarca.realizados.treinamentos || 0) +
              (dadosMarca.realizados.rotina || 0);
            const totalInvalidos = (dadosMarca.invalidos || []).reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            const totalPerdidos = (dadosMarca.perdidos || []).reduce(
              (acc, item) => acc + item.quantidade,
              0
            );

            relatorio.push({
              id: `${doc.id}-${testeId}-${marcaId}`,
              ubsNome: ubs.nome,
              equipeNome: equipe.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
              prenatal: dadosMarca.realizados.prenatal || 0,
              mobilizacao: dadosMarca.realizados.mobilizacao || 0,
              treinamento: dadosMarca.realizados.treinamentos || 0,
              rotina: dadosMarca.realizados.rotina || 0,
              total: totalRealizados,
              reagentes: dadosMarca.reagentes || 0,
              invalidos: totalInvalidos,
              perdidos: totalPerdidos,
              status: dados.finalizados?.[testeId] ? "Finalizado" : "Parcial",
            });
          }
        }
      }
    });
    return relatorio;
  },

  /**
   * ✅ NOVA FUNÇÃO: Agrega os dados de todas as equipes em um consolidado geral.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array>} - Dados agregados por teste e marca.
   */
  async gerarRelatorioGeral(competencia) {
    const relatorioPorEquipe = await this.gerarRelatorioPorEquipe(competencia);
    if (!relatorioPorEquipe.length) return [];

    const consolidado = new Map();

    relatorioPorEquipe.forEach((item) => {
      const key = `${item.testeNome}-${item.marcaNome}`;
      if (!consolidado.has(key)) {
        consolidado.set(key, {
          testeNome: item.testeNome,
          marcaNome: item.marcaNome,
          prenatal: 0,
          mobilizacao: 0,
          treinamento: 0,
          rotina: 0,
          total: 0,
          reagentes: 0,
          invalidos: 0,
          perdidos: 0,
        });
      }

      const entry = consolidado.get(key);
      entry.prenatal += item.prenatal;
      entry.mobilizacao += item.mobilizacao;
      entry.treinamento += item.treinamento;
      entry.rotina += item.rotina;
      entry.total += item.total;
      entry.reagentes += item.reagentes;
      entry.invalidos += item.invalidos;
      entry.perdidos += item.perdidos;
    });

    return Array.from(consolidado.values());
  },

  async gerarRelatorioDetalhado(competencia) {
    if (!competencia) return [];

    const [boletinsSnapshot, equipesSnap, ubsSnap, testesSnap] =
      await Promise.all([
        getDocs(
          query(
            collection(db, "boletimDados"),
            where("competencia", "==", competencia)
          )
        ),
        getDocs(collection(db, "equipes")),
        getDocs(collection(db, "ubs")),
        getDocs(collection(db, "boletimTestes")),
      ]);

    if (boletinsSnapshot.empty) return [];

    const equipesMap = new Map(
      equipesSnap.docs.map((doc) => [doc.id, doc.data()])
    );
    const ubsMap = new Map(ubsSnap.docs.map((doc) => [doc.id, doc.data()]));
    const testesMap = new Map(
      testesSnap.docs.map((doc) => [doc.id, doc.data()])
    );

    const relatorioDetalhado = [];
    boletinsSnapshot.forEach((doc) => {
      const dados = doc.data();
      const equipe = equipesMap.get(dados.equipeId);
      const ubs = ubsMap.get(dados.ubsId);
      if (!equipe || !ubs) return;

      for (const testeId in dados.testes) {
        const testeInfo = testesMap.get(testeId);
        if (!testeInfo) continue;

        for (const marcaId in dados.testes[testeId]) {
          const marcaInfo = testeInfo.marcas.find((m) => m.id === marcaId);
          const dadosMarca = dados.testes[testeId][marcaId];
          if (!marcaInfo) continue;

          (dadosMarca.invalidos || []).forEach((item, index) => {
            relatorioDetalhado.push({
              id: `${doc.id}-${testeId}-${marcaId}-inv-${index}`,
              ubsNome: ubs.nome,
              equipeNome: equipe.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
              tipo: "Inválido",
              quantidade: item.quantidade,
              lote: item.lote,
              motivo: "N/A",
              descricao: "N/A",
            });
          });

          (dadosMarca.perdidos || []).forEach((item, index) => {
            relatorioDetalhado.push({
              id: `${doc.id}-${testeId}-${marcaId}-per-${index}`,
              ubsNome: ubs.nome,
              equipeNome: equipe.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
              tipo: "Perda",
              quantidade: item.quantidade,
              lote: item.lote,
              motivo: item.motivo,
              descricao: item.descricao || "N/A",
            });
          });
        }
      }
    });
    return relatorioDetalhado;
  },
};
