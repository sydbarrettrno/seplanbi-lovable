import { BarraProporcao, EmptyState, SectionCard } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { fmtDias, fmtInt, fmtProtocolos } from "@/data/format";
import { tempoPorCategoria } from "@/data/metrics";

export function TimeByCategory({ limite = 8 }: { limite?: number }) {
  const { conjuntos, abrirDetalhe } = useDashboard();
  const itens = tempoPorCategoria(conjuntos.concluidos).slice(0, limite);
  const maior = Math.max(...itens.map((i) => i.mediana ?? 0), 1);

  return (
    <SectionCard
      titulo="Tempo por tipo de demanda"
      descricao="Tempo mediano entre abertura e conclusão, por categoria final."
      info="Mediana dos dias entre abertura e conclusão dos processos concluídos no período. A mediana evita distorção causada por poucos processos muito antigos. P90 indica o tempo em que 90% dos casos foram concluídos."
    >
      {itens.length === 0 ? (
        <EmptyState titulo="Nenhuma conclusão no período" descricao="Sem processos concluídos para calcular tempos." />
      ) : (
        <ul className="space-y-3">
          {itens.map((item) => (
            <li key={item.categoria}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-xs font-medium text-foreground">{item.categoria}</span>
                <span className="shrink-0 text-sm font-semibold text-foreground tabular">
                  {fmtDias(item.mediana)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <BarraProporcao
                  valor={item.mediana ?? 0}
                  total={maior}
                  tom={(item.mediana ?? 0) > 60 ? "critico" : (item.mediana ?? 0) > 30 ? "atencao" : "neutro"}
                />
                <span className="shrink-0 text-[11px] text-muted-foreground tabular">
                  P90 {fmtDias(item.p90)} · média {fmtDias(item.media)} · {fmtInt(item.universo)} casos
                </span>
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-primary hover:underline"
                  onClick={() =>
                    abrirDetalhe({
                      titulo: `${item.categoria} — tempo de atendimento`,
                      subtitulo: `Mediana ${fmtDias(item.mediana)} · universo ${fmtProtocolos(item.universo)}`,
                      definicao:
                        "Processos concluídos no período selecionado para esta categoria, com o tempo individual de atendimento.",
                      protocolos: conjuntos.concluidos.filter((p) => p.categoriaFinal === item.categoria),
                    })
                  }
                >
                  ver
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
