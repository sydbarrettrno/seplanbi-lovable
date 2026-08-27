import { Link, createFileRoute } from "@tanstack/react-router";

import { AgingDistribution } from "@/components/painel/AgingDistribution";
import { AppShell } from "@/components/painel/AppShell";
import { CategoryRanking } from "@/components/painel/CategoryRanking";
import { KpiRow } from "@/components/painel/KpiRow";
import { MonthlyFlowChart } from "@/components/painel/MonthlyFlowChart";
import { SectorPerformance } from "@/components/painel/SectorPerformance";
import { StatusDistribution } from "@/components/painel/StatusDistribution";
import { TimeByCategory } from "@/components/painel/TimeByCategory";
import { Button } from "@/components/ui/button";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel Executivo SEPLAN Itapoá — Demanda, produção e estoque" },
      {
        name: "description",
        content:
          "Painel executivo da Secretaria de Planejamento Urbano de Itapoá/SC: demanda recebida, produção, estoque de processos e tempo de atendimento com rastreabilidade até o protocolo.",
      },
      { property: "og:title", content: "Painel Executivo SEPLAN Itapoá" },
      {
        property: "og:description",
        content:
          "Demanda, produção, estoque e tempo de atendimento da SEPLAN Itapoá em um painel analítico rastreável.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <VisaoExecutiva />
    </DashboardProvider>
  ),
});

function VisaoExecutiva() {
  const { conjuntos, conjuntosAnteriores } = useDashboard();

  return (
    <AppShell
      titulo="Painel Executivo"
      subtitulo="Demanda, produção, estoque e tempo de atendimento"
    >
      <KpiRow />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthlyFlowChart />
        </div>
        <StatusDistribution />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <CategoryRanking
          titulo="Principais demandas"
          descricao="Categorias com maior volume de entrada no período."
          info="Volume de protocolos recebidos por categoria final. 'ant.' indica o período equivalente do ano anterior, quando disponível."
          base={conjuntos.recebidos}
          anteriores={conjuntosAnteriores?.recebidos}
          tom="entrada"
        />
        <AgingDistribution />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <TimeByCategory />
        <SectorPerformance />
      </div>

      <div className="painel-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Quais protocolos formam esses números?
          </h2>
          <p className="text-xs text-muted-foreground">
            O explorador reflete exatamente os filtros aplicados neste painel.
          </p>
        </div>
        <Button asChild size="sm" className="text-xs">
          <Link to="/protocolos">Ver protocolos</Link>
        </Button>
      </div>
    </AppShell>
  );
}
