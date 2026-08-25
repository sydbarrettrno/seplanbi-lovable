/**
 * Camada de dados — contratos.
 *
 * O frontend NUNCA classifica protocolos. Consome apenas os campos finais
 * normalizados produzidos pelo ETL/classificação semântica.
 */

export type Protocolo = {
  /** identificador interno */
  id: string;
  /** número/ano do protocolo, ex.: "01234/2026" */
  protocolo: string;
  ano: number;
  /** ISO date (YYYY-MM-DD) */
  dataAbertura: string;
  /** ISO date ou null quando não concluído */
  dataConclusao: string | null;
  /** ISO date da última movimentação registrada; null quando ausente na base */
  ultimaMovimentacao: string | null;
  /** campo final normalizado */
  categoriaFinal: string;
  /** campo final normalizado */
  situacaoFinal: string;
  setor: string | null;
  responsavel: string | null;
  requerente: string | null;
  observacao: string | null;
};

export type Dataset = {
  /** origem dos dados — usado na interface para sinalizar base DEMO */
  origem: "DEMO" | "BASE";
  /** data/hora de referência dos dados (ISO) */
  atualizadoEm: string;
  /** data de referência para cálculo de estoque/idade (ISO date) */
  dataReferencia: string;
  protocolos: Protocolo[];
  /** situações finais consideradas conclusão de processo pelo ETL */
  situacoesConclusivas: string[];
};

export type Filtros = {
  ano: number | "todos";
  mes: number | null;
  categoria: string | null;
  situacao: string | null;
  setor: string | null;
  responsavel: string | null;
  busca: string;
};

export const FILTROS_INICIAIS: Filtros = {
  ano: "todos",
  mes: null,
  categoria: null,
  situacao: null,
  setor: null,
  responsavel: null,
  busca: "",
};
