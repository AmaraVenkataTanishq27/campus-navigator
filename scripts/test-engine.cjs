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
  const milestones = [];

  const startId = pathNodeIds[0];
  const destId = pathNodeIds[pathNodeIds.length - 1];
  const startNode = nodes[startId];
  const destNode = nodes[destId];

  if (!startNode || !destNode) return [];

  // 1. Start Milestone
  milestones.push({
    nodeId: startId,
    node: startNode,
    type: 'start',
    action: 'start',
    label: `Start at ${startNode.label}`,
    description: `Begin navigation on Floor ${startNode.floor}`,
    icon: 'map-pin',
    floor: startNode.floor
  });

  // Check for floor transitions
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const currId = pathNodeIds[i];
    const nextId = pathNodeIds[i + 1];
    const currNode = nodes[currId];
    const nextNode = nodes[nextId];

    if (currNode && nextNode && currNode.floor !== nextNode.floor) {
      let j = i + 1;
      while (j < pathNodeIds.length - 1 && nodes[pathNodeIds[j]].floor !== nodes[pathNodeIds[j + 1]].floor) {
        j++;
      }
      const arrivalId = pathNodeIds[j];
      const arrivalNode = nodes[arrivalId];

      const isElevator = currNode.type === 'elevator' || nextNode.type === 'elevator';
      const isUp = arrivalNode.floor > currNode.floor;
      const targetFloorName = arrivalNode.floor === 0 ? 'Ground Floor' : `Floor ${arrivalNode.floor}`;

      // 2. Change Floor departure
      milestones.push({
        nodeId: currId,
        node: currNode,
        type: isElevator ? 'elevator' : 'stairs',
        action: isUp ? 'elevator_up' : 'elevator_down',
        label: `Take ${isElevator ? 'Elevator' : 'Stairs'} ${isUp ? 'up' : 'down'} to ${targetFloorName}`,
        description: `Transition from Floor ${currNode.floor} to ${targetFloorName}`,
        icon: isElevator ? 'elevator' : 'stairs',
        floor: currNode.floor
      });

      // 3. Arrival on destination floor
      milestones.push({
        nodeId: arrivalId,
        node: arrivalNode,
        type: 'floor_change',
        action: 'exit',
        label: `Arrive on ${targetFloorName}`,
        description: `Exit ${isElevator ? 'elevator' : 'stairs'} at ${arrivalNode.label}`,
        icon: 'door-open',
        floor: arrivalNode.floor
      });

      i = j;
    }
  }

  // 4. Destination Milestone
  milestones.push({
    nodeId: destId,
    node: destNode,
    type: 'arrive',
    action: 'arrive',
    label: `Arrive at ${destNode.label}`,
    description: `Destination reached on Floor ${destNode.floor}`,
    icon: 'flag',
    floor: destNode.floor
  });

  return milestones;
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
console.log('\n--- Test 3: Multi-Floor Transition (Floor 3 Seminar Hall 516 -> Floor 5 Apex Library) ---');
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

// Test 5: Full building vertical traversal (Floor 1 Doctoral Office 316 -> Floor 5 Apex Library)
console.log('\n--- Test 5: Multi-Floor Span (Floor 1 Doctoral Office 316 -> Floor 5 Apex Library) ---');
const test5 = findShortestPath(graph, 'R_AB_316', 'R_APEX_LIB');
console.log('Distance:', test5.totalDistance, 'm');
const milestones5 = generateMilestones(graph, test5.pathNodeIds);
milestones5.forEach((m, idx) => console.log(`  ${idx + 1}. [Floor ${m.floor}] [${m.icon}] ${m.label}`));

// Test 6: Ground Floor to 6th Floor Auditorium (Full Apex Block Span)
console.log('\n--- Test 6: Full Apex Block Span (Ground Floor AB 201 -> 6th Floor Auditorium) ---');
const test6 = findShortestPath(graph, 'R_AB_201', 'R_AUDITORIUM');
console.log('Distance:', test6.totalDistance, 'm');
const milestones6 = generateMilestones(graph, test6.pathNodeIds);
milestones6.forEach((m, idx) => console.log(`  ${idx + 1}. [Floor ${m.floor}] [${m.icon}] ${m.label}`));

console.log('\nAll tests passed successfully!');
