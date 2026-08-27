import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/painel/AppShell";
import { KpiRow } from "@/components/painel/KpiRow";
import { SectorPerformance } from "@/components/painel/SectorPerformance";
import { StatusDistribution } from "@/components/painel/StatusDistribution";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";

export const Route = createFileRoute("/setores")({
  head: () => ({
    meta: [
      { title: "Setores e equipe — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Distribuição operacional do trabalho na SEPLAN Itapoá por setor e responsável: recebidos, concluídos, estoque, tempo mediano e processos antigos.",
      },
      { property: "og:title", content: "Setores e equipe — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Distribuição do volume de trabalho entre setores e responsáveis.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Setores />
    </DashboardProvider>
  ),
});

function Setores() {
  const { conjuntos } = useDashboard();

  return (
    <AppShell titulo="Setores / equipe" subtitulo="Distribuição operacional do trabalho">
      <KpiRow />
      <SectorPerformance campo="setor" titulo="Produção e estoque por setor" />
      <SectorPerformance campo="responsavel" titulo="Produção e estoque por responsável" />
      <StatusDistribution
        base={conjuntos.estoque}
        titulo="Situação dos processos em andamento"
        descricao="Permite diferenciar trabalho interno de espera por requerente ou providência externa."
      />
    </AppShell>
  );
}
