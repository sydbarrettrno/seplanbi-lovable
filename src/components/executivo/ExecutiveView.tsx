import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Inbox,
  Layers,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import brasao from "@/assets/brasao-itapoa.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHidratado } from "@/components/painel/primitives";
import { MESES_2026, PERIODOS, ATUALIZADO_EM, calcular } from "@/data/executivo";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("pt-BR");
const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;

/* ---------------------------------- KPI ---------------------------------- */

function Sparkline({ dados, cor }: { dados: number[]; cor: string }) {
  const hidratado = useHidratado();
  const pontos = dados.map((v, i) => ({ i, v }));
  if (!hidratado) return <Skeleton className="h-10 w-full" />;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pontos} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${cor.replace(/[^a-z]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={cor}
            strokeWidth={2}
            fill={`url(#spark-${cor.replace(/[^a-z]/g, "")})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiGrande({
  icone,
  titulo,
  valor,
  sufixo,
  variacao,
  variacaoBoaSeSobe = true,
  serie,
  cor,
  destaque,
  tooltip,
}: {
  icone: ReactNode;
  titulo: string;
  valor: string;
  sufixo?: string;
  variacao?: number;
  variacaoBoaSeSobe?: boolean;
  serie: number[];
  cor: string;
  destaque?: "positivo" | "critico";
  tooltip: string;
}) {
  const sobe = (variacao ?? 0) >= 0;
  const bom = variacaoBoaSeSobe ? sobe : !sobe;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <article
          className={cn(
            "group cursor-default rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_16px_32px_-14px_rgba(16,24,40,0.28)]",
            destaque === "positivo" && "ring-1 ring-positivo/30",
            destaque === "critico" && "ring-1 ring-critico/30",
          )}
        >
          <header className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">{titulo}</span>
            <span
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${cor} 12%, transparent)`, color: cor }}
            >
              {icone}
            </span>
          </header>

          <div className="mt-3 flex items-end gap-2">
            <span
              className={cn(
                "numero-grande text-[2.6rem] leading-none font-semibold tracking-tight",
                destaque === "positivo"
                  ? "text-positivo"
                  : destaque === "critico"
                    ? "text-critico"
                    : "text-foreground",
              )}
            >
              {valor}
            </span>
            {sufixo ? (
              <span className="pb-1 text-sm font-medium text-muted-foreground">{sufixo}</span>
            ) : null}
          </div>

          {variacao !== undefined ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-sm font-semibold tabular",
                bom ? "text-positivo" : "text-critico",
              )}
            >
              {sobe ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {pct(variacao)}
            </p>
          ) : (
            <p className="mt-2 h-5" />
          )}

          <div className="mt-2">
            <Sparkline dados={serie} cor={cor} />
          </div>
        </article>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs leading-relaxed">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

/* --------------------------------- Gauge --------------------------------- */

function Gauge({ valor }: { valor: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const cor = valor >= 80 ? "var(--positivo)" : valor >= 60 ? "var(--atencao)" : "var(--critico)";
  return (
    <div className="relative mx-auto size-[132px]">
      <svg viewBox="0 0 132 132" className="size-full -rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(valor / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="numero-grande text-3xl font-semibold text-foreground">{valor}%</span>
        <span className="text-[11px] text-muted-foreground">no prazo</span>
      </div>
    </div>
  );
}

/* ---------------------------------- View --------------------------------- */

export function ExecutiveView() {
  const [periodoId, setPeriodoId] = useState(PERIODOS[0]!.id);
  const periodo = PERIODOS.find((p) => p.id === periodoId) ?? PERIODOS[0]!;
  const d = calcular(periodo);
  const hidratado = useHidratado();

  const serieEntradas = MESES_2026.map((m) => m.entradas);
  const serieSaidas = MESES_2026.map((m) => m.saidas);
  const serieSaldoSpark = MESES_2026.map((m) => m.entradas - m.saidas);
  const serieEstoque = MESES_2026.map((m, i) =>
    MESES_2026.slice(0, i + 1).reduce((a, x) => a + x.entradas - x.saidas, 1553),
  );
  const serieTempo = MESES_2026.map((m) => m.tempoMedio);

  const alertas = [
    { texto: "Processos com prazo vencido", valor: "18,7%", tom: "critico" as const },
    { texto: "Tempo médio acima da meta (45 dias)", valor: `${d.tempoMedio} dias`, tom: "atencao" as const },
    { texto: "Áreas com estoque acima do planejado", valor: "3", tom: "atencao" as const },
  ];

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen bg-background">
        {/* Header fixo */}
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <img
                src={brasao}
                alt="Brasão do Município de Itapoá"
                width={512}
                height={512}
                className="size-11 object-contain"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  SEPLAN <span className="text-border">|</span> Gestão por Resultados
                </p>
                <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Painel Executivo 2026
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={periodoId} onValueChange={setPeriodoId}>
                <SelectTrigger className="h-9 w-[210px] rounded-xl bg-surface text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="h-9 gap-1.5 rounded-xl border border-positivo/25 bg-positivo/10 px-3 text-xs font-semibold text-positivo hover:bg-positivo/10">
                    <CheckCircle2 className="size-3.5" />
                    Dados Atualizados
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Base atualizada em {ATUALIZADO_EM}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl">
                    <Filter className="size-4" />
                    Filtros
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Filtros por área e tipo de demanda</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1680px] space-y-6 px-5 py-6 sm:px-8">
          {/* KPIs */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiGrande
              icone={<Inbox className="size-4" />}
              titulo="Recebidos"
              valor={nf.format(d.recebidos)}
              variacao={d.variacao.recebidos}
              serie={serieEntradas}
              cor="var(--serie-entrada)"
              tooltip="Demandas protocoladas no período selecionado."
            />
            <KpiGrande
              icone={<CheckCircle2 className="size-4" />}
              titulo="Finalizados"
              valor={nf.format(d.finalizados)}
              variacao={d.variacao.finalizados}
              serie={serieSaidas}
              cor="var(--positivo)"
              tooltip="Demandas encerradas no período selecionado."
            />
            <KpiGrande
              icone={<Scale className="size-4" />}
              titulo="Saldo do Período"
              valor={`${d.saldo > 0 ? "+" : ""}${nf.format(d.saldo)}`}
              variacao={d.variacao.saldo}
              serie={serieSaldoSpark}
              cor="var(--positivo)"
              destaque="positivo"
              tooltip="Diferença entre o que entrou e o que foi finalizado no período."
            />
            <KpiGrande
              icone={<Layers className="size-4" />}
              titulo="Estoque Atual"
              valor={nf.format(d.estoque)}
              variacao={d.variacao.estoque}
              variacaoBoaSeSobe={false}
              serie={serieEstoque}
              cor="var(--serie-entrada)"
              tooltip="Demandas em andamento na data da atualização."
            />
            <KpiGrande
              icone={<Clock className="size-4" />}
              titulo="Tempo Médio"
              valor={String(d.tempoMedio)}
              sufixo="dias"
              variacao={d.variacao.tempoMedio}
              variacaoBoaSeSobe={false}
              serie={serieTempo}
              cor="var(--atencao)"
              tooltip="Média de dias entre a abertura e a finalização."
            />
          </section>

          {/* Gráfico + Pontos de atenção */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.9fr_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.18)]">
              <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Evolução Mensal – Entradas x Saídas
                </h2>
                <span className="text-xs text-muted-foreground">{periodo.rotulo}</span>
              </header>

              {hidratado ? (
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d.serieSaldo} margin={{ top: 18, right: 12, bottom: 0, left: -14 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RTooltip
                        cursor={{ fill: "color-mix(in oklab, var(--muted) 60%, transparent)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                          background: "var(--surface)",
                        }}
                        formatter={(v, n) => [
                          nf.format(Number(v)),
                          n === "entradas" ? "Entradas" : n === "saidas" ? "Saídas" : "Saldo acumulado",
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                        formatter={(n) =>
                          n === "entradas" ? "Entradas" : n === "saidas" ? "Saídas" : "Saldo acumulado"
                        }
                      />
                      <Bar dataKey="entradas" fill="var(--serie-entrada)" radius={[6, 6, 0, 0]} maxBarSize={46} isAnimationActive={false}>
                        <LabelList dataKey="entradas" position="top" fontSize={11} fill="var(--muted-foreground)" formatter={(v: number) => nf.format(v)} />
                      </Bar>
                      <Bar dataKey="saidas" fill="var(--positivo)" radius={[6, 6, 0, 0]} maxBarSize={46} isAnimationActive={false}>
                        <LabelList dataKey="saidas" position="top" fontSize={11} fill="var(--muted-foreground)" formatter={(v: number) => nf.format(v)} />
                      </Bar>
                      <Line
                        type="monotone"
                        dataKey="acumulado"
                        stroke="var(--atencao)"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "var(--atencao)" }}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Skeleton className="h-[360px] w-full" />
              )}
            </div>

            <aside className="space-y-4">
              <h2 className="px-1 text-base font-semibold tracking-tight text-foreground">
                Pontos de Atenção
              </h2>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default rounded-2xl border border-critico/25 bg-critico/[0.07] p-5 shadow-[0_8px_24px_-16px_rgba(16,24,40,0.3)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="numero-grande text-[3rem] leading-none font-semibold text-critico">
                          70,9%
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          Processos parados há mais de 30 dias
                        </p>
                      </div>
                      <AlertTriangle className="mt-1 size-6 shrink-0 text-critico" />
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-positivo tabular">
                      <TrendingDown className="size-4" /> {pct(d.variacao.parados)} vs. período anterior
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-xs">
                  Percentual do estoque sem movimentação registrada há mais de 30 dias.
                </TooltipContent>
              </Tooltip>

              <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_-16px_rgba(16,24,40,0.25)]">
                <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
                  Concluídos no prazo
                </p>
                <Gauge valor={d.prazo} />
                <p className="mt-2 text-center text-xs text-muted-foreground">Meta: 85%</p>
              </div>

              <ul className="space-y-2">
                {alertas.map((a) => (
                  <li
                    key={a.texto}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border bg-surface px-4 py-3 transition-colors",
                      a.tom === "critico"
                        ? "border-critico/25 hover:bg-critico/[0.05]"
                        : "border-atencao/30 hover:bg-atencao/[0.06]",
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <AlertTriangle
                        className={cn(
                          "size-4 shrink-0",
                          a.tom === "critico" ? "text-critico" : "text-atencao",
                        )}
                      />
                      {a.texto}
                    </span>
                    <span
                      className={cn(
                        "numero-grande shrink-0 text-lg font-semibold tabular",
                        a.tom === "critico" ? "text-critico" : "text-atencao",
                      )}
                    >
                      {a.valor}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <p className="pb-6 text-[11px] text-muted-foreground">
            Dados demonstrativos (DEMO) · atualização em {ATUALIZADO_EM}
          </p>
        </main>
      </div>
    </TooltipProvider>
  );
}
