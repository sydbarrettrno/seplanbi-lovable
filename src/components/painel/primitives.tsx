import { Info } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Ícone discreto com a definição do indicador. */
export function MetricInfo({ children }: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="note"
          tabIndex={0}
          aria-label="Definição do indicador"
          className="inline-flex cursor-help text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          <Info className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-xs leading-relaxed">{children}</TooltipContent>
    </Tooltip>
  );
}

export function SectionCard({
  titulo,
  descricao,
  info,
  acao,
  children,
  className,
}: {
  titulo: string;
  descricao?: string | undefined;
  info?: ReactNode | undefined;
  acao?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("painel-card flex flex-col p-4 sm:p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            {titulo}
            {info ? <MetricInfo>{info}</MetricInfo> : null}
          </h2>
          {descricao ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p>
          ) : null}
        </div>
        {acao}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function EmptyState({
  titulo = "Sem registros para os filtros aplicados",
  descricao = "Ajuste ou limpe os filtros para visualizar dados.",
}: {
  titulo?: string;
  descricao?: string;
}) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{descricao}</p>
    </div>
  );
}

export function SemDado({ className }: { className?: string }) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      Dado não disponível na base.
    </span>
  );
}

/** Barra proporcional neutra usada nos rankings. */
export function BarraProporcao({
  valor,
  total,
  tom = "neutro",
}: {
  valor: number;
  total: number;
  tom?: "neutro" | "entrada" | "conclusao" | "atencao" | "critico";
}) {
  const pct = total > 0 ? (valor / total) * 100 : 0;
  const cor = {
    neutro: "bg-neutro/50",
    entrada: "bg-serie-entrada",
    conclusao: "bg-serie-conclusao",
    atencao: "bg-atencao",
    critico: "bg-critico",
  }[tom];
  return (
    <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
      <div className={cn("h-full rounded-sm", cor)} style={{ width: `${Math.max(pct, 0.6)}%` }} />
    </div>
  );
}

/** Gráficos só renderizam após hidratação (evita divergência de medidas no SSR). */
export function useHidratado() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
