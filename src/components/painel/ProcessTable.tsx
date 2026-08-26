import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "./primitives";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/data/dashboard-context";
import { fmtData, fmtDias, fmtInt } from "@/data/format";
import { diasSemMovimentacao, idadeProtocolo, tempoAtendimento } from "@/data/metrics";
import type { Protocolo } from "@/data/types";
import { cn } from "@/lib/utils";

type Coluna = {
  chave: string;
  rotulo: string;
  alinhamento?: "right";
  valor: (p: Protocolo, ref: string) => string | number | null;
  ordenar: (p: Protocolo, ref: string) => string | number;
};

const COLUNAS: Coluna[] = [
  {
    chave: "protocolo",
    rotulo: "Número/Ano",
    valor: (p) => p.protocolo,
    ordenar: (p) => p.protocolo,
  },
  {
    chave: "abertura",
    rotulo: "Abertura",
    valor: (p) => fmtData(p.dataAbertura),
    ordenar: (p) => p.dataAbertura,
  },
  {
    chave: "categoria",
    rotulo: "Categoria final",
    valor: (p) => p.categoriaFinal,
    ordenar: (p) => p.categoriaFinal,
  },
  {
    chave: "situacao",
    rotulo: "Situação final",
    valor: (p) => p.situacaoFinal,
    ordenar: (p) => p.situacaoFinal,
  },
  { chave: "setor", rotulo: "Setor", valor: (p) => p.setor, ordenar: (p) => p.setor ?? "" },
  {
    chave: "responsavel",
    rotulo: "Responsável",
    valor: (p) => p.responsavel,
    ordenar: (p) => p.responsavel ?? "",
  },
  {
    chave: "idade",
    rotulo: "Idade",
    alinhamento: "right",
    valor: (p, ref) => fmtDias(idadeProtocolo(p, ref)),
    ordenar: (p, ref) => idadeProtocolo(p, ref),
  },
  {
    chave: "tempo",
    rotulo: "Tempo de atendimento",
    alinhamento: "right",
    valor: (p) => (tempoAtendimento(p) === null ? null : fmtDias(tempoAtendimento(p))),
    ordenar: (p) => tempoAtendimento(p) ?? -1,
  },
  {
    chave: "movimentacao",
    rotulo: "Última movimentação",
    valor: (p, ref) =>
      p.ultimaMovimentacao
        ? `${fmtData(p.ultimaMovimentacao)} (${fmtDias(diasSemMovimentacao(p, ref))})`
        : null,
    ordenar: (p) => p.ultimaMovimentacao ?? "",
  },
  {
    chave: "requerente",
    rotulo: "Requerente",
    valor: (p) => p.requerente,
    ordenar: (p) => p.requerente ?? "",
  },
  { chave: "ano", rotulo: "Ano", alinhamento: "right", valor: (p) => p.ano, ordenar: (p) => p.ano },
];

const POR_PAGINA = 25;

export function ProcessTable({
  protocolos,
  compacta = false,
}: {
  protocolos: Protocolo[];
  compacta?: boolean;
}) {
  const { dataset } = useDashboard();
  const [ordem, setOrdem] = useState<{ chave: string; asc: boolean }>({
    chave: "abertura",
    asc: false,
  });
  const [pagina, setPagina] = useState(0);

  const colunas = compacta
    ? COLUNAS.filter((c) =>
        ["protocolo", "abertura", "categoria", "situacao", "idade", "tempo"].includes(c.chave),
      )
    : COLUNAS;

  const ordenados = useMemo(() => {
    const col = COLUNAS.find((c) => c.chave === ordem.chave) ?? COLUNAS[0]!;
    return [...protocolos].sort((a, b) => {
      const va = col.ordenar(a, dataset.dataReferencia);
      const vb = col.ordenar(b, dataset.dataReferencia);
      const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "pt-BR");
      return ordem.asc ? r : -r;
    });
  }, [protocolos, ordem, dataset.dataReferencia]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const visiveis = ordenados.slice(paginaAtual * POR_PAGINA, paginaAtual * POR_PAGINA + POR_PAGINA);

  function exportar() {
    const cabecalho = colunas.map((c) => c.rotulo).join(";");
    const linhas = ordenados.map((p) =>
      colunas
        .map((c) => {
          const v = c.valor(p, dataset.dataReferencia);
          return v === null || v === undefined ? "" : String(v).replace(/;/g, ",");
        })
        .join(";"),
    );
    const csv = "\uFEFF" + [cabecalho, ...linhas].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "protocolos-seplan-filtrados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (protocolos.length === 0) {
    return <EmptyState titulo="Nenhum protocolo encontrado" descricao="O filtro aplicado não retornou registros." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground tabular">
          {fmtInt(ordenados.length)} protocolos · página {paginaAtual + 1} de {totalPaginas}
        </p>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportar}>
          <Download className="size-3.5" />
          Exportar registros filtrados
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="bg-muted/60">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {colunas.map((c) => (
                <th key={c.chave} className={cn("px-3 py-2 font-medium", c.alinhamento === "right" && "text-right")}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() =>
                      setOrdem((prev) => ({ chave: c.chave, asc: prev.chave === c.chave ? !prev.asc : true }))
                    }
                  >
                    {c.rotulo}
                    {ordem.chave === c.chave ? (
                      ordem.asc ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((p) => (
              <tr key={p.id} className="border-t border-border/70 hover:bg-accent/40">
                {colunas.map((c) => {
                  const v = c.valor(p, dataset.dataReferencia);
                  return (
                    <td
                      key={c.chave}
                      className={cn(
                        "px-3 py-2 text-foreground",
                        c.alinhamento === "right" && "text-right tabular",
                        c.chave === "protocolo" && "font-mono font-medium",
                      )}
                    >
                      {v === null || v === "" ? (
                        <span className="text-muted-foreground">Dado não disponível na base.</span>
                      ) : (
                        v
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={paginaAtual === 0}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={paginaAtual >= totalPaginas - 1}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
