import { db } from '@/nucleo/configuracao/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Busca documentos de uma coleção em lotes de 30 para contornar a limitação do Firestore.
 * @param {string} nomeColecao - O nome da coleção.
 * @param {Array<string>} ids - Array de IDs dos documentos a serem buscados.
 * @returns {Promise<Array<import("firebase/firestore").QueryDocumentSnapshot>>}
 */
const getDocsInChunks = async (nomeColecao, ids) => {
  if (!ids || ids.length === 0) return []
  const chunks = []
  for (let i = 0; i < ids.length; i += 30) {
    chunks.push(ids.slice(i, i + 30))
  }
  const promises = chunks.map((chunk) =>
    getDocs(query(collection(db, nomeColecao), where('__name__', 'in', chunk))),
  )
  const snapshots = await Promise.all(promises)
  return snapshots.flatMap((snapshot) => snapshot.docs)
}

/**
 * Serviço para gerar relatórios consolidados do boletim de testes rápidos.
 */
export const servicoRelatoriosBoletim = {
  /**
   * Busca e consolida todos os dados necessários para os relatórios de uma competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array<object>>} - Uma lista de itens de relatório detalhados por equipe.
   */
  async gerarRelatorioBasePorEquipe(competencia) {
    if (!competencia) return []

    // 1. Buscar todos os boletins da competência e os metadados de uma vez
    const [boletinsSnap, equipesSnap, ubsSnap, testesSnap] = await Promise.all([
      getDocs(query(collection(db, 'boletimDados'), where('competencia', '==', competencia))),
      getDocs(collection(db, 'equipes')),
      getDocs(collection(db, 'ubs')),
      getDocs(collection(db, 'boletimTestes')),
    ])

    if (boletinsSnap.empty) return []

    // 2. Mapear metadados para acesso rápido
    const equipesMap = new Map(equipesSnap.docs.map((d) => [d.id, d.data()]))
    const ubsMap = new Map(ubsSnap.docs.map((d) => [d.id, d.data()]))
    const testesMap = new Map(testesSnap.docs.map((d) => [d.id, d.data()]))

    // 3. Processar cada boletim para criar um relatório detalhado
    const relatorio = []
    boletinsSnap.forEach((doc) => {
      const dados = doc.data()
      const equipe = equipesMap.get(dados.equipeId)
      const ubs = ubsMap.get(dados.ubsId)

      if (!equipe || !ubs) return // Ignora dados órfãos

      for (const testeId in dados.testes) {
        const testeInfo = testesMap.get(testeId)
        if (!testeInfo) continue

        for (const marcaId in dados.testes[testeId]) {
          const marcaInfo = testeInfo.marcas.find((m) => m.id === marcaId)
          const dadosMarca = dados.testes[testeId][marcaId]
          if (!marcaInfo) continue

          const totalRealizados = Object.values(dadosMarca.realizados || {}).reduce(
            (a, b) => a + b,
            0,
          )
          const totalInvalidos = (dadosMarca.invalidos || []).reduce(
            (acc, item) => acc + (item.quantidade || 0),
            0,
          )
          const totalPerdidos = (dadosMarca.perdidos || []).reduce(
            (acc, item) => acc + (item.quantidade || 0),
            0,
          )

          relatorio.push({
            id: `${doc.id}-${testeId}-${marcaId}`,
            ubsNome: ubs.nome,
            equipeNome: equipe.nome,
            testeNome: testeInfo.nome,
            marcaNome: marcaInfo.nome,
            realizados: totalRealizados,
            reagentes: dadosMarca.reagentes || 0,
            invalidos: totalInvalidos,
            perdidos: totalPerdidos,
            detalhesPerdas: (dadosMarca.perdidos || []).map((p) => ({
              ...p,
              ubsNome: ubs.nome,
              equipeNome: equipe.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
            })),
            detalhesInvalidos: (dadosMarca.invalidos || []).map((i) => ({
              ...i,
              ubsNome: ubs.nome,
              equipeNome: equipe.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
            })),
          })
        }
      }
    })

    return relatorio.sort(
      (a, b) => a.ubsNome.localeCompare(b.ubsNome) || a.equipeNome.localeCompare(b.equipeNome),
    )
  },
}
