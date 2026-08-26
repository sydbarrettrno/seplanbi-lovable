import { BarraProporcao, EmptyState, SectionCard } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { fmtInt, fmtPct } from "@/data/format";
import { ranking } from "@/data/metrics";
import type { Protocolo } from "@/data/types";

export function StatusDistribution({
  base,
  titulo = "Situação atual do estoque",
  descricao = "Distribuição pela situação final normalizada dos processos pendentes.",
}: {
  base?: Protocolo[];
  titulo?: string;
  descricao?: string;
}) {
  const { conjuntos, abrirDetalhe, setFiltro, filtros } = useDashboard();
  const dados = base ?? conjuntos.estoque;
  const itens = ranking(dados, (p) => p.situacaoFinal);
  const maior = itens[0]?.quantidade ?? 1;

  return (
    <SectionCard
      titulo={titulo}
      descricao={descricao}
      info="Situações vêm do campo final normalizado da base. Processo aberto não equivale automaticamente a atraso interno: parte aguarda requerente ou providência externa."
    >
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
                    setFiltro("situacao", filtros.situacao === item.chave ? null : item.chave)
                  }
                >
                  {item.chave}
                </button>
                <span className="flex shrink-0 items-baseline gap-2 tabular">
                  <span className="text-sm font-semibold text-foreground">
                    {fmtInt(item.quantidade)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{fmtPct(item.percentual)}</span>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-primary hover:underline"
                    onClick={() =>
                      abrirDetalhe({
                        titulo: item.chave,
                        subtitulo: `${titulo} — ${fmtInt(item.quantidade)} protocolos`,
                        protocolos: dados.filter((p) => p.situacaoFinal === item.chave),
                      })
                    }
                  >
                    ver
                  </button>
                </span>
              </div>
              <div className="mt-1.5">
                <BarraProporcao valor={item.quantidade} total={maior} tom="neutro" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
