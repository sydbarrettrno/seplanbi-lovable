import type { ReactNode } from "react";

import { MetricInfo } from "./primitives";
import { cn } from "@/lib/utils";

export function KpiCard({
  rotulo,
  valor,
  unidade,
  definicao,
  rodape,
  tom = "neutro",
  onClick,
  ativo,
}: {
  rotulo: string;
  valor: string;
  unidade?: string;
  definicao: string;
  rodape?: ReactNode;
  tom?: "neutro" | "atencao" | "critico";
  onClick?: () => void;
  ativo?: boolean;
}) {
  const barra = {
    neutro: "bg-neutro/40",
    atencao: "bg-atencao",
    critico: "bg-critico",
  }[tom];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "painel-card group relative flex flex-col overflow-hidden p-4 text-left transition-colors",
        onClick && "cursor-pointer hover:border-ring/60 focus-visible:outline-2 focus-visible:outline-ring",
        ativo && "border-ring",
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-0.5", barra)} />
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {rotulo}
        <MetricInfo>{definicao}</MetricInfo>
      </span>
      <span className="mt-2.5 flex items-baseline gap-1.5">
        <span className="numero-grande text-3xl font-semibold text-foreground sm:text-[2rem]">
          {valor}
        </span>
        {unidade ? (
          <span className="text-xs font-medium text-muted-foreground">{unidade}</span>
        ) : null}
      </span>
      <div className="mt-2.5 space-y-1">{rodape}</div>
      {onClick ? (
        <span className="mt-3 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Ver protocolos →
        </span>
      ) : null}
    </div>
  );
}
