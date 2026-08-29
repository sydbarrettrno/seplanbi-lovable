import { BarraProporcao, EmptyState, SectionCard } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { fmtInt, fmtPct } from "@/data/format";
import { ranking } from "@/data/metrics";
import type { Protocolo } from "@/data/types";

export function CategoryRanking({
  titulo,
  descricao,
  info,
  base,
  anteriores,
  tom = "entrada",
  limite = 8,
}: {
  titulo: string;
  descricao?: string | undefined;
  info?: string | undefined;
  base: Protocolo[];
  anteriores?: Protocolo[] | undefined;
  tom?: "neutro" | "entrada" | "conclusao" | "atencao";
  limite?: number;
}) {
  const { abrirDetalhe, setFiltro, filtros } = useDashboard();
  const itens = ranking(base, (p) => p.categoriaFinal, anteriores).slice(0, limite);
  const maior = itens[0]?.quantidade ?? 0;

  return (
    <SectionCard titulo={titulo} descricao={descricao} info={info}>
      {itens.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {itens.map((item) => (
            <li key={item.chave}>
              <div className="flex items-baseline justify-between gap-3">
                <button
                  type="button"
                  className="truncate text-left text-xs font-medium text-foreground hover:text-primary hover:underline"
                  onClick={() =>
                    setFiltro("categoria", filtros.categoria === item.chave ? null : item.chave)
                  }
                  title="Filtrar o painel por esta categoria"
                >
                  {item.chave}
                </button>
                <span className="flex shrink-0 items-baseline gap-2 tabular">
                  <span className="text-sm font-semibold text-foreground">
                    {fmtInt(item.quantidade)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {fmtPct(item.percentual)}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <BarraProporcao valor={item.quantidade} total={maior} tom={tom} />
                {item.quantidadeAnterior !== null ? (
                  <span className="w-24 shrink-0 text-right text-[11px] text-muted-foreground tabular">
                    ant.: {fmtInt(item.quantidadeAnterior)}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-primary hover:underline"
                  onClick={() =>
                    abrirDetalhe({
                      titulo: item.chave,
                      subtitulo: `${titulo} — ${fmtInt(item.quantidade)} protocolos`,
                      protocolos: base.filter((p) => p.categoriaFinal === item.chave),
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
