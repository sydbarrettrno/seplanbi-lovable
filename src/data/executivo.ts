/**
 * Camada de dados da Visão Executiva.
 * DEMO: valores mockados para apresentação. Substituir por base real quando disponível.
 */

export type MesExecutivo = {
  mes: string;
  entradas: number;
  saidas: number;
  tempoMedio: number;
  prazo: number; // % concluídos no prazo
  parados: number; // % parados > 30 dias
};

export const ESTOQUE_ANTERIOR = 1553;

export const MESES_2026: MesExecutivo[] = [
  { mes: "Jan", entradas: 612, saidas: 470, tempoMedio: 58, prazo: 66, parados: 74.2 },
  { mes: "Fev", entradas: 578, saidas: 442, tempoMedio: 56, prazo: 68, parados: 73.1 },
  { mes: "Mar", entradas: 596, saidas: 468, tempoMedio: 55, prazo: 68, parados: 72.0 },
  { mes: "Abr", entradas: 545, saidas: 455, tempoMedio: 53, prazo: 70, parados: 71.4 },
  { mes: "Mai", entradas: 568, saidas: 458, tempoMedio: 52, prazo: 68, parados: 70.9 },
];

export type Periodo = { id: string; rotulo: string; inicio: number; fim: number };

export const PERIODOS: Periodo[] = [
  { id: "jan-mai", rotulo: "Jan/2026 – Mai/2026", inicio: 0, fim: 4 },
  { id: "1tri", rotulo: "1º trimestre 2026", inicio: 0, fim: 2 },
  { id: "abr-mai", rotulo: "Abr/2026 – Mai/2026", inicio: 3, fim: 4 },
  { id: "mai", rotulo: "Maio/2026", inicio: 4, fim: 4 },
];

export type Indicadores = {
  meses: MesExecutivo[];
  recebidos: number;
  finalizados: number;
  saldo: number;
  estoque: number;
  tempoMedio: number;
  prazo: number;
  parados: number;
  variacao: { recebidos: number; finalizados: number; saldo: number; estoque: number; tempoMedio: number; parados: number };
  serieSaldo: { mes: string; entradas: number; saidas: number; acumulado: number }[];
};

const soma = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const media = (ns: number[]) => (ns.length ? soma(ns) / ns.length : 0);

export function calcular(periodo: Periodo): Indicadores {
  const meses = MESES_2026.slice(periodo.inicio, periodo.fim + 1);
  const recebidos = soma(meses.map((m) => m.entradas));
  const finalizados = soma(meses.map((m) => m.saidas));
  const saldo = recebidos - finalizados;
  const anteriores = MESES_2026.slice(0, periodo.inicio);
  const estoque =
    ESTOQUE_ANTERIOR + soma(anteriores.map((m) => m.entradas - m.saidas)) + saldo;
  const ultimo = meses[meses.length - 1] ?? MESES_2026[MESES_2026.length - 1]!;

  let acumulado = 0;
  const serieSaldo = meses.map((m) => {
    acumulado += m.entradas - m.saidas;
    return { mes: `${m.mes}/26`, entradas: m.entradas, saidas: m.saidas, acumulado };
  });

  return {
    meses,
    recebidos,
    finalizados,
    saldo,
    estoque,
    tempoMedio: Math.round(media(meses.map((m) => m.tempoMedio))),
    prazo: Math.round(media(meses.map((m) => m.prazo))),
    parados: ultimo.parados,
    variacao: { recebidos: 2.1, finalizados: 0.8, saldo: 4.3, estoque: -1.6, tempoMedio: -3.7, parados: -1.4 },
    serieSaldo,
  };
}

export const ATUALIZADO_EM = "31/08/2026 18:40";
