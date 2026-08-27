import { ComparisonBadge } from "./ComparisonBadge";
import { KpiCard } from "./KpiCard";
import { useDashboard } from "@/data/dashboard-context";
import { fmtDias, fmtInt, fmtPct, fmtProtocolos } from "@/data/format";
import { diasSemMovimentacao, ranking } from "@/data/metrics";

export function KpiRow() {
  const { kpis, conjuntos, dataset, abrirDetalhe } = useDashboard();

  const paradosProtocolos = conjuntos.estoque.filter(
    (p) => p.ultimaMovimentacao !== null && (diasSemMovimentacao(p, dataset.dataReferencia) ?? 0) > 30,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        rotulo="Recebidos"
        valor={fmtInt(kpis.recebidos.valor)}
        unidade="protocolos"
        definicao="Protocolos abertos no período selecionado — demanda de entrada."
        rodape={<ComparisonBadge comparacao={kpis.recebidos.comparacao} />}
        onClick={() =>
          abrirDetalhe({
            titulo: "Recebidos",
            subtitulo: `${fmtProtocolos(kpis.recebidos.valor)} · ${kpis.periodo.rotulo}`,
            definicao: "Protocolos com data de abertura dentro do período selecionado.",
            protocolos: conjuntos.recebidos,
            distribuicao: ranking(conjuntos.recebidos, (p) => p.categoriaFinal)
              .slice(0, 6)
              .map((r) => ({ rotulo: r.chave, valor: r.quantidade })),
          })
        }
      />

      <KpiCard
        rotulo="Concluídos"
        valor={fmtInt(kpis.concluidos.valor)}
        unidade="protocolos"
        definicao="Protocolos com situação final conclusiva e data de conclusão dentro do período — produção realizada."
        rodape={<ComparisonBadge comparacao={kpis.concluidos.comparacao} />}
        onClick={() =>
          abrirDetalhe({
            titulo: "Concluídos",
            subtitulo: `${fmtProtocolos(kpis.concluidos.valor)} · ${kpis.periodo.rotulo}`,
            definicao:
              "Produção realizada: protocolos concluídos no período, independentemente do período de entrada.",
            protocolos: conjuntos.concluidos,
            distribuicao: ranking(conjuntos.concluidos, (p) => p.categoriaFinal)
              .slice(0, 6)
              .map((r) => ({ rotulo: r.chave, valor: r.quantidade })),
          })
        }
      />

      <KpiCard
        rotulo="Estoque atual"
        valor={fmtInt(kpis.estoque.valor)}
        unidade="protocolos"
        definicao="Protocolos ainda não classificados como concluídos na data de referência."
        rodape={
          <p className="text-xs text-muted-foreground tabular">
            {fmtInt(kpis.estoque.herdado)} herdados de períodos anteriores
          </p>
        }
        onClick={() =>
          abrirDetalhe({
            titulo: "Estoque atual",
            subtitulo: `${fmtProtocolos(kpis.estoque.valor)} pendentes na data de referência`,
            definicao: "Protocolos ainda não classificados como concluídos na data de referência.",
            protocolos: conjuntos.estoque,
            distribuicao: ranking(conjuntos.estoque, (p) => p.situacaoFinal).map((r) => ({
              rotulo: r.chave,
              valor: r.quantidade,
            })),
          })
        }
      />

      <KpiCard
        rotulo="Tempo mediano"
        valor={kpis.tempoMediano.valor === null ? "—" : fmtDias(kpis.tempoMediano.valor)}
        definicao="Mediana dos dias entre abertura e conclusão dos processos concluídos no período. A mediana evita distorção causada por poucos processos muito antigos."
        rodape={
          kpis.tempoMediano.valor === null ? (
            <p className="text-xs text-muted-foreground">Sem conclusões no período.</p>
          ) : (
            <p className="text-xs text-muted-foreground tabular">
              média {fmtDias(kpis.tempoMediano.mediaSecundaria)} · universo{" "}
              {fmtInt(kpis.tempoMediano.universo)}
            </p>
          )
        }
        tom={
          kpis.tempoMediano.valor === null
            ? "neutro"
            : kpis.tempoMediano.valor > 60
              ? "critico"
              : kpis.tempoMediano.valor > 30
                ? "atencao"
                : "neutro"
        }
        onClick={() =>
          abrirDetalhe({
            titulo: "Tempo mediano de atendimento",
            subtitulo: `${fmtDias(kpis.tempoMediano.valor)} · universo ${fmtProtocolos(kpis.tempoMediano.universo)}`,
            definicao:
              "Processos concluídos no período, com o tempo individual entre abertura e conclusão.",
            protocolos: conjuntos.concluidos,
          })
        }
      />

      <KpiCard
        rotulo="Parados há mais de 30 dias"
        valor={fmtInt(kpis.parados30.valor)}
        unidade="protocolos"
        definicao="Protocolos em estoque cuja última movimentação registrada é anterior a 30 dias da data de referência. Processos sem data de movimentação na base não entram no cálculo."
        tom={kpis.parados30.valor > 0 ? "critico" : "neutro"}
        rodape={
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground tabular">
              {fmtPct(
                kpis.estoque.valor ? (kpis.parados30.valor / kpis.estoque.valor) * 100 : null,
              )}{" "}
              do estoque
            </p>
            {kpis.parados30.semReferencia > 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {fmtInt(kpis.parados30.semReferencia)} sem movimentação registrada na base
              </p>
            ) : null}
          </div>
        }
        onClick={() =>
          abrirDetalhe({
            titulo: "Parados há mais de 30 dias",
            subtitulo: `${fmtProtocolos(paradosProtocolos.length)} sem movimentação há mais de 30 dias`,
            definicao:
              "Protocolos em estoque cuja última movimentação registrada ultrapassa 30 dias em relação à data de referência.",
            protocolos: paradosProtocolos,
            distribuicao: ranking(paradosProtocolos, (p) => p.categoriaFinal)
              .slice(0, 6)
              .map((r) => ({ rotulo: r.chave, valor: r.quantidade })),
          })
        }
      />
    </div>
  );
}
