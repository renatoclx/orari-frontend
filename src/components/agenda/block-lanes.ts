import type { TimeRange } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

/** Faixa de um bloco: a posição dele (0, 1…) entre as `lanes` da sobreposição. */
export type Lane = { lane: number; lanes: number };

/**
 * Divide a largura da coluna entre blocos que se sobrepõem. Cada grupo de
 * blocos ligados por sobreposição (A cruza B, B cruza C) reparte a coluna em
 * tantas faixas quantas o grupo precisa ao mesmo tempo; quem não cruza com
 * ninguém fica com a coluna inteira. Horários que só se encostam (fim de um
 * igual ao início do outro) não se sobrepõem.
 */
export function layoutLanes(
  items: { key: string; range: TimeRange }[],
): Map<string, Lane> {
  const sorted = items
    .map(({ key, range }) => ({
      key,
      start: timeToMinutes(range.start),
      end: timeToMinutes(range.end),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result = new Map<string, Lane>();
  let cluster: { key: string; lane: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  // Fecha o grupo: todos recebem o total de faixas que ele chegou a usar.
  const flush = () => {
    for (const { key, lane } of cluster) {
      result.set(key, { lane, lanes: laneEnds.length });
    }
    cluster = [];
    laneEnds = [];
  };

  for (const item of sorted) {
    if (item.start >= clusterEnd) flush();
    // A primeira faixa que já terminou; se nenhuma, abre uma nova.
    let lane = laneEnds.findIndex((end) => end <= item.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = item.end;
    cluster.push({ key: item.key, lane });
    clusterEnd =
      cluster.length === 1 ? item.end : Math.max(clusterEnd, item.end);
  }
  flush();

  return result;
}

/** Posição horizontal do bloco na coluna (4px de margem de cada lado). */
export function laneStyle({ lane, lanes }: Lane) {
  return {
    left: `calc(${(lane / lanes) * 100}% + 4px)`,
    width: `calc(${100 / lanes}% - 8px)`,
  };
}
