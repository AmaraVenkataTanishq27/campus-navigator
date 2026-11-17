import { CampusGraph, NavEdge } from '../types/navigation';

export interface PathfindingOptions {
  accessibleOnly?: boolean;
}

export interface PathfindingResult {
  pathNodeIds: string[];
  totalDistance: number;
}

export function findShortestPath(
  graph: CampusGraph,
  startId: string,
  endId: string,
  options: PathfindingOptions = {}
): PathfindingResult | null {
  const { accessibleOnly = false } = options;
  const nodes = graph.nodes;
  const edges = graph.edges;

  if (!nodes[startId] || !nodes[endId]) {
    return null;
  }

  if (startId === endId) {
    return { pathNodeIds: [startId], totalDistance: 0 };
  }

  const adj = new Map<string, NavEdge[]>();
  for (const id of Object.keys(nodes)) {
    adj.set(id, []);
  }

  for (const edge of edges) {
    if (accessibleOnly) {
      if (edge.isAccessible === false) continue;
      if (edge.verticalType === 'stairs') continue;
    }

    const list = adj.get(edge.from);
    if (list) {
      list.push(edge);
    }
  }

  const dist: Record<string, number> = {};
  const prev: Record<string, { from: string; weight: number }> = {};
  const unvisited = new Set<string>(Object.keys(nodes));

  for (const id of Object.keys(nodes)) {
    dist[id] = Infinity;
  }
  dist[startId] = 0;

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id];
        curr = id;
      }
    }

    if (curr === null || dist[curr] === Infinity) {
      break;
    }

    if (curr === endId) {
      break;
    }

    unvisited.delete(curr);

    const neighbors = adj.get(curr) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      const alt = dist[curr] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = { from: curr, weight: edge.weight };
      }
    }
  }

  if (dist[endId] === Infinity) {
    return null;
  }

  const path: string[] = [];
  let currStep: string | undefined = endId;
  while (currStep !== undefined) {
    path.unshift(currStep);
    currStep = prev[currStep]?.from;
  }

  return {
    pathNodeIds: path,
    totalDistance: Math.round(dist[endId] * 10) / 10
  };
}
