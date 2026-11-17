import { CampusGraph, Milestone, RouteResult } from '../types/navigation';
import { findShortestPath, PathfindingOptions } from './dijkstra';

// Scale factor: roughly 14 pixels per meter on 1600x1515 floor plan
const PIXELS_PER_METER = 14;
const WALKING_SPEED_METERS_PER_MIN = 72; // ~1.2 m/s

export function computeTurnDirection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): 'straight' | 'slight_left' | 'left' | 'sharp_left' | 'slight_right' | 'right' | 'sharp_right' | 'u_turn' {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);

  let diff = angle2 - angle1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;

  const deg = (diff * 180) / Math.PI;

  if (Math.abs(deg) < 25) return 'straight';
  if (deg >= 25 && deg < 65) return 'slight_right';
  if (deg >= 65 && deg <= 115) return 'right';
  if (deg > 115 && deg < 160) return 'sharp_right';
  if (deg <= -25 && deg > -65) return 'slight_left';
  if (deg <= -65 && deg >= -115) return 'left';
  if (deg < -115 && deg > -160) return 'sharp_left';
  return 'u_turn';
}

function getTurnLabel(turn: string): string {
  switch (turn) {
    case 'slight_left':
      return 'Bear slight left';
    case 'left':
      return 'Turn left';
    case 'sharp_left':
      return 'Sharp left turn';
    case 'slight_right':
      return 'Bear slight right';
    case 'right':
      return 'Turn right';
    case 'sharp_right':
      return 'Sharp right turn';
    case 'u_turn':
      return 'Turn around';
    default:
      return 'Continue straight';
  }
}

export function generateMilestones(
  graph: CampusGraph,
  pathNodeIds: string[]
): Milestone[] {
  if (pathNodeIds.length === 0) return [];

  const nodes = graph.nodes;
  const milestones: Milestone[] = [];

  const startId = pathNodeIds[0];
  const destId = pathNodeIds[pathNodeIds.length - 1];
  const startNode = nodes[startId];
  const destNode = nodes[destId];

  if (!startNode || !destNode) return [];

  if (pathNodeIds.length === 1) {
    return [
      {
        id: 'ms-0',
        nodeId: startId,
        label: `You are already at ${startNode.label}`,
        subtext: startNode.floor === 0 ? 'Ground Floor' : `Floor ${startNode.floor}`,
        type: 'arrive',
        action: 'Arrived',
        icon: 'map-pin',
        floor: startNode.floor,
        coords: { x: startNode.x, y: startNode.y },
        distanceToNextMeters: 0,
        cumulativeDistanceMeters: 0
      }
    ];
  }

  // 1. Calculate edge distances along path
  const segmentDistances: number[] = [];
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const u = nodes[pathNodeIds[i]];
    const v = nodes[pathNodeIds[i + 1]];
    const edge = graph.edges.find((e) => e.from === pathNodeIds[i] && e.to === pathNodeIds[i + 1]);
    let d = 0;
    if (edge && typeof edge.weight === 'number') {
      d = Math.round(edge.weight * 10) / 10;
    } else if (u && v && u.floor === v.floor) {
      const dx = v.x - u.x;
      const dy = v.y - u.y;
      d = Math.round((Math.hypot(dx, dy) * 0.065) * 10) / 10;
    } else {
      d = 6.0; // Vertical transition distance
    }
    segmentDistances.push(d);
  }

  const getSpanDistance = (startIdx: number, endIdx: number) => {
    return Math.round(segmentDistances.slice(startIdx, endIdx).reduce((a, b) => a + b, 0) * 10) / 10;
  };

  const totalMeters = getSpanDistance(0, pathNodeIds.length - 1);

  // Milestone 1: Start Room
  milestones.push({
    id: `ms-start`,
    nodeId: startId,
    label: `Start at ${startNode.label}`,
    subtext: `${startNode.floor === 0 ? 'Ground Floor' : `Floor ${startNode.floor}`} • Ready to begin`,
    type: 'start',
    action: 'Depart',
    icon: 'navigation',
    floor: startNode.floor,
    coords: { x: startNode.x, y: startNode.y },
    distanceToNextMeters: 0,
    cumulativeDistanceMeters: 0
  });

  // Check for floor changes along path
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const currId = pathNodeIds[i];
    const nextId = pathNodeIds[i + 1];
    const currNode = nodes[currId];
    const nextNode = nodes[nextId];

    if (currNode && nextNode && currNode.floor !== nextNode.floor) {
      // Find the end of this continuous vertical transition
      let j = i + 1;
      while (j < pathNodeIds.length - 1 && nodes[pathNodeIds[j]].floor !== nodes[pathNodeIds[j + 1]].floor) {
        j++;
      }
      const arrivalId = pathNodeIds[j];
      const arrivalNode = nodes[arrivalId];

      const isElevator = currNode.type === 'elevator' || nextNode.type === 'elevator';
      const isUp = arrivalNode.floor > currNode.floor;
      const targetFloorName = arrivalNode.floor === 0 ? 'Ground Floor' : `Floor ${arrivalNode.floor}`;

      // Milestone 2: Directly when we change floor (take elevator/stairs to destination floor)
      milestones.push({
        id: `ms-trans-depart-${i}`,
        nodeId: currId,
        label: `Take ${isElevator ? 'Elevator' : 'Stairs'} ${isUp ? 'up' : 'down'} to ${targetFloorName}`,
        subtext: `Transition from ${currNode.floor === 0 ? 'Ground Floor' : `Floor ${currNode.floor}`} to ${targetFloorName}`,
        type: isElevator ? 'elevator' : 'stairs',
        action: isUp ? 'Ascend' : 'Descend',
        icon: isElevator ? 'chevrons-up-down' : 'footprints',
        floor: currNode.floor,
        coords: { x: currNode.x, y: currNode.y },
        distanceToNextMeters: 0,
        cumulativeDistanceMeters: getSpanDistance(0, i)
      });

      // Milestone 3: When we reach destination room floor
      milestones.push({
        id: `ms-trans-arrive-${j}`,
        nodeId: arrivalId,
        label: `Arrive on ${targetFloorName}`,
        subtext: `Exit ${isElevator ? 'elevator' : 'stairs'} at ${arrivalNode.label}`,
        type: 'floor_change',
        action: 'Exit',
        icon: 'door-open',
        floor: arrivalNode.floor,
        coords: { x: arrivalNode.x, y: arrivalNode.y },
        distanceToNextMeters: 0,
        cumulativeDistanceMeters: getSpanDistance(0, j)
      });

      i = j;
    }
  }

  // Milestone 4: Directly at Destination Room
  milestones.push({
    id: `ms-dest`,
    nodeId: destId,
    label: `Arrive at ${destNode.label}`,
    subtext: `${destNode.floor === 0 ? 'Ground Floor' : `Floor ${destNode.floor}`} • Destination reached`,
    type: 'arrive',
    action: 'Arrive',
    icon: 'map-pin',
    floor: destNode.floor,
    coords: { x: destNode.x, y: destNode.y },
    distanceToNextMeters: 0,
    cumulativeDistanceMeters: totalMeters
  });

  // Calculate distanceToNextMeters for each step
  for (let m = 0; m < milestones.length - 1; m++) {
    milestones[m].distanceToNextMeters = Math.max(
      1.0,
      Math.round((milestones[m + 1].cumulativeDistanceMeters - milestones[m].cumulativeDistanceMeters) * 10) / 10
    );
  }

  return milestones;
}

export function buildRouteResult(
  graph: CampusGraph,
  startId: string,
  endId: string,
  options: PathfindingOptions = {}
): RouteResult | null {
  const pathResult = findShortestPath(graph, startId, endId, options);
  if (!pathResult) return null;

  const milestones = generateMilestones(graph, pathResult.pathNodeIds);
  const floorsSet = new Set<number>();
  for (const id of pathResult.pathNodeIds) {
    floorsSet.add(graph.nodes[id].floor);
  }

  // Calculate total meters (pathResult.totalDistance from Dijkstra is already in meters)
  const totalDistMeters = Math.round(pathResult.totalDistance * 10) / 10;
  const estimatedMins = Math.max(1, Math.round((totalDistMeters / WALKING_SPEED_METERS_PER_MIN) * 10) / 10);

  return {
    pathNodeIds: pathResult.pathNodeIds,
    totalDistance: totalDistMeters,
    estimatedMinutes: estimatedMins,
    milestones,
    floorsTraversed: Array.from(floorsSet).sort((a, b) => a - b)
  };
}
