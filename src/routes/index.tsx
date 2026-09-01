import { createFileRoute } from "@tanstack/react-router";

import { ExecutiveView } from "@/components/executivo/ExecutiveView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel Executivo 2026 — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Gestão por Resultados da Secretaria de Planejamento de Itapoá/SC: demanda, produção, estoque e prazos em um painel executivo.",
      },
      { property: "og:title", content: "Painel Executivo 2026 — SEPLAN Itapoá" },
      {
        property: "og:description",
        content:
          "Indicadores de demanda, produção, estoque e prazos da SEPLAN Itapoá em tempo de leitura de segundos.",
      },
    ],
  }),
  component: ExecutiveView,
});
