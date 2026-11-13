import { NavNode, NavEdge, CalculatedRoute, TurnInstruction, UserPreferences } from '../types';
import { NAVIGATION_GRAPH } from '../data/campusData';

interface PriorityQueueItem {
  nodeId: string;
  priority: number;
}

class SimplePriorityQueue {
  private items: PriorityQueueItem[] = [];

  enqueue(nodeId: string, priority: number) {
    this.items.push({ nodeId, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): string | undefined {
    return this.items.shift()?.nodeId;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export const NavigationService = {
  getNodes(): NavNode[] {
    return NAVIGATION_GRAPH.nodes;
  },

  getEdges(): NavEdge[] {
    return NAVIGATION_GRAPH.edges;
  },

  getNodeById(id: string): NavNode | undefined {
    return NAVIGATION_GRAPH.nodes.find((n) => n.id === id);
  },

  findNearestNode(x: number, y: number, floorLevel: string): NavNode | undefined {
    const floorNodes = NAVIGATION_GRAPH.nodes.filter((n) => n.floorLevel === floorLevel);
    if (floorNodes.length === 0) return undefined;

    let nearest = floorNodes[0];
    let minDist = Infinity;

    for (const node of floorNodes) {
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = node;
      }
    }
    return nearest;
  },

  calculateRoute(
    startNodeId: string,
    targetNodeId: string,
    preferences: Partial<UserPreferences> = {}
  ): CalculatedRoute | null {
    const nodesMap = new Map<string, NavNode>();
    for (const n of NAVIGATION_GRAPH.nodes) {
      nodesMap.set(n.id, n);
    }

    const startNode = nodesMap.get(startNodeId);
    const targetNode = nodesMap.get(targetNodeId);

    if (!startNode || !targetNode) {
      return null;
    }

    // Adjacency graph (undirected edges for corridors/doors, directional if needed)
    const adj = new Map<string, Array<{ to: string; edge: NavEdge }>>();
    for (const n of NAVIGATION_GRAPH.nodes) {
      adj.set(n.id, []);
    }

    for (const edge of NAVIGATION_GRAPH.edges) {
      // Filter out inaccessible paths if preference active
      if (preferences.wheelchairAccessible && !edge.isAccessible) {
        continue;
      }
      if (preferences.avoidStairs && edge.edgeType === 'stairs') {
        continue;
      }

      adj.get(edge.from)?.push({ to: edge.to, edge });
      adj.get(edge.to)?.push({ to: edge.from, edge });
    }

    // A* Pathfinding
    const openSet = new SimplePriorityQueue();
    const cameFrom = new Map<string, { prevNodeId: string; edge: NavEdge }>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    for (const n of NAVIGATION_GRAPH.nodes) {
      gScore.set(n.id, Infinity);
      fScore.set(n.id, Infinity);
    }

    gScore.set(startNodeId, 0);

    const heuristic = (n1: NavNode, n2: NavNode) => {
      const floorDiff = Math.abs(parseInt(n1.floorLevel || '0', 10) - parseInt(n2.floorLevel || '0', 10));
      const dist2D = Math.hypot(n1.x - n2.x, n1.y - n2.y) * 0.065; // ~0.065m per pixel
      return dist2D + floorDiff * 15; // 15m penalty per floor difference
    };

    fScore.set(startNodeId, heuristic(startNode, targetNode));
    openSet.enqueue(startNodeId, fScore.get(startNodeId)!);

    const visited = new Set<string>();

    while (!openSet.isEmpty()) {
      const currentId = openSet.dequeue()!;

      if (currentId === targetNodeId) {
        // Reconstruct path
        return this.reconstructPath(cameFrom, currentId, startNode, targetNode);
      }

      visited.add(currentId);
      const currentNode = nodesMap.get(currentId)!;
      const neighbors = adj.get(currentId) || [];

      for (const { to: neighborId, edge } of neighbors) {
        if (visited.has(neighborId)) continue;

        let edgeCost = edge.distance;
        if (preferences.avoidStairs && edge.edgeType === 'stairs') {
          edgeCost += 1000;
        }

        const tentativeG = (gScore.get(currentId) || Infinity) + edgeCost;

        if (tentativeG < (gScore.get(neighborId) || Infinity)) {
          cameFrom.set(neighborId, { prevNodeId: currentId, edge });
          gScore.set(neighborId, tentativeG);
          const neighborNode = nodesMap.get(neighborId)!;
          const newF = tentativeG + heuristic(neighborNode, targetNode);
          fScore.set(neighborId, newF);
          openSet.enqueue(neighborId, newF);
        }
      }
    }

    return null; // No route found
  },

  reconstructPath(
    cameFrom: Map<string, { prevNodeId: string; edge: NavEdge }>,
    currentId: string,
    startNode: NavNode,
    targetNode: NavNode
  ): CalculatedRoute {
    const pathNodes: NavNode[] = [];
    const pathEdges: NavEdge[] = [];
    const polylineCoordinates: { x: number; y: number; floorLevel: string }[] = [];

    const nodesMap = new Map<string, NavNode>();
    for (const n of NAVIGATION_GRAPH.nodes) {
      nodesMap.set(n.id, n);
    }

    let curr: string | undefined = currentId;
    while (curr) {
      const node = nodesMap.get(curr);
      if (node) {
        pathNodes.unshift(node);
        polylineCoordinates.unshift({ x: node.x, y: node.y, floorLevel: node.floorLevel });
      }
      const prevData = cameFrom.get(curr);
      if (prevData) {
        pathEdges.unshift(prevData.edge);
        curr = prevData.prevNodeId;
      } else {
        curr = undefined;
      }
    }

    const totalDistanceMeters = Math.round(
      pathEdges.reduce((sum, e) => sum + e.distance, 0)
    );
    // Average indoor walking speed: ~1.2 m/s -> ~72 m/min
    const estimatedTimeMinutes = Math.max(1, Math.ceil(totalDistanceMeters / 70));

    const instructions = this.generateTurnInstructions(pathNodes, pathEdges, targetNode);

    const transitsFloors = startNode.floorLevel !== targetNode.floorLevel;
    const isAccessible = pathEdges.every((e) => e.isAccessible);

    return {
      pathNodes,
      pathEdges,
      polylineCoordinates,
      totalDistanceMeters,
      estimatedTimeMinutes,
      instructions,
      isAccessible,
      isDemonstration: true, // Clearly marked as per requirements until field validation
      startFloor: startNode.floorLevel,
      endFloor: targetNode.floorLevel,
      transitsFloors,
    };
  },

  generateTurnInstructions(
    nodes: NavNode[],
    edges: NavEdge[],
    targetNode: NavNode
  ): TurnInstruction[] {
    const instructions: TurnInstruction[] = [];
    if (nodes.length < 2) return instructions;

    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      const edge = edges[i];

      // Handle floor transitions
      if (edge && (edge.edgeType === 'elevator' || edge.edgeType === 'stairs')) {
        const isUp = parseInt(next.floorLevel || '0', 10) > parseInt(curr.floorLevel || '0', 10);
        instructions.push({
          id: `step_${i}`,
          instruction: edge.edgeType === 'elevator'
            ? `Take the elevator ${isUp ? 'up' : 'down'} to Floor ${next.floorLevel}`
            : `Take the staircase ${isUp ? 'up' : 'down'} to Floor ${next.floorLevel}`,
          distanceMeters: Math.round(edge.distance),
          direction: edge.edgeType === 'elevator'
            ? (isUp ? 'elevator_up' : 'elevator_down')
            : (isUp ? 'stairs_up' : 'stairs_down'),
          floorLevel: curr.floorLevel,
          targetNodeId: next.id,
        });
        continue;
      }

      // Check turning angle if there's a previous node
      if (i > 0) {
        const prev = nodes[i - 1];
        const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };

        const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
        let degrees = (angle * 180) / Math.PI;
        while (degrees > 180) degrees -= 360;
        while (degrees < -180) degrees += 360;

        let direction: TurnInstruction['direction'] = 'straight';
        let text = `Go straight for ${Math.round(edge?.distance || 15)} m`;

        if (degrees > 40 && degrees < 140) {
          direction = 'right';
          text = `Turn right at ${curr.label || 'the junction'}`;
        } else if (degrees < -40 && degrees > -140) {
          direction = 'left';
          text = `Turn left at ${curr.label || 'the junction'}`;
        }

        instructions.push({
          id: `step_${i}`,
          instruction: text,
          distanceMeters: Math.round(edge?.distance || 15),
          direction,
          floorLevel: curr.floorLevel,
          targetNodeId: next.id,
        });
      } else {
        // First step
        instructions.push({
          id: `step_0`,
          instruction: `Go straight for ${Math.round(edge?.distance || 25)} m (${curr.label})`,
          distanceMeters: Math.round(edge?.distance || 25),
          direction: 'straight',
          floorLevel: curr.floorLevel,
          targetNodeId: next.id,
        });
      }
    }

    // Final arrival instruction
    instructions.push({
      id: `step_final`,
      instruction: `You have arrived! ${targetNode.label} is on your left.`,
      distanceMeters: 0,
      direction: 'arrived',
      floorLevel: targetNode.floorLevel,
      targetNodeId: targetNode.id,
    });

    return instructions;
  },

  getDemoRouteAB608(): CalculatedRoute {
    // Demonstration route matching Screen 3 and Screen 4 exactly
    const calculated = this.calculateRoute('AB_F6_ENTRANCE_MAIN', 'AB_F6_NODE_DOOR_608');
    if (calculated) {
      return calculated;
    }

    // Fallback static route
    return {
      pathNodes: [],
      pathEdges: [],
      polylineCoordinates: [
        { x: 1120, y: 1100, floorLevel: '6' },
        { x: 1120, y: 920, floorLevel: '6' },
        { x: 1120, y: 730, floorLevel: '6' },
        { x: 1120, y: 500, floorLevel: '6' },
        { x: 1120, y: 300, floorLevel: '6' },
        { x: 1040, y: 300, floorLevel: '6' },
        { x: 1040, y: 200, floorLevel: '6' },
      ],
      totalDistanceMeters: 85,
      estimatedTimeMinutes: 2,
      instructions: [
        { id: '1', instruction: 'Go straight for 25 m (East Corridor)', distanceMeters: 25, direction: 'straight', floorLevel: '6', targetNodeId: 'AB_F6_CORR_E3' },
        { id: '2', instruction: 'Turn right at the junction', distanceMeters: 15, direction: 'right', floorLevel: '6', targetNodeId: 'AB_F6_CORR_E2' },
        { id: '3', instruction: 'Go straight for 30 m', distanceMeters: 30, direction: 'straight', floorLevel: '6', targetNodeId: 'AB_F6_CORR_E1' },
        { id: '4', instruction: 'Turn right towards AB 608', distanceMeters: 15, direction: 'right', floorLevel: '6', targetNodeId: 'AB_F6_CORR_N4' },
        { id: '5', instruction: 'You have arrived! AB 608 is on your left.', distanceMeters: 0, direction: 'arrived', floorLevel: '6', targetNodeId: 'AB_F6_NODE_DOOR_608' },
      ],
      isAccessible: true,
      isDemonstration: true,
      startFloor: '6',
      endFloor: '6',
      transitsFloors: false,
    };
  },
};
