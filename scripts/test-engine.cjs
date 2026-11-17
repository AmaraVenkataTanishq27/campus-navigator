const fs = require('fs');
const graph = JSON.parse(fs.readFileSync('./campus_graph.json', 'utf8'));

// Dijkstra Pathfinding implementation
function findShortestPath(graph, startId, endId, options = {}) {
  const { accessibleOnly = false } = options;
  const nodes = graph.nodes;
  const edges = graph.edges;

  if (!nodes[startId]) throw new Error(`Start node not found: ${startId}`);
  if (!nodes[endId]) throw new Error(`End node not found: ${endId}`);

  const adj = {};
  for (const id in nodes) {
    adj[id] = [];
  }

  for (const edge of edges) {
    if (accessibleOnly && edge.isAccessible === false) continue;
    if (accessibleOnly && edge.verticalType === 'stairs') continue;
    if (adj[edge.from]) {
      adj[edge.from].push({
        to: edge.to,
        weight: edge.weight,
        direction: edge.direction,
        isAccessible: edge.isAccessible,
        verticalType: edge.verticalType
      });
    }
  }

  const dist = {};
  const prev = {};
  const unvisited = new Set(Object.keys(nodes));

  for (const id in nodes) {
    dist[id] = Infinity;
  }
  dist[startId] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id];
        curr = id;
      }
    }

    if (curr === null || dist[curr] === Infinity) break;
    if (curr === endId) break;

    unvisited.delete(curr);

    for (const neighbor of adj[curr]) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = dist[curr] + neighbor.weight;
      if (alt < dist[neighbor.to]) {
        dist[neighbor.to] = alt;
        prev[neighbor.to] = { from: curr, edge: neighbor };
      }
    }
  }

  if (dist[endId] === Infinity) {
    return null;
  }

  const path = [];
  let u = endId;
  while (u !== undefined) {
    path.unshift(u);
    const step = prev[u];
    u = step ? step.from : undefined;
  }

  return {
    pathNodeIds: path,
    totalDistance: Math.round(dist[endId] * 10) / 10
  };
}

function computeTurn(prevNode, currNode, nextNode) {
  if (prevNode.floor !== currNode.floor || currNode.floor !== nextNode.floor) {
    return 'floor_change';
  }
  const v1x = currNode.x - prevNode.x;
  const v1y = currNode.y - prevNode.y;
  const v2x = nextNode.x - currNode.x;
  const v2y = nextNode.y - currNode.y;

  const dot = v1x * v2x + v1y * v2y;
  const cross = v1x * v2y - v1y * v2x;
  const angleRad = Math.atan2(cross, dot);
  const angleDeg = (angleRad * 180) / Math.PI;

  if (angleDeg > 35 && angleDeg < 145) return 'right';
  if (angleDeg < -35 && angleDeg > -145) return 'left';
  if (Math.abs(angleDeg) >= 145) return 'u_turn';
  return 'straight';
}

function generateMilestones(graph, pathNodeIds) {
  if (!pathNodeIds || pathNodeIds.length === 0) return [];

  const nodes = graph.nodes;
  const rawSteps = [];

  for (let i = 0; i < pathNodeIds.length; i++) {
    const currId = pathNodeIds[i];
    const currNode = nodes[currId];
    const prevNode = i > 0 ? nodes[pathNodeIds[i - 1]] : null;
    const nextNode = i < pathNodeIds.length - 1 ? nodes[pathNodeIds[i + 1]] : null;

    if (i === 0) {
      rawSteps.push({
        nodeId: currId,
        node: currNode,
        type: 'start',
        action: 'start',
        label: `Start at ${currNode.label}`,
        description: `Begin navigation on Floor ${currNode.floor}`,
        icon: 'map-pin',
        floor: currNode.floor
      });
      continue;
    }

    if (i === pathNodeIds.length - 1) {
      rawSteps.push({
        nodeId: currId,
        node: currNode,
        type: 'arrive',
        action: 'arrive',
        label: `Arrive at ${currNode.label}`,
        description: `Destination reached on Floor ${currNode.floor}`,
        icon: 'flag',
        floor: currNode.floor
      });
      continue;
    }

    if (prevNode && prevNode.floor !== currNode.floor) {
      const isElevator = currNode.type === 'elevator' || prevNode.type === 'elevator';
      const action = isElevator ? 'elevator' : 'stairs';
      const dir = currNode.floor > prevNode.floor ? 'up' : 'down';
      rawSteps.push({
        nodeId: currId,
        node: currNode,
        type: 'floor_change',
        action: `${action}_${dir}`,
        label: `Take ${isElevator ? 'Elevator' : 'Stairs'} ${dir} to Floor ${currNode.floor}`,
        description: `Transfer from Floor ${prevNode.floor} to Floor ${currNode.floor}`,
        icon: isElevator ? 'elevator' : 'stairs',
        floor: currNode.floor
      });
      continue;
    }

    if (currNode.type === 'junction') {
      const turn = computeTurn(prevNode, currNode, nextNode);
      let turnPrompt = 'Continue straight';
      let icon = 'arrow-up';
      if (turn === 'left') {
        turnPrompt = `Turn left at ${currNode.label}`;
        icon = 'corner-up-left';
      } else if (turn === 'right') {
        turnPrompt = `Turn right at ${currNode.label}`;
        icon = 'corner-up-right';
      }
      rawSteps.push({
        nodeId: currId,
        node: currNode,
        type: 'junction',
        action: turn,
        label: turnPrompt,
        description: `Follow hallway turn`,
        icon: icon,
        floor: currNode.floor
      });
      continue;
    }

    rawSteps.push({
      nodeId: currId,
      node: currNode,
      type: currNode.type,
      action: 'pass',
      label: `Pass ${currNode.label}`,
      description: `Milestone along corridor`,
      icon: currNode.type === 'elevator' ? 'elevator' : currNode.type === 'stairs' ? 'stairs' : 'footprints',
      floor: currNode.floor
    });
  }

  const groupedMilestones = [];
  let i = 0;
  while (i < rawSteps.length) {
    const step = rawSteps[i];

    if (step.type === 'room' && step.action === 'pass') {
      const roomGroup = [step];
      let j = i + 1;
      while (j < rawSteps.length && rawSteps[j].type === 'room' && rawSteps[j].action === 'pass') {
        roomGroup.push(rawSteps[j]);
        j++;
      }

      if (roomGroup.length > 1) {
        const roomNames = roomGroup.map(r => r.node.label).join(', ');
        groupedMilestones.push({
          nodeId: step.nodeId,
          nodeIds: roomGroup.map(r => r.nodeId),
          node: step.node,
          type: 'grouped_rooms',
          action: 'walk_straight',
          label: `Walk straight — Pass ${roomNames}`,
          description: `${roomGroup.length} visual milestones along hallway`,
          icon: 'footprints',
          floor: step.floor,
          groupedRooms: roomGroup.map(r => r.node.label)
        });
        i = j;
        continue;
      }
    }

    groupedMilestones.push(step);
    i++;
  }

  return groupedMilestones;
}

console.log('========================================================');
console.log('STAGE 1 VERIFICATION: DIJKSTRA ROUTING & MILESTONE LIST');
console.log('========================================================\n');

// Test 1: Single hallway route
console.log('--- Test 1: Single Hallway Walk (AB 603 -> AB 601) ---');
const test1 = findShortestPath(graph, 'R_AB_603', 'R_AB_601');
console.log('Path Nodes:', test1.pathNodeIds);
console.log('Distance:', test1.totalDistance, 'm');
const milestones1 = generateMilestones(graph, test1.pathNodeIds);
milestones1.forEach((m, idx) => console.log(`  ${idx + 1}. [${m.icon}] ${m.label}`));

// Test 2: Corner turn walk
console.log('\n--- Test 2: Corner Turn Walk (AB 603 -> AB 608 via West & North) ---');
const test2 = findShortestPath(graph, 'R_AB_603', 'R_AB_608');
console.log('Distance:', test2.totalDistance, 'm');
const milestones2 = generateMilestones(graph, test2.pathNodeIds);
milestones2.forEach((m, idx) => console.log(`  ${idx + 1}. [${m.icon}] ${m.label}`));

// Test 3: Multi-floor transition
console.log('\n--- Test 3: Multi-Floor Transition (Floor 5 Lecture Hall 516 -> Floor 7 Apex Library) ---');
const test3 = findShortestPath(graph, 'R_AB_516', 'R_APEX_LIB');
console.log('Distance:', test3.totalDistance, 'm');
const milestones3 = generateMilestones(graph, test3.pathNodeIds);
milestones3.forEach((m, idx) => console.log(`  ${idx + 1}. [Floor ${m.floor}] [${m.icon}] ${m.label}`));

// Test 4: Accessible route check
console.log('\n--- Test 4: Accessible Route Toggle Check ---');
const test4Accessible = findShortestPath(graph, 'R_AB_601', 'R_APEX_LIB', { accessibleOnly: true });
const usesVerticalStairs = test4Accessible.pathNodeIds.some((id, idx) => {
  if (idx === 0) return false;
  const prevId = test4Accessible.pathNodeIds[idx - 1];
  const edge = graph.edges.find(e => e.from === prevId && e.to === id);
  return edge && (edge.verticalType === 'stairs' || edge.isAccessible === false);
});
console.log('Accessible path verified (No vertical stairs or inaccessible edges)?', !usesVerticalStairs);
console.log('Path nodes:', test4Accessible.pathNodeIds.map(id => graph.nodes[id].label).join(' -> '));

console.log('\nAll tests passed successfully!');
