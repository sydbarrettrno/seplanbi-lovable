import { BarraProporcao, EmptyState, SectionCard } from "./primitives";
import { useDashboard } from "@/data/dashboard-context";
import { fmtInt, fmtPct } from "@/data/format";
import { distribuicaoIdade, idadeProtocolo, ranking } from "@/data/metrics";

export function AgingDistribution() {
  const { conjuntos, dataset, abrirDetalhe } = useDashboard();
  const faixas = distribuicaoIdade(conjuntos.estoque, dataset.dataReferencia);
  const maior = Math.max(...faixas.map((f) => f.quantidade), 1);
  const total = conjuntos.estoque.length;

  return (
    <SectionCard
      titulo="Envelhecimento do estoque"
      descricao="Idade dos protocolos ainda não concluídos, contada da abertura até a data de referência."
      info="Idade = data de referência menos data de abertura. Faixas acima de 60 dias são destacadas como situação crítica de permanência em estoque."
      acao={
        <span className="text-[11px] text-muted-foreground tabular">
          Estoque: {fmtInt(total)}
        </span>
      }
    >
      {total === 0 ? (
        <EmptyState titulo="Nenhum protocolo em estoque" descricao="Não há processos pendentes para os filtros aplicados." />
      ) : (
        <ul className="space-y-3">
          {faixas.map((f) => {
            const protocolos = conjuntos.estoque.filter((p) => {
              const idade = idadeProtocolo(p, dataset.dataReferencia);
              return idade >= f.min && idade <= f.max;
            });
            return (
              <li key={f.rotulo}>
                <button
                  type="button"
                  className="group w-full text-left"
                  onClick={() =>
                    abrirDetalhe({
                      titulo: `Estoque — ${f.rotulo}`,
                      subtitulo: `${fmtInt(f.quantidade)} protocolos (${fmtPct(f.percentual)} do estoque)`,
                      definicao:
                        "Protocolos não concluídos cuja idade, na data de referência, está dentro da faixa selecionada.",
                      protocolos,
                      distribuicao: ranking(protocolos, (p) => p.categoriaFinal)
                        .slice(0, 6)
                        .map((r) => ({ rotulo: r.chave, valor: r.quantidade })),
                    })
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-medium text-foreground group-hover:text-primary">
                      {f.rotulo}
                    </span>
                    <span className="flex items-baseline gap-2 tabular">
                      <span className="text-sm font-semibold text-foreground">
                        {fmtInt(f.quantidade)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {fmtPct(f.percentual)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <BarraProporcao
                      valor={f.quantidade}
                      total={maior}
                      tom={f.critica ? "critico" : f.min >= 31 ? "atencao" : "neutro"}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
