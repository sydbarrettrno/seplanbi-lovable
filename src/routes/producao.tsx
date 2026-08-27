import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/painel/AppShell";
import { CategoryRanking } from "@/components/painel/CategoryRanking";
import { KpiRow } from "@/components/painel/KpiRow";
import { MonthlyFlowChart } from "@/components/painel/MonthlyFlowChart";
import { SectionCard } from "@/components/painel/primitives";
import { ProcessTable } from "@/components/painel/ProcessTable";
import { TimeByCategory } from "@/components/painel/TimeByCategory";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";

export const Route = createFileRoute("/producao")({
  head: () => ({
    meta: [
      { title: "Produção realizada — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Produção da SEPLAN Itapoá: protocolos concluídos por mês e por categoria, tempos de atendimento e registros que compõem cada número.",
      },
      { property: "og:title", content: "Produção realizada — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Conclusões por mês e categoria, com tempo de atendimento por tipo de demanda.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Producao />
    </DashboardProvider>
  ),
});

function Producao() {
  const { conjuntos, conjuntosAnteriores } = useDashboard();

  return (
    <AppShell titulo="Produção" subtitulo="Análise das conclusões e da produtividade">
      <KpiRow />
      <MonthlyFlowChart />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <CategoryRanking
          titulo="Produção por categoria"
          descricao="Volume concluído por categoria final no período."
          base={conjuntos.concluidos}
          anteriores={conjuntosAnteriores?.concluidos}
          tom="conclusao"
          limite={12}
        />
        <TimeByCategory limite={12} />
      </div>
      <SectionCard
        titulo="Protocolos concluídos no período"
        descricao="Registros que compõem o indicador de produção."
      >
        <ProcessTable protocolos={conjuntos.concluidos} />
      </SectionCard>
    </AppShell>
  );
}
