import { EmptyState, SectionCard } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { fmtDias, fmtInt, fmtPct } from "@/data/format";
import { desempenhoPorSetor, idadeProtocolo } from "@/data/metrics";

export function SectorPerformance({
  campo = "setor",
  titulo = "Distribuição do trabalho por setor",
}: {
  campo?: "setor" | "responsavel";
  titulo?: string;
}) {
  const { conjuntos, dataset, abrirDetalhe } = useDashboard();
  const linhas = desempenhoPorSetor(conjuntos, dataset, campo);

  return (
    <SectionCard
      titulo={titulo}
      descricao="Volumes e tempos apresentados de forma neutra: categorias possuem complexidades diferentes."
      info="Recebidos e concluídos referem-se ao período selecionado; estoque e processos acima de 60 dias referem-se à data de referência. Volume menor não significa desempenho inferior."
    >
      {linhas.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-1 pb-2 font-medium">{campo === "setor" ? "Setor" : "Responsável"}</th>
                <th className="px-1 pb-2 text-right font-medium">Recebidos</th>
                <th className="px-1 pb-2 text-right font-medium">Concluídos</th>
                <th className="px-1 pb-2 text-right font-medium">Estoque</th>
                <th className="px-1 pb-2 text-right font-medium">Tempo mediano</th>
                <th className="px-1 pb-2 text-right font-medium">&gt; 60 dias</th>
                <th className="px-1 pb-2 text-right font-medium">Participação</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.setor} className="border-b border-border/60 last:border-0">
                  <td className="px-1 py-2 font-medium text-foreground">{l.setor}</td>
                  <td className="px-1 py-2 text-right tabular">{fmtInt(l.recebidos)}</td>
                  <td className="px-1 py-2 text-right tabular">{fmtInt(l.concluidos)}</td>
                  <td className="px-1 py-2 text-right tabular">
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() =>
                        abrirDetalhe({
                          titulo: `${l.setor} — estoque`,
                          subtitulo: `${fmtInt(l.estoque)} protocolos pendentes na data de referência`,
                          protocolos: conjuntos.estoque.filter(
                            (p) => (p[campo] ?? "Dado não disponível na base.") === l.setor,
                          ),
                        })
                      }
                    >
                      {fmtInt(l.estoque)}
                    </button>
                  </td>
                  <td className="px-1 py-2 text-right tabular">{fmtDias(l.tempoMediano)}</td>
                  <td className="px-1 py-2 text-right tabular">
                    <button
                      type="button"
                      className={l.acima60 > 0 ? "font-medium text-critico hover:underline" : ""}
                      onClick={() =>
                        abrirDetalhe({
                          titulo: `${l.setor} — estoque acima de 60 dias`,
                          subtitulo: `${fmtInt(l.acima60)} protocolos`,
                          protocolos: conjuntos.estoque.filter(
                            (p) =>
                              (p[campo] ?? "Dado não disponível na base.") === l.setor &&
                              idadeProtocolo(p, dataset.dataReferencia) > 60,
                          ),
                        })
                      }
                    >
                      {fmtInt(l.acima60)}
                    </button>
                  </td>
                  <td className="px-1 py-2 text-right tabular text-muted-foreground">
                    {fmtPct(l.participacao)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
