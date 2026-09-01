import { useId, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
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
import {
  ATUALIZADO_EM,
  ESTOQUE_ANTERIOR,
  MESES_2026,
  PERIODOS,
  calcular,
} from "@/data/executivo";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("pt-BR");
const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;

/* ---------------------------------- KPI ---------------------------------- */

function Sparkline({ dados, cor }: { dados: number[]; cor: string }) {
  const hidratado = useHidratado();
  const reactId = useId();
  const id = `spark-${reactId.split(":").join("")}`;
  const pontos = dados.map((v, i) => ({ i, v }));

  if (!hidratado) return <Skeleton className="h-10 w-full" />;

  return (
    <div className="h-10 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pontos} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={cor}
            strokeWidth={2}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiGrande({
  indice,
  icone,
  titulo,
  valor,
  sufixo,
  variacao,
  variacaoBoaSeSobe = true,
  serie,
  cor,
  destaque,
  explicacao,
  tooltip,
  periodoRotulo,
  to,
}: {
  indice: string;
  icone: ReactNode;
  titulo: string;
  valor: string;
  sufixo?: string;
  variacao?: number;
  variacaoBoaSeSobe?: boolean;
  serie: number[];
  cor: string;
  destaque?: "positivo" | "critico";
  explicacao: string;
  tooltip: string;
  periodoRotulo: string;
  to: "/demanda" | "/producao" | "/estoque";
}) {
  const sobe = (variacao ?? 0) >= 0;
  const bom = variacaoBoaSeSobe ? sobe : !sobe;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <article
          className={cn(
            "group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 pt-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(16,24,40,0.06),0_16px_32px_-14px_rgba(16,24,40,0.28)]",
            destaque === "positivo" && "ring-1 ring-positivo/30",
            destaque === "critico" && "ring-1 ring-critico/30",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: cor }} />

          <header className="flex min-h-8 items-start justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${cor} 12%, transparent)`, color: cor }}
              >
                {icone}
              </span>
              <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {indice} <span className="text-border">·</span> {titulo}
              </span>
            </span>

            {variacao !== undefined ? (
              <span
                className={cn(
                  "shrink-0 text-right text-[10px] font-semibold leading-tight tabular",
                  bom ? "text-positivo" : "text-critico",
                )}
              >
                <span className="flex items-center justify-end gap-0.5">
                  {sobe ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {pct(variacao)}
                </span>
                <span className="block pt-0.5 text-[8.5px] font-medium text-muted-foreground">
                  vs. período anterior
                </span>
              </span>
            ) : null}
          </header>

          <div className="mt-2 flex items-end gap-1.5">
            <span
              className={cn(
                "numero-grande text-[2.35rem] leading-none font-semibold tracking-tight",
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

          <p className="mt-1.5 min-h-8 text-[11.5px] leading-snug text-muted-foreground">
            {explicacao}
          </p>

          <div className="mt-auto pt-1">
            <Sparkline dados={serie} cor={cor} />
          </div>

          <footer className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
            <span className="truncate text-[10.5px] font-medium text-muted-foreground">
              {periodoRotulo}
            </span>
            <Link
              to={to}
              aria-label={`Ver detalhes de ${titulo}`}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ArrowRight className="size-4" />
            </Link>
          </footer>
        </article>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs leading-relaxed">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

/* ----------------------------- Tooltip fluxo ----------------------------- */

type FluxoPonto = {
  mes: string;
  entradas: number;
  saidas: number;
  acumulado: number;
};

type FluxoTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: FluxoPonto }>;
};

function FluxoTooltip({ active, payload }: FluxoTooltipProps) {
  const ponto = payload?.[0]?.payload;
  if (!active || !ponto) return null;

  const itens = [
    { rotulo: "Entradas", valor: ponto.entradas, cor: "var(--serie-entrada)" },
    { rotulo: "Saídas", valor: ponto.saidas, cor: "var(--positivo)" },
    { rotulo: "Saldo acumulado", valor: ponto.acumulado, cor: "var(--atencao)" },
  ];

  return (
    <div className="min-w-44 rounded-xl border border-border bg-surface p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-foreground">{ponto.mes}</p>
      <div className="space-y-1.5">
        {itens.map((item) => (
          <div key={item.rotulo} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: item.cor }} />
              {item.rotulo}
            </span>
            <span className="numero-grande font-semibold text-foreground">{nf.format(item.valor)}</span>
          </div>
        ))}
      </div>
    </div>
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

  const serieEntradas = d.meses.map((m) => m.entradas);
  const serieSaidas = d.meses.map((m) => m.saidas);
  const serieSaldoSpark = d.meses.map((m) => m.entradas - m.saidas);
  const serieTempo = d.meses.map((m) => m.tempoMedio);

  const saldoAntesPeriodo = MESES_2026.slice(0, periodo.inicio).reduce(
    (total, mes) => total + mes.entradas - mes.saidas,
    0,
  );
  let estoqueCorrente = ESTOQUE_ANTERIOR + saldoAntesPeriodo;
  const serieEstoque = d.meses.map((mes) => {
    estoqueCorrente += mes.entradas - mes.saidas;
    return estoqueCorrente;
  });

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
              indice="01"
              icone={<Inbox className="size-4" />}
              titulo="Recebidos"
              valor={nf.format(d.recebidos)}
              variacao={d.variacao.recebidos}
              serie={serieEntradas}
              cor="var(--serie-entrada)"
              explicacao="Protocolos recebidos no período."
              tooltip="Demandas protocoladas no período selecionado. O mini gráfico usa as entradas mensais do mesmo período."
              periodoRotulo={periodo.rotulo}
              to="/demanda"
            />
            <KpiGrande
              indice="02"
              icone={<CheckCircle2 className="size-4" />}
              titulo="Finalizados"
              valor={nf.format(d.finalizados)}
              variacao={d.variacao.finalizados}
              serie={serieSaidas}
              cor="var(--positivo)"
              explicacao="Concluído + Encerrado no período."
              tooltip="Demandas finalizadas no período selecionado. O mini gráfico usa as saídas mensais do mesmo período."
              periodoRotulo={periodo.rotulo}
              to="/producao"
            />
            <KpiGrande
              indice="03"
              icone={<Scale className="size-4" />}
              titulo="Saldo do Período"
              valor={`${d.saldo > 0 ? "+" : ""}${nf.format(d.saldo)}`}
              variacao={d.variacao.saldo}
              serie={serieSaldoSpark}
              cor="var(--positivo)"
              destaque="positivo"
              explicacao="Recebidos − Finalizados no período."
              tooltip="Diferença mensal entre entradas e finalizações no período selecionado."
              periodoRotulo={periodo.rotulo}
              to="/producao"
            />
            <KpiGrande
              indice="04"
              icone={<Layers className="size-4" />}
              titulo="Estoque Atual"
              valor={nf.format(d.estoque)}
              variacao={d.variacao.estoque}
              variacaoBoaSeSobe={false}
              serie={serieEstoque}
              cor="var(--serie-entrada)"
              explicacao="Processos ainda em andamento na data."
              tooltip="Estoque acumulado mês a mês, considerando o saldo anterior ao início do período selecionado."
              periodoRotulo={periodo.rotulo}
              to="/estoque"
            />
            <KpiGrande
              indice="05"
              icone={<Clock className="size-4" />}
              titulo="Tempo Médio"
              valor={String(d.tempoMedio)}
              sufixo="dias"
              variacao={d.variacao.tempoMedio}
              variacaoBoaSeSobe={false}
              serie={serieTempo}
              cor="var(--atencao)"
              explicacao="Abertura → finalização no período."
              tooltip="Média de dias entre a abertura e a finalização. O mini gráfico acompanha o tempo médio mensal do período."
              periodoRotulo={periodo.rotulo}
              to="/estoque"
            />
          </section>

          {/* Gráfico + Pontos de atenção */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.9fr_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.18)]">
              <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--serie-entrada)]">
                    Fluxo mensal
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    Recebidos x Finalizados
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entradas e finalizações por mês, com saldo acumulado no período.
                  </p>
                </div>
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Mensal
                </span>
              </header>

              {hidratado ? (
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d.serieSaldo} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
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
                        content={<FluxoTooltip />}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={34}
                        wrapperStyle={{ fontSize: 12 }}
                        formatter={(n) =>
                          n === "entradas" ? "Entradas" : n === "saidas" ? "Saídas" : "Saldo acumulado"
                        }
                      />
                      <Bar
                        dataKey="entradas"
                        fill="var(--serie-entrada)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={46}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="entradas"
                          position="top"
                          fontSize={11}
                          fill="var(--muted-foreground)"
                          formatter={(v: number) => nf.format(v)}
                        />
                      </Bar>
                      <Bar
                        dataKey="saidas"
                        fill="var(--positivo)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={46}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="saidas"
                          position="top"
                          fontSize={11}
                          fill="var(--muted-foreground)"
                          formatter={(v: number) => nf.format(v)}
                        />
                      </Bar>
                      <Line
                        type="monotone"
                        dataKey="acumulado"
                        stroke="var(--atencao)"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "var(--atencao)" }}
                        activeDot={{ r: 5, fill: "var(--atencao)" }}
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
