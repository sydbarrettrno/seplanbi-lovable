/**
 * Camada única de transformação (indicadores).
 * Toda métrica possui aqui uma definição única e reutilizável.
 */

import type { Dataset, Filtros, Protocolo } from "./types";

export const FAIXAS_IDADE = [
  { rotulo: "0–7 dias", min: 0, max: 7 },
  { rotulo: "8–15 dias", min: 8, max: 15 },
  { rotulo: "16–30 dias", min: 16, max: 30 },
  { rotulo: "31–60 dias", min: 31, max: 60 },
  { rotulo: "61–90 dias", min: 61, max: 90 },
  { rotulo: "Acima de 90 dias", min: 91, max: Number.POSITIVE_INFINITY },
] as const;

export function diasEntre(aIso: string, bIso: string) {
  return Math.round(
    (new Date(bIso + "T00:00:00Z").getTime() - new Date(aIso + "T00:00:00Z").getTime()) / 86400000,
  );
}

export function mediana(valores: number[]): number | null {
  if (valores.length === 0) return null;
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? (v[meio] as number) : (((v[meio - 1] as number) + (v[meio] as number)) / 2);
}

export function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function percentil(valores: number[], p: number): number | null {
  if (valores.length === 0) return null;
  const v = [...valores].sort((a, b) => a - b);
  const idx = Math.min(v.length - 1, Math.max(0, Math.ceil((p / 100) * v.length) - 1));
  return v[idx] as number;
}

export function estaConcluido(p: Protocolo, ds: Dataset) {
  return ds.situacoesConclusivas.includes(p.situacaoFinal) && !!p.dataConclusao;
}

/** Aplica filtros de dimensão (categoria/situação/setor/responsável/busca). Não filtra período. */
function aplicaDimensoes(protocolos: Protocolo[], f: Filtros) {
  const busca = f.busca.trim().toLowerCase();
  return protocolos.filter((p) => {
    if (f.categoria && p.categoriaFinal !== f.categoria) return false;
    if (f.situacao && p.situacaoFinal !== f.situacao) return false;
    if (f.setor && p.setor !== f.setor) return false;
    if (f.responsavel && p.responsavel !== f.responsavel) return false;
    if (busca) {
      const alvo = `${p.protocolo} ${p.requerente ?? ""} ${p.categoriaFinal}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    return true;
  });
}

export type Periodo = { inicio: string; fim: string; rotulo: string; parcial: boolean };

/** Período selecionado a partir dos filtros de ano/mês, limitado à data de referência. */
export function periodoSelecionado(ds: Dataset, f: Filtros): Periodo {
  const ref = ds.dataReferencia;
  const anos = anosDisponiveis(ds);
  const anoMin = anos[0] ?? new Date(ref).getFullYear();
  const anoMax = anos[anos.length - 1] ?? anoMin;

  if (f.ano === "todos") {
    return {
      inicio: `${anoMin}-01-01`,
      fim: ref,
      rotulo: `${anoMin}–${anoMax}`,
      parcial: true,
    };
  }
  const ano = f.ano;
  if (f.mes !== null) {
    const ultimoDia = new Date(Date.UTC(ano, f.mes, 0)).getUTCDate();
    const inicio = `${ano}-${String(f.mes).padStart(2, "0")}-01`;
    const fimMes = `${ano}-${String(f.mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
    const fim = fimMes > ref ? ref : fimMes;
    return { inicio, fim, rotulo: `${String(f.mes).padStart(2, "0")}/${ano}`, parcial: fim < fimMes };
  }
  const fimAno = `${ano}-12-31`;
  const fim = fimAno > ref ? ref : fimAno;
  return { inicio: `${ano}-01-01`, fim, rotulo: String(ano), parcial: fim < fimAno };
}

/** Período equivalente do ano anterior (mesmos dias/meses). */
export function periodoEquivalenteAnterior(p: Periodo): Periodo | null {
  const anoInicio = Number(p.inicio.slice(0, 4));
  const anoFim = Number(p.fim.slice(0, 4));
  if (anoInicio !== anoFim) return null;
  const ano = anoInicio - 1;
  return {
    inicio: `${ano}${p.inicio.slice(4)}`,
    fim: `${ano}${p.fim.slice(4)}`,
    rotulo: p.rotulo.replace(String(anoInicio), String(ano)),
    parcial: p.parcial,
  };
}

export function anosDisponiveis(ds: Dataset) {
  return [...new Set(ds.protocolos.map((p) => p.ano))].sort();
}

export function valoresUnicos(ds: Dataset, campo: keyof Protocolo) {
  return [
    ...new Set(
      ds.protocolos.map((p) => p[campo]).filter((v): v is string => typeof v === "string" && !!v),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// ---------------------------------------------------------------------------
// Conjuntos base
// ---------------------------------------------------------------------------

export type Conjuntos = {
  /** demanda: protocolos abertos dentro do período */
  recebidos: Protocolo[];
  /** produção: protocolos concluídos dentro do período */
  concluidos: Protocolo[];
  /** estoque: não concluídos até a data de referência (independe do período de entrada) */
  estoque: Protocolo[];
  /** estoque cuja entrada é anterior ao período — passivo herdado */
  estoqueHerdado: Protocolo[];
  periodo: Periodo;
};

export function construirConjuntos(ds: Dataset, f: Filtros): Conjuntos {
  const periodo = periodoSelecionado(ds, f);
  const base = aplicaDimensoes(ds.protocolos, f);

  const recebidos = base.filter((p) => p.dataAbertura >= periodo.inicio && p.dataAbertura <= periodo.fim);
  const concluidos = base.filter(
    (p) => estaConcluido(p, ds) && p.dataConclusao! >= periodo.inicio && p.dataConclusao! <= periodo.fim,
  );
  const estoque = base.filter(
    (p) =>
      p.dataAbertura <= ds.dataReferencia &&
      (!estaConcluido(p, ds) || p.dataConclusao! > ds.dataReferencia),
  );
  const estoqueHerdado = estoque.filter((p) => p.dataAbertura < periodo.inicio);

  return { recebidos, concluidos, estoque, estoqueHerdado, periodo };
}

export function tempoAtendimento(p: Protocolo) {
  if (!p.dataConclusao) return null;
  return diasEntre(p.dataAbertura, p.dataConclusao);
}

export function idadeProtocolo(p: Protocolo, ref: string) {
  return diasEntre(p.dataAbertura, ref);
}

export function diasSemMovimentacao(p: Protocolo, ref: string) {
  if (!p.ultimaMovimentacao) return null;
  return diasEntre(p.ultimaMovimentacao, ref);
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export type Comparacao = {
  anterior: number | null;
  delta: number | null;
  pct: number | null;
  rotuloAnterior: string | null;
};

function comparacao(atual: number, anterior: number | null, rotulo: string | null): Comparacao {
  if (anterior === null) return { anterior: null, delta: null, pct: null, rotuloAnterior: null };
  const delta = atual - anterior;
  const pct = anterior === 0 ? null : (delta / anterior) * 100;
  return { anterior, delta, pct, rotuloAnterior: rotulo };
}

export type Kpis = {
  recebidos: { valor: number; comparacao: Comparacao };
  concluidos: { valor: number; comparacao: Comparacao };
  estoque: { valor: number; herdado: number };
  tempoMediano: { valor: number | null; mediaSecundaria: number | null; universo: number };
  parados30: { valor: number; semReferencia: number };
  periodo: Periodo;
};

export function calcularKpis(ds: Dataset, f: Filtros): Kpis {
  const c = construirConjuntos(ds, f);
  const anterior = periodoEquivalenteAnterior(c.periodo);
  const base = aplicaDimensoes(ds.protocolos, f);

  let recebidosAnt: number | null = null;
  let concluidosAnt: number | null = null;
  if (anterior && anosDisponiveis(ds).includes(Number(anterior.inicio.slice(0, 4)))) {
    recebidosAnt = base.filter(
      (p) => p.dataAbertura >= anterior.inicio && p.dataAbertura <= anterior.fim,
    ).length;
    concluidosAnt = base.filter(
      (p) =>
        estaConcluido(p, ds) &&
        p.dataConclusao! >= anterior.inicio &&
        p.dataConclusao! <= anterior.fim,
    ).length;
  }

  const tempos = c.concluidos.map(tempoAtendimento).filter((v): v is number => v !== null);

  const comMov = c.estoque.filter((p) => p.ultimaMovimentacao !== null);
  const parados = comMov.filter((p) => (diasSemMovimentacao(p, ds.dataReferencia) ?? 0) > 30);

  return {
    recebidos: {
      valor: c.recebidos.length,
      comparacao: comparacao(c.recebidos.length, recebidosAnt, anterior?.rotulo ?? null),
    },
    concluidos: {
      valor: c.concluidos.length,
      comparacao: comparacao(c.concluidos.length, concluidosAnt, anterior?.rotulo ?? null),
    },
    estoque: { valor: c.estoque.length, herdado: c.estoqueHerdado.length },
    tempoMediano: {
      valor: mediana(tempos),
      mediaSecundaria: media(tempos) === null ? null : Math.round((media(tempos) as number) * 10) / 10,
      universo: tempos.length,
    },
    parados30: { valor: parados.length, semReferencia: c.estoque.length - comMov.length },
    periodo: c.periodo,
  };
}

// ---------------------------------------------------------------------------
// Séries e distribuições
// ---------------------------------------------------------------------------

export type PontoMensal = {
  mes: number;
  rotulo: string;
  recebidos: number;
  concluidos: number;
  disponivel: boolean;
};

export function serieMensal(ds: Dataset, f: Filtros, ano: number): PontoMensal[] {
  const base = aplicaDimensoes(ds.protocolos, f);
  const ref = ds.dataReferencia;
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const prefixo = `${ano}-${String(mes).padStart(2, "0")}`;
    const disponivel = prefixo <= ref.slice(0, 7);
    return {
      mes,
      rotulo: prefixo,
      disponivel,
      recebidos: base.filter((p) => p.dataAbertura.startsWith(prefixo)).length,
      concluidos: base.filter((p) => estaConcluido(p, ds) && p.dataConclusao!.startsWith(prefixo))
        .length,
    };
  });
}

export type ItemRanking = {
  chave: string;
  quantidade: number;
  percentual: number;
  quantidadeAnterior: number | null;
};

export function ranking(
  protocolos: Protocolo[],
  campo: (p: Protocolo) => string | null,
  anteriores?: Protocolo[],
): ItemRanking[] {
  const contar = (arr: Protocolo[]) => {
    const m = new Map<string, number>();
    for (const p of arr) {
      const k = campo(p) ?? "Dado não disponível na base.";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const atual = contar(protocolos);
  const ant = anteriores ? contar(anteriores) : null;
  const total = protocolos.length;
  return [...atual.entries()]
    .map(([chave, quantidade]) => ({
      chave,
      quantidade,
      percentual: total ? (quantidade / total) * 100 : 0,
      quantidadeAnterior: ant ? (ant.get(chave) ?? 0) : null,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

export type FaixaIdade = {
  rotulo: string;
  min: number;
  max: number;
  quantidade: number;
  percentual: number;
  critica: boolean;
};

export function distribuicaoIdade(estoque: Protocolo[], ref: string): FaixaIdade[] {
  return FAIXAS_IDADE.map((faixa) => {
    const qtd = estoque.filter((p) => {
      const idade = idadeProtocolo(p, ref);
      return idade >= faixa.min && idade <= faixa.max;
    }).length;
    return {
      rotulo: faixa.rotulo,
      min: faixa.min,
      max: faixa.max === Number.POSITIVE_INFINITY ? 100000 : faixa.max,
      quantidade: qtd,
      percentual: estoque.length ? (qtd / estoque.length) * 100 : 0,
      critica: faixa.min >= 61,
    };
  });
}

export type TempoCategoria = {
  categoria: string;
  mediana: number | null;
  media: number | null;
  p90: number | null;
  universo: number;
};

export function tempoPorCategoria(concluidos: Protocolo[]): TempoCategoria[] {
  const m = new Map<string, number[]>();
  for (const p of concluidos) {
    const t = tempoAtendimento(p);
    if (t === null) continue;
    const arr = m.get(p.categoriaFinal) ?? [];
    arr.push(t);
    m.set(p.categoriaFinal, arr);
  }
  return [...m.entries()]
    .map(([categoria, valores]) => ({
      categoria,
      mediana: mediana(valores),
      media: media(valores) === null ? null : Math.round((media(valores) as number) * 10) / 10,
      p90: percentil(valores, 90),
      universo: valores.length,
    }))
    .sort((a, b) => (b.mediana ?? -1) - (a.mediana ?? -1));
}

export type LinhaSetor = {
  setor: string;
  recebidos: number;
  concluidos: number;
  estoque: number;
  tempoMediano: number | null;
  acima60: number;
  participacao: number;
};

export function desempenhoPorSetor(c: Conjuntos, ds: Dataset, campo: "setor" | "responsavel" = "setor"): LinhaSetor[] {
  const chaves = new Set<string>();
  const nome = (p: Protocolo) => p[campo] ?? "Dado não disponível na base.";
  for (const p of [...c.recebidos, ...c.concluidos, ...c.estoque]) chaves.add(nome(p));

  const totalRecebidos = c.recebidos.length;
  return [...chaves]
    .map((setor) => {
      const concl = c.concluidos.filter((p) => nome(p) === setor);
      const est = c.estoque.filter((p) => nome(p) === setor);
      const tempos = concl.map(tempoAtendimento).filter((v): v is number => v !== null);
      return {
        setor,
        recebidos: c.recebidos.filter((p) => nome(p) === setor).length,
        concluidos: concl.length,
        estoque: est.length,
        tempoMediano: mediana(tempos),
        acima60: est.filter((p) => idadeProtocolo(p, ds.dataReferencia) > 60).length,
        participacao: totalRecebidos
          ? (c.recebidos.filter((p) => nome(p) === setor).length / totalRecebidos) * 100
          : 0,
      };
    })
    .sort((a, b) => b.recebidos - a.recebidos);
}
