import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState, SectionCard, useHidratado } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { MESES, MESES_CURTOS, fmtInt } from "@/data/format";
import { serieMensal } from "@/data/metrics";
import { Skeleton } from "@/components/ui/skeleton";

type Linha = {
  mes: number;
  rotuloMes: string;
  [k: string]: number | string;
};

export function MonthlyFlowChart() {
  const { dataset, filtros, setFiltro, opcoes } = useDashboard();
  const hidratado = useHidratado();

  const anos = filtros.ano === "todos" ? opcoes.anos : [filtros.ano];
  const series = anos.map((ano) => ({ ano, pontos: serieMensal(dataset, filtros, ano) }));

  const dados: Linha[] = MESES_CURTOS.map((rotuloMes, i) => {
    const linha: Linha = { mes: i + 1, rotuloMes };
    for (const s of series) {
      const ponto = s.pontos[i];
      if (ponto?.disponivel) {
        linha[`rec_${s.ano}`] = ponto.recebidos;
        linha[`con_${s.ano}`] = ponto.concluidos;
      }
    }
    return linha;
  });

  const total = dados.reduce(
    (acc, l) =>
      acc +
      Object.entries(l)
        .filter(([k]) => k.startsWith("rec_") || k.startsWith("con_"))
        .reduce((s, [, v]) => s + (typeof v === "number" ? v : 0), 0),
    0,
  );

  const tonsRecebidos = ["var(--serie-entrada)", "color-mix(in oklab, var(--serie-entrada) 45%, white)"];
  const tonsConcluidos = ["var(--serie-conclusao)", "color-mix(in oklab, var(--serie-conclusao) 45%, white)"];

  return (
    <SectionCard
      titulo="Entrada × Conclusão — evolução mensal"
      descricao="Recebidos (demanda) comparados a concluídos (produção). Clique em um mês para filtrar todo o painel."
      info="Recebidos: protocolos abertos no mês. Concluídos: protocolos com situação final conclusiva registrada no mês. Meses posteriores à data de referência não são exibidos."
      className="min-h-[380px]"
    >
      {total === 0 ? (
        <EmptyState />
      ) : !hidratado ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dados}
              margin={{ top: 4, right: 8, bottom: 0, left: -12 }}
              onClick={(state) => {
                const idx = state?.activeTooltipIndex;
                if (typeof idx !== "number") return;
                if (filtros.ano === "todos") return;
                setFiltro("mes", filtros.mes === idx + 1 ? null : idx + 1);
              }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="rotuloMes"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <RTooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--surface)",
                }}
                labelFormatter={(l) => {
                  const i = MESES_CURTOS.indexOf(String(l));
                  return i >= 0 ? MESES[i] : String(l);
                }}
                formatter={(value, name) => {
                  const nome = String(name);
                  const tipo = nome.startsWith("rec_") ? "Recebidos" : "Concluídos";
                  return [`${fmtInt(Number(value))} protocolos`, `${tipo} ${nome.slice(4)}`];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(name) => {
                  const nome = String(name);
                  return `${nome.startsWith("rec_") ? "Recebidos" : "Concluídos"} ${nome.slice(4)}`;
                }}
              />
              {series.map((s, i) => (
                <Bar
                  key={`rec_${s.ano}`}
                  dataKey={`rec_${s.ano}`}
                  fill={tonsRecebidos[i] ?? tonsRecebidos[0]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={22}
                />
              ))}
              {series.map((s, i) => (
                <Bar
                  key={`con_${s.ano}`}
                  dataKey={`con_${s.ano}`}
                  fill={tonsConcluidos[i] ?? tonsConcluidos[0]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={22}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {filtros.ano === "todos" ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Selecione um ano nos filtros para habilitar a seleção de mês.
        </p>
      ) : null}
    </SectionCard>
  );
}
