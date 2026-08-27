import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/painel/AppShell";
import { SectionCard } from "@/components/painel/primitives";
import { ProcessTable } from "@/components/painel/ProcessTable";
import { Button } from "@/components/ui/button";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";
import { fmtInt } from "@/data/format";

export const Route = createFileRoute("/protocolos")({
  head: () => ({
    meta: [
      { title: "Explorador de protocolos — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Tabela analítica dos protocolos da SEPLAN Itapoá com filtros combinados, ordenação, paginação e exportação dos registros filtrados.",
      },
      { property: "og:title", content: "Explorador de protocolos — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Investigue os registros que compõem cada indicador do painel.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Explorador />
    </DashboardProvider>
  ),
});

type Escopo = "recebidos" | "concluidos" | "estoque";

const ESCOPOS: { chave: Escopo; rotulo: string }[] = [
  { chave: "recebidos", rotulo: "Recebidos no período" },
  { chave: "concluidos", rotulo: "Concluídos no período" },
  { chave: "estoque", rotulo: "Em estoque" },
];

function Explorador() {
  const { conjuntos } = useDashboard();
  const [escopo, setEscopo] = useState<Escopo>("recebidos");
  const protocolos = conjuntos[escopo];

  return (
    <AppShell
      titulo="Explorador de protocolos"
      subtitulo="Registros que sustentam cada indicador do painel"
    >
      <SectionCard
        titulo="Registros"
        descricao="A tabela reflete exatamente os filtros aplicados no painel."
        info="Escolha o conjunto analisado: entrada (recebidos), produção (concluídos) ou carga pendente (estoque). Idade é medida da abertura até a data de referência."
        acao={
          <div className="flex flex-wrap gap-1.5">
            {ESCOPOS.map((e) => (
              <Button
                key={e.chave}
                variant={escopo === e.chave ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setEscopo(e.chave)}
              >
                {e.rotulo}
                <span className="ml-1 tabular opacity-70">{fmtInt(conjuntos[e.chave].length)}</span>
              </Button>
            ))}
          </div>
        }
      >
        <ProcessTable protocolos={protocolos} />
      </SectionCard>
    </AppShell>
  );
}
