import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/painel/AppShell";
import { CategoryRanking } from "@/components/painel/CategoryRanking";
import { KpiRow } from "@/components/painel/KpiRow";
import { MonthlyFlowChart } from "@/components/painel/MonthlyFlowChart";
import { SectionCard } from "@/components/painel/primitives";
import { ProcessTable } from "@/components/painel/ProcessTable";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";

export const Route = createFileRoute("/demanda")({
  head: () => ({
    meta: [
      { title: "Demanda recebida — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Análise da entrada de protocolos na SEPLAN Itapoá: evolução mensal, categorias com maior volume e comparação com o período equivalente anterior.",
      },
      { property: "og:title", content: "Demanda recebida — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Entrada de protocolos por mês, categoria e período comparável.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Demanda />
    </DashboardProvider>
  ),
});

function Demanda() {
  const { conjuntos, conjuntosAnteriores } = useDashboard();

  return (
    <AppShell titulo="Demanda" subtitulo="Análise das entradas de protocolos">
      <KpiRow />
      <MonthlyFlowChart />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <CategoryRanking
          titulo="Demanda por categoria"
          descricao="Volume de entrada por categoria final."
          base={conjuntos.recebidos}
          anteriores={conjuntosAnteriores?.recebidos}
          limite={12}
        />
        <CategoryRanking
          titulo="Demanda por setor de destino"
          descricao="Distribuição da entrada entre os setores."
          base={conjuntos.recebidos}
          limite={12}
          tom="neutro"
        />
      </div>
      <SectionCard
        titulo="Protocolos recebidos no período"
        descricao="Registros que compõem o indicador de demanda."
      >
        <ProcessTable protocolos={conjuntos.recebidos} />
      </SectionCard>
    </AppShell>
  );
}
