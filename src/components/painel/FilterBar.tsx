import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/data/dashboard-context";
import { MESES } from "@/data/format";
import type { Filtros } from "@/data/types";

const TODOS = "__todos__";

function FiltroSelect({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string;
  valor: string | null;
  opcoes: string[];
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </span>
      <Select
        value={valor ?? TODOS}
        onValueChange={(v) => onChange(v === TODOS ? null : v)}
      >
        <SelectTrigger className="h-9 w-full bg-surface text-xs sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos</SelectItem>
          {opcoes.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function FilterBar() {
  const { filtros, setFiltro, limparFiltros, filtrosAtivos, opcoes } = useDashboard();

  return (
    <div className="painel-card p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Ano
          </span>
          <Select
            value={String(filtros.ano)}
            onValueChange={(v) => setFiltro("ano", v === "todos" ? "todos" : Number(v))}
          >
            <SelectTrigger className="h-9 w-full bg-surface text-xs sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {opcoes.anos.map((a) => (
                <SelectItem key={a} value={String(a)}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Mês
          </span>
          <Select
            value={filtros.mes ? String(filtros.mes) : TODOS}
            disabled={filtros.ano === "todos"}
            onValueChange={(v) => setFiltro("mes", v === TODOS ? null : Number(v))}
          >
            <SelectTrigger className="h-9 w-full bg-surface text-xs sm:w-36">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              {MESES.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <FiltroSelect
          rotulo="Categoria"
          valor={filtros.categoria}
          opcoes={opcoes.categorias}
          onChange={(v) => setFiltro("categoria", v)}
        />
        <FiltroSelect
          rotulo="Situação"
          valor={filtros.situacao}
          opcoes={opcoes.situacoes}
          onChange={(v) => setFiltro("situacao", v)}
        />
        <FiltroSelect
          rotulo="Setor"
          valor={filtros.setor}
          opcoes={opcoes.setores}
          onChange={(v) => setFiltro("setor", v)}
        />
        <FiltroSelect
          rotulo="Responsável"
          valor={filtros.responsavel}
          opcoes={opcoes.responsaveis}
          onChange={(v) => setFiltro("responsavel", v)}
        />

        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Protocolo / requerente
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filtros.busca}
              onChange={(e) => setFiltro("busca", e.target.value)}
              placeholder="Pesquisar"
              className="h-9 bg-surface pl-8 text-xs"
            />
          </div>
        </label>
      </div>

      {filtrosAtivos.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Filtros ativos
          </span>
          {filtrosAtivos.map((f) => (
            <button
              key={f.chave}
              type="button"
              onClick={() =>
                setFiltro(
                  f.chave,
                  (f.chave === "ano" ? "todos" : f.chave === "busca" ? "" : null) as Filtros[typeof f.chave],
                )
              }
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground transition-colors hover:border-ring"
            >
              {f.rotulo}
              <X className="size-3" />
            </button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        </div>
      ) : null}
    </div>
  );
}
