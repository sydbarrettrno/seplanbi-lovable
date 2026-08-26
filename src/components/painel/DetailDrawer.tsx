import { Link } from "@tanstack/react-router";

import { ProcessTable } from "./ProcessTable";
import { BarraProporcao } from "./primitives";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDashboard } from "@/data/dashboard-context";
import { fmtInt } from "@/data/format";

export function DetailDrawer() {
  const { detalhe, fecharDetalhe, filtrosAtivos, conjuntos } = useDashboard();

  return (
    <Sheet open={!!detalhe} onOpenChange={(o) => (!o ? fecharDetalhe() : undefined)}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-3xl">
        {detalhe ? (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle className="text-base">{detalhe.titulo}</SheetTitle>
              <SheetDescription className="text-xs">
                {detalhe.subtitulo ?? `${fmtInt(detalhe.protocolos.length)} protocolos`}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 p-4">
              {detalhe.definicao ? (
                <p className="rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                  {detalhe.definicao}
                </p>
              ) : null}

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Filtros que produziram o resultado
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-sm border border-border bg-accent px-2 py-0.5 text-accent-foreground">
                    Período: {conjuntos.periodo.rotulo}
                  </span>
                  {filtrosAtivos.length === 0 ? (
                    <span className="text-muted-foreground">Nenhum filtro adicional aplicado.</span>
                  ) : (
                    filtrosAtivos.map((f) => (
                      <span
                        key={f.chave}
                        className="rounded-sm border border-border bg-accent px-2 py-0.5 text-accent-foreground"
                      >
                        {f.rotulo}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {detalhe.distribuicao && detalhe.distribuicao.length > 0 ? (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Principais categorias
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {detalhe.distribuicao.map((d) => (
                      <li key={d.rotulo}>
                        <div className="flex items-baseline justify-between gap-3 text-xs">
                          <span className="truncate text-foreground">{d.rotulo}</span>
                          <span className="font-semibold tabular">{fmtInt(d.valor)}</span>
                        </div>
                        <div className="mt-1">
                          <BarraProporcao
                            valor={d.valor}
                            total={Math.max(...detalhe.distribuicao!.map((x) => x.valor), 1)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Protocolos correspondentes
                </h3>
                <ProcessTable protocolos={detalhe.protocolos} compacta />
              </div>

              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/protocolos" onClick={fecharDetalhe}>
                  Abrir análise completa no explorador de protocolos
                </Link>
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
