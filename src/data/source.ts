import { DEMO_DATASET } from "./demo-dataset";
import type { Dataset } from "./types";

/**
 * Ponto único de troca da fonte de dados.
 *
 * Hoje retorna a base DEMO. Ao conectar a base normalizada (ETL), substitua
 * apenas esta função — nenhum componente precisa ser reescrito.
 */
export function getDataset(): Dataset {
  return DEMO_DATASET;
}
