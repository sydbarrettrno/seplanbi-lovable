import { createFileRoute } from "@tanstack/react-router";

import { AgingDistribution } from "@/components/painel/AgingDistribution";
import { AppShell } from "@/components/painel/AppShell";
import { CategoryRanking } from "@/components/painel/CategoryRanking";
import { KpiRow } from "@/components/painel/KpiRow";
import { SectionCard } from "@/components/painel/primitives";
import { ProcessTable } from "@/components/painel/ProcessTable";
import { StatusDistribution } from "@/components/painel/StatusDistribution";
import { TimeByCategory } from "@/components/painel/TimeByCategory";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque e tempo de atendimento — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Processos pendentes da SEPLAN Itapoá: envelhecimento do estoque por faixa de idade, situação real dos processos e tempo de atendimento por categoria.",
      },
      { property: "og:title", content: "Estoque e tempo — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Envelhecimento do estoque, situações reais e tempos por tipo de demanda.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Estoque />
    </DashboardProvider>
  ),
});

function Estoque() {
  const { conjuntos } = useDashboard();

  return (
    <AppShell
      titulo="Estoque e tempo"
      subtitulo="Processos pendentes, envelhecimento e tempos de atendimento"
    >
      <KpiRow />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <AgingDistribution />
        <StatusDistribution />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <CategoryRanking
          titulo="Estoque por categoria"
          descricao="Onde a carga pendente está concentrada."
          info="Protocolos não concluídos na data de referência, agrupados pela categoria final."
          base={conjuntos.estoque}
          tom="atencao"
          limite={12}
        />
        <TimeByCategory limite={12} />
      </div>
      <SectionCard
        titulo="Protocolos em estoque"
        descricao="Registros pendentes na data de referência."
      >
        <ProcessTable protocolos={conjuntos.estoque} />
      </SectionCard>
    </AppShell>
  );
}
