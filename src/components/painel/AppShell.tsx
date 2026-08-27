import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DetailDrawer } from "./DetailDrawer";
import { FilterBar } from "./FilterBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDashboard } from "@/data/dashboard-context";
import { fmtDataHora } from "@/data/format";

const NAV = [
  { to: "/", rotulo: "Visão executiva" },
  { to: "/demanda", rotulo: "Demanda" },
  { to: "/producao", rotulo: "Produção" },
  { to: "/estoque", rotulo: "Estoque e tempo" },
  { to: "/categorias", rotulo: "Categorias" },
  { to: "/setores", rotulo: "Setores / equipe" },
  { to: "/protocolos", rotulo: "Explorador de protocolos" },
] as const;

export function AppShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}) {
  const { dataset, conjuntos } = useDashboard();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  SEPLAN <span className="text-border">|</span> Itapoá
                </p>
                <h1 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">{titulo}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitulo}</p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>Dados atualizados até: {fmtDataHora(dataset.atualizadoEm)}</p>
                <p className="tabular">Período analisado: {conjuntos.periodo.rotulo}</p>
                {dataset.origem === "DEMO" ? (
                  <p className="mt-1 inline-block rounded-sm border border-atencao/40 bg-atencao/10 px-1.5 py-0.5 font-medium text-foreground">
                    Base DEMO — dados fictícios para desenvolvimento
                  </p>
                ) : null}
              </div>
            </div>

            <nav className="mt-4 -mb-px flex gap-1 overflow-x-auto">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "border-primary text-foreground" }}
                >
                  {item.rotulo}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-5 sm:px-6">
          <FilterBar />
          {children}
        </main>

        <footer className="mx-auto max-w-[1600px] px-4 pb-8 text-[11px] text-muted-foreground sm:px-6">
          Indicadores calculados sobre os campos finais normalizados da base. Todo número é
          rastreável até os protocolos que o compõem.
        </footer>

        <DetailDrawer />
      </div>
    </TooltipProvider>
  );
}
