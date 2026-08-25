/**
 * ============================================================================
 * BASE DEMO — DADOS FICTÍCIOS PARA DESENVOLVIMENTO DE COMPONENTES
 * ============================================================================
 * Estes registros NÃO são dados reais da SEPLAN Itapoá. Existem apenas para
 * permitir o desenvolvimento e a validação dos componentes antes da conexão
 * com a base normalizada (ETL + classificação semântica).
 *
 * Para trocar a fonte de dados, substitua `getDataset()` em `src/data/source.ts`
 * por um carregador da base real. Nenhum componente lê este arquivo diretamente.
 * ============================================================================
 */

import type { Dataset, Protocolo } from "./types";

const CATEGORIAS = [
  "Alvará de Construção",
  "Habite-se",
  "Consulta de Viabilidade",
  "Certidão de Uso do Solo",
  "Aprovação de Loteamento",
  "Desmembramento / Unificação",
  "Licenciamento de Publicidade",
  "Numeração Predial",
  "Análise de Projeto Complementar",
  "Denúncia / Fiscalização Urbana",
] as const;

const SITUACOES = [
  "Concluído",
  "Encerrado",
  "Em análise",
  "Aguardando requerente",
  "Aguardando providência externa",
  "Tramitação administrativa",
] as const;

const SETORES = [
  "Análise de Projetos",
  "Aprovação Urbanística",
  "Fiscalização",
  "Protocolo / Triagem",
  "Geoprocessamento",
] as const;

const RESPONSAVEIS = [
  "A. Ribeiro",
  "C. Menezes",
  "D. Fogaça",
  "J. Prado",
  "L. Steiner",
  "M. Alonso",
  "R. Kruger",
] as const;

const REQUERENTES = [
  "Construtora Litoral Norte",
  "Incorporadora Baía Sul",
  "Pessoa Física",
  "Condomínio Praia Grande",
  "Comércio Central Ltda",
  "Associação de Moradores",
  "Engenharia Itapoá ME",
];

/** PRNG determinístico (mulberry32) para gerar sempre a mesma base DEMO */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REFERENCIA = "2026-08-25";
const HORA_ATUALIZACAO = "2026-08-25T07:30:00-03:00";

const PESO_CATEGORIA = [0.19, 0.12, 0.14, 0.09, 0.04, 0.07, 0.05, 0.08, 0.13, 0.09];

/** tempo mediano-alvo (dias) por categoria, apenas para dar realismo ao DEMO */
const TEMPO_BASE = [58, 34, 12, 16, 96, 44, 21, 6, 39, 27];

/** volume mensal aproximado de entrada (jan..dez) */
const VOLUME_2025 = [52, 58, 66, 61, 55, 47, 44, 49, 57, 64, 60, 41];
const VOLUME_2026 = [61, 69, 78, 74, 66, 58, 55, 40, 0, 0, 0, 0];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateIso: string, days: number) {
  const d = new Date(dateIso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

function pickWeighted(r: number, pesos: number[]) {
  let acc = 0;
  for (let i = 0; i < pesos.length; i++) {
    acc += pesos[i];
    if (r <= acc) return i;
  }
  return pesos.length - 1;
}

function buildProtocolos(): Protocolo[] {
  const random = rng(20260825);
  const out: Protocolo[] = [];
  let seq = 0;

  const anos: Array<[number, number[]]> = [
    [2025, VOLUME_2025],
    [2026, VOLUME_2026],
  ];

  for (const [ano, volumes] of anos) {
    for (let mes = 0; mes < 12; mes++) {
      const total = volumes[mes];
      for (let i = 0; i < total; i++) {
        const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
        const dia = 1 + Math.floor(random() * diasNoMes);
        const dataAbertura = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        if (dataAbertura > REFERENCIA) continue;

        const ci = pickWeighted(random(), PESO_CATEGORIA);
        const categoriaFinal = CATEGORIAS[ci];
        const setor = SETORES[Math.floor(random() * SETORES.length)];
        const responsavel = RESPONSAVEIS[Math.floor(random() * RESPONSAVEIS.length)];
        const requerente = REQUERENTES[Math.floor(random() * REQUERENTES.length)];

        // duração plausível em torno da mediana-alvo da categoria
        const jitter = 0.4 + random() * 1.9;
        const duracao = Math.max(1, Math.round(TEMPO_BASE[ci] * jitter));
        const dataPrevista = addDays(dataAbertura, duracao);

        const concluiu = dataPrevista <= REFERENCIA && random() < 0.82;

        let situacaoFinal: string;
        let dataConclusao: string | null = null;
        let ultimaMovimentacao: string | null;

        if (concluiu) {
          situacaoFinal = random() < 0.9 ? "Concluído" : "Encerrado";
          dataConclusao = dataPrevista;
          ultimaMovimentacao = dataPrevista;
        } else {
          const abertas = SITUACOES.slice(2);
          situacaoFinal = abertas[Math.floor(random() * abertas.length)];
          const decorrido = Math.max(
            0,
            Math.round(
              (new Date(REFERENCIA).getTime() - new Date(dataAbertura).getTime()) / 86400000,
            ),
          );
          const desde = Math.floor(random() * Math.max(1, decorrido));
          ultimaMovimentacao = random() < 0.94 ? addDays(dataAbertura, desde) : null;
        }

        seq += 1;
        out.push({
          id: `${ano}-${seq}`,
          protocolo: `${String(seq).padStart(5, "0")}/${ano}`,
          ano,
          dataAbertura,
          dataConclusao,
          ultimaMovimentacao,
          categoriaFinal,
          situacaoFinal,
          setor,
          responsavel,
          requerente,
          observacao: null,
        });
      }
    }
  }

  return out.sort((a, b) => a.dataAbertura.localeCompare(b.dataAbertura));
}

export const DEMO_DATASET: Dataset = {
  origem: "DEMO",
  atualizadoEm: HORA_ATUALIZACAO,
  dataReferencia: REFERENCIA,
  protocolos: buildProtocolos(),
  situacoesConclusivas: ["Concluído", "Encerrado"],
};
