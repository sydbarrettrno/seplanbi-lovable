import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { getDataset } from "./source";
import {
  anosDisponiveis,
  calcularKpis,
  construirConjuntos,
  periodoEquivalenteAnterior,
  valoresUnicos,
  type Conjuntos,
  type Kpis,
} from "./metrics";
import { FILTROS_INICIAIS, type Dataset, type Filtros, type Protocolo } from "./types";

export type DetalheDrawer = {
  titulo: string;
  subtitulo?: string;
  definicao?: string;
  protocolos: Protocolo[];
  /** distribuição opcional apresentada antes dos registros */
  distribuicao?: { rotulo: string; valor: number }[];
};

type Ctx = {
  dataset: Dataset;
  filtros: Filtros;
  setFiltro: <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => void;
  limparFiltros: () => void;
  filtrosAtivos: { chave: keyof Filtros; rotulo: string }[];
  conjuntos: Conjuntos;
  conjuntosAnteriores: Conjuntos | null;
  kpis: Kpis;
  opcoes: {
    anos: number[];
    categorias: string[];
    situacoes: string[];
    setores: string[];
    responsaveis: string[];
  };
  detalhe: DetalheDrawer | null;
  abrirDetalhe: (d: DetalheDrawer) => void;
  fecharDetalhe: () => void;
};

const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const dataset = useMemo(() => getDataset(), []);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [detalhe, setDetalhe] = useState<DetalheDrawer | null>(null);

  const setFiltro = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) =>
    setFiltros((prev) => ({ ...prev, [chave]: valor, ...(chave === "ano" ? { mes: null } : {}) }));

  const conjuntos = useMemo(() => construirConjuntos(dataset, filtros), [dataset, filtros]);
  const kpis = useMemo(() => calcularKpis(dataset, filtros), [dataset, filtros]);

  const conjuntosAnteriores = useMemo(() => {
    const anterior = periodoEquivalenteAnterior(conjuntos.periodo);
    if (!anterior) return null;
    const ano = Number(anterior.inicio.slice(0, 4));
    if (!anosDisponiveis(dataset).includes(ano)) return null;
    return construirConjuntos(dataset, { ...filtros, ano, mes: filtros.mes });
  }, [dataset, filtros, conjuntos.periodo]);

  const opcoes = useMemo(
    () => ({
      anos: anosDisponiveis(dataset),
      categorias: valoresUnicos(dataset, "categoriaFinal"),
      situacoes: valoresUnicos(dataset, "situacaoFinal"),
      setores: valoresUnicos(dataset, "setor"),
      responsaveis: valoresUnicos(dataset, "responsavel"),
    }),
    [dataset],
  );

  const filtrosAtivos = useMemo(() => {
    const lista: { chave: keyof Filtros; rotulo: string }[] = [];
    if (filtros.ano !== "todos") lista.push({ chave: "ano", rotulo: `Ano: ${filtros.ano}` });
    if (filtros.mes) lista.push({ chave: "mes", rotulo: `Mês: ${String(filtros.mes).padStart(2, "0")}` });
    if (filtros.categoria) lista.push({ chave: "categoria", rotulo: `Categoria: ${filtros.categoria}` });
    if (filtros.situacao) lista.push({ chave: "situacao", rotulo: `Situação: ${filtros.situacao}` });
    if (filtros.setor) lista.push({ chave: "setor", rotulo: `Setor: ${filtros.setor}` });
    if (filtros.responsavel) lista.push({ chave: "responsavel", rotulo: `Responsável: ${filtros.responsavel}` });
    if (filtros.busca.trim()) lista.push({ chave: "busca", rotulo: `Busca: ${filtros.busca}` });
    return lista;
  }, [filtros]);

  const value: Ctx = {
    dataset,
    filtros,
    setFiltro,
    limparFiltros: () => setFiltros(FILTROS_INICIAIS),
    filtrosAtivos,
    conjuntos,
    conjuntosAnteriores,
    kpis,
    opcoes,
    detalhe,
    abrirDetalhe: setDetalhe,
    fecharDetalhe: () => setDetalhe(null),
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard deve ser usado dentro de DashboardProvider");
  return ctx;
}
