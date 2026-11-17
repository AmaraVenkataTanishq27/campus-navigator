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

  if (pathNodeIds.length === 1) {
    const singleNode = nodes[pathNodeIds[0]];
    return [
      {
        id: 'ms-0',
        nodeId: pathNodeIds[0],
        label: `You are already at ${singleNode.label}`,
        subtext: `Floor ${singleNode.floor}`,
        type: 'arrive',
        action: 'Arrived',
        icon: 'map-pin',
        floor: singleNode.floor,
        coords: { x: singleNode.x, y: singleNode.y },
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
      d = Math.round((Math.sqrt(dx * dx + dy * dy) / PIXELS_PER_METER) * 10) / 10;
    } else {
      d = 6.0; // Vertical transition distance in meters equivalent
    }
    segmentDistances.push(d);
  }

  // Helper for cumulative and span distances
  const getSpanDistance = (startIdx: number, endIdx: number) => {
    return Math.round(segmentDistances.slice(startIdx, endIdx).reduce((a, b) => a + b, 0) * 10) / 10;
  };

  // 2. Add Start Milestone
  const startNode = nodes[pathNodeIds[0]];
  milestones.push({
    id: `ms-start`,
    nodeId: pathNodeIds[0],
    label: `Start at ${startNode.label}`,
    subtext: `Floor ${startNode.floor} • Ready to begin`,
    type: 'start',
    action: 'Depart',
    icon: 'navigation',
    floor: startNode.floor,
    coords: { x: startNode.x, y: startNode.y },
    distanceToNextMeters: segmentDistances[0] || 0,
    cumulativeDistanceMeters: 0
  });

  // 3. Process intermediate path nodes with grouping
  let i = 1;

  while (i < pathNodeIds.length - 1) {
    const currId = pathNodeIds[i];
    const prevId = pathNodeIds[i - 1];
    const nextId = pathNodeIds[i + 1];

    const currNode = nodes[currId];
    const prevNode = nodes[prevId];
    const nextNode = nodes[nextId];

    // Check if vertical floor change
    if (currNode.floor !== nextNode.floor) {
      const isElevator = currNode.type === 'elevator' || nextNode.type === 'elevator';
      const isUp = nextNode.floor > currNode.floor;
      const actionName = isElevator
        ? `Take elevator ${isUp ? 'up' : 'down'} to Floor ${nextNode.floor}`
        : `Take stairs ${isUp ? 'up' : 'down'} to Floor ${nextNode.floor}`;

      milestones.push({
        id: `ms-${i}`,
        nodeId: currId,
        label: actionName,
        subtext: `Transition from Floor ${currNode.floor} to Floor ${nextNode.floor}`,
        type: isElevator ? 'elevator' : 'stairs',
        action: isUp ? 'Ascend' : 'Descend',
        icon: isElevator ? 'chevrons-up-down' : 'footprints',
        floor: currNode.floor,
        coords: { x: currNode.x, y: currNode.y },
        distanceToNextMeters: segmentDistances[i] || 0,
        cumulativeDistanceMeters: getSpanDistance(0, i)
      });
      i++;
      continue;
    }

    // Check if previous was a floor change landing on current floor
    if (prevNode.floor !== currNode.floor) {
      milestones.push({
        id: `ms-${i}-landing`,
        nodeId: currId,
        label: `Exit onto Floor ${currNode.floor}`,
        subtext: `Arrived on Floor ${currNode.floor} at ${currNode.label}`,
        type: 'floor_change',
        action: 'Exit',
        icon: 'door-open',
        floor: currNode.floor,
        coords: { x: currNode.x, y: currNode.y },
        distanceToNextMeters: segmentDistances[i] || 0,
        cumulativeDistanceMeters: getSpanDistance(0, i)
      });
      i++;
      continue;
    }

    // Check for junction turns
    if (currNode.type === 'junction') {
      const turn = computeTurnDirection(
        { x: prevNode.x, y: prevNode.y },
        { x: currNode.x, y: currNode.y },
        { x: nextNode.x, y: nextNode.y }
      );

      if (turn !== 'straight') {
        const turnLabel = getTurnLabel(turn);
        milestones.push({
          id: `ms-${i}`,
          nodeId: currId,
          label: `${turnLabel} at ${currNode.label}`,
          subtext: `Floor ${currNode.floor} • Follow corridor towards ${nextNode.label}`,
          type: 'junction',
          action: turnLabel,
          icon: turn.includes('left') ? 'corner-up-left' : 'corner-up-right',
          floor: currNode.floor,
          coords: { x: currNode.x, y: currNode.y },
          distanceToNextMeters: segmentDistances[i] || 0,
          cumulativeDistanceMeters: getSpanDistance(0, i)
        });
        i++;
        continue;
      }
    }

    // Check for consecutive room pass-bys along hallway
    if (currNode.type === 'room') {
      const passedRooms: string[] = [currNode.roomNumber || currNode.label];
      const passedNodeIds: string[] = [currId];
      let j = i + 1;

      while (j < pathNodeIds.length - 1) {
        const candNode = nodes[pathNodeIds[j]];
        const candNext = nodes[pathNodeIds[j + 1]];
        if (
          candNode.type === 'room' &&
          candNode.floor === currNode.floor &&
          computeTurnDirection(
            { x: nodes[pathNodeIds[j - 1]].x, y: nodes[pathNodeIds[j - 1]].y },
            { x: candNode.x, y: candNode.y },
            { x: candNext.x, y: candNext.y }
          ) === 'straight'
        ) {
          passedRooms.push(candNode.roomNumber || candNode.label);
          passedNodeIds.push(pathNodeIds[j]);
          j++;
        } else {
          break;
        }
      }

      if (passedRooms.length > 1) {
        milestones.push({
          id: `ms-group-${i}`,
          nodeId: currId,
          nodeIds: passedNodeIds,
          label: `Walk straight — Pass ${passedRooms.join(', ')}`,
          subtext: `Floor ${currNode.floor} • ${passedRooms.length} consecutive rooms along corridor`,
          type: 'grouped_rooms',
          action: 'Pass',
          icon: 'arrow-up',
          floor: currNode.floor,
          coords: { x: currNode.x, y: currNode.y },
          distanceToNextMeters: getSpanDistance(i, j),
          cumulativeDistanceMeters: getSpanDistance(0, i),
          groupedRooms: passedRooms
        });
        i = j;
        continue;
      } else {
        milestones.push({
          id: `ms-${i}`,
          nodeId: currId,
          label: `Pass ${currNode.label}`,
          subtext: `Floor ${currNode.floor} • Keep straight along corridor`,
          type: 'room',
          action: 'Pass',
          icon: 'compass',
          floor: currNode.floor,
          coords: { x: currNode.x, y: currNode.y },
          distanceToNextMeters: segmentDistances[i] || 0,
          cumulativeDistanceMeters: getSpanDistance(0, i)
        });
        i++;
        continue;
      }
    }

    // Default intermediate step
    i++;
  }

  // 4. Add Destination Milestone
  const destNode = nodes[pathNodeIds[pathNodeIds.length - 1]];
  const totalMeters = getSpanDistance(0, pathNodeIds.length - 1);

  milestones.push({
    id: `ms-dest`,
    nodeId: pathNodeIds[pathNodeIds.length - 1],
    label: `Arrive at ${destNode.label}`,
    subtext: `Floor ${destNode.floor} • Destination reached on your ${destNode.x > 700 ? 'right' : 'left'}`,
    type: 'arrive',
    action: 'Arrive',
    icon: 'map-pin',
    floor: destNode.floor,
    coords: { x: destNode.x, y: destNode.y },
    distanceToNextMeters: 0,
    cumulativeDistanceMeters: totalMeters
  });

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
