import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/painel/AppShell";
import { KpiRow } from "@/components/painel/KpiRow";
import { EmptyState, SectionCard } from "@/components/painel/primitives";
import { DashboardProvider, useDashboard } from "@/data/dashboard-context";
import { fmtDias, fmtInt, fmtPct } from "@/data/format";
import { idadeProtocolo, mediana, tempoAtendimento } from "@/data/metrics";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias de serviço — SEPLAN Itapoá" },
      {
        name: "description",
        content:
          "Comparação por categoria final da SEPLAN Itapoá: entrada, produção, estoque, envelhecimento e tempo mediano de atendimento.",
      },
      { property: "og:title", content: "Categorias de serviço — SEPLAN Itapoá" },
      {
        property: "og:description",
        content: "Entrada, produção, estoque e tempo mediano de cada categoria de serviço.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <Categorias />
    </DashboardProvider>
  ),
});

function Categorias() {
  const { conjuntos, dataset, abrirDetalhe, setFiltro } = useDashboard();

  const categorias = [
    ...new Set(
      [...conjuntos.recebidos, ...conjuntos.concluidos, ...conjuntos.estoque].map(
        (p) => p.categoriaFinal,
      ),
    ),
  ];

  const linhas = categorias
    .map((categoria) => {
      const recebidos = conjuntos.recebidos.filter((p) => p.categoriaFinal === categoria);
      const concluidos = conjuntos.concluidos.filter((p) => p.categoriaFinal === categoria);
      const estoque = conjuntos.estoque.filter((p) => p.categoriaFinal === categoria);
      const tempos = concluidos.map(tempoAtendimento).filter((v): v is number => v !== null);
      return {
        categoria,
        recebidos: recebidos.length,
        concluidos: concluidos.length,
        estoque: estoque.length,
        acima60: estoque.filter((p) => idadeProtocolo(p, dataset.dataReferencia) > 60).length,
        tempoMediano: mediana(tempos),
        cobertura: recebidos.length ? (concluidos.length / recebidos.length) * 100 : null,
        registrosEstoque: estoque,
      };
    })
    .sort((a, b) => b.recebidos - a.recebidos);

  return (
    <AppShell titulo="Categorias" subtitulo="Análise das diferentes demandas da SEPLAN" >
      <KpiRow />
      <SectionCard
        titulo="Entrada × produção × estoque por categoria"
        descricao="Leitura comparada de cada serviço. Relações apresentadas como fato, sem atribuição automática de causa."
        info="Conclusões / recebidos indica a relação entre produção e entrada no período; não é meta nem SLA, e pode exceder 100% quando há conclusão de processos herdados."
      >
        {linhas.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 pb-2 font-medium">Categoria final</th>
                  <th className="px-2 pb-2 text-right font-medium">Recebidos</th>
                  <th className="px-2 pb-2 text-right font-medium">Concluídos</th>
                  <th className="px-2 pb-2 text-right font-medium">Conclusões / recebidos</th>
                  <th className="px-2 pb-2 text-right font-medium">Estoque</th>
                  <th className="px-2 pb-2 text-right font-medium">&gt; 60 dias</th>
                  <th className="px-2 pb-2 text-right font-medium">Tempo mediano</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.categoria} className="border-b border-border/60 last:border-0">
                    <td className="px-2 py-2 font-medium">
                      <button
                        type="button"
                        className="text-left hover:text-primary hover:underline"
                        onClick={() => setFiltro("categoria", l.categoria)}
                      >
                        {l.categoria}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-right tabular">{fmtInt(l.recebidos)}</td>
                    <td className="px-2 py-2 text-right tabular">{fmtInt(l.concluidos)}</td>
                    <td className="px-2 py-2 text-right tabular text-muted-foreground">
                      {fmtPct(l.cobertura)}
                    </td>
                    <td className="px-2 py-2 text-right tabular">
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() =>
                          abrirDetalhe({
                            titulo: `${l.categoria} — estoque`,
                            subtitulo: `${fmtInt(l.estoque)} protocolos pendentes`,
                            protocolos: l.registrosEstoque,
                          })
                        }
                      >
                        {fmtInt(l.estoque)}
                      </button>
                    </td>
                    <td
                      className={
                        l.acima60 > 0
                          ? "px-2 py-2 text-right font-medium text-critico tabular"
                          : "px-2 py-2 text-right tabular"
                      }
                    >
                      {fmtInt(l.acima60)}
                    </td>
                    <td className="px-2 py-2 text-right tabular">{fmtDias(l.tempoMediano)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
