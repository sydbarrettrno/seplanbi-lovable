const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const SEM_DADO = "Dado não disponível na base.";

export function fmtInt(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return nf0.format(v);
}

export function fmtDias(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Number.isInteger(v) ? `${nf0.format(v)} dias` : `${nf1.format(v)} dias`;
}

export function fmtPct(v: number | null | undefined, comSinal = false) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const s = `${nf1.format(v)}%`;
  return comSinal && v > 0 ? `+${s}` : s;
}

export function fmtProtocolos(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${nf0.format(v)} ${v === 1 ? "protocolo" : "protocolos"}`;
}

export function fmtData(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function fmtDataHora(isoStr: string) {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
