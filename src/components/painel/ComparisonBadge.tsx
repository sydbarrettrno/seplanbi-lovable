import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { fmtInt, fmtPct } from "@/data/format";
import type { Comparacao } from "@/data/metrics";
import { cn } from "@/lib/utils";

/**
 * Comparação com período equivalente anterior.
 * A cor NÃO julga o movimento: variação é informação neutra, pois aumento de
 * demanda ou de produção têm significados operacionais distintos.
 */
export function ComparisonBadge({
  comparacao,
  unidade = "protocolos",
}: {
  comparacao: Comparacao;
  unidade?: string;
}) {
  if (comparacao.anterior === null || comparacao.delta === null) {
    return (
      <p className="text-xs text-muted-foreground">
        Sem período equivalente anterior na base.
      </p>
    );
  }
  const { delta, pct, anterior, rotuloAnterior } = comparacao;
  const Icone = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-1.5 py-0.5 font-medium tabular text-foreground",
        )}
      >
        <Icone className="size-3" />
        {delta > 0 ? "+" : ""}
        {fmtInt(delta)} {unidade}
        {pct !== null ? <span className="text-muted-foreground">({fmtPct(pct, true)})</span> : null}
      </span>
      <span className="text-muted-foreground">
        vs. {rotuloAnterior}: {fmtInt(anterior)}
      </span>
    </div>
  );
}
