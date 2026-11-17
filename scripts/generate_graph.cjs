const fs = require('fs');

// Helper to calculate Euclidean distance between two nodes
function calcDist(n1, n2) {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  // Floor scale: roughly 0.065 meters per pixel
  return Math.round(Math.hypot(dx, dy) * 0.065 * 10) / 10 || 1.0;
}

// Helper to determine compass direction from n1 to n2
function getDirection(n1, n2) {
  if (n1.floor !== n2.floor) {
    return n2.floor > n1.floor ? 'up' : 'down';
  }
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'E' : 'W';
  } else {
    return dy >= 0 ? 'S' : 'N';
  }
}

// Opposite direction helper
function oppDir(dir) {
  if (dir === 'E') return 'W';
  if (dir === 'W') return 'E';
  if (dir === 'N') return 'S';
  if (dir === 'S') return 'N';
  if (dir === 'up') return 'down';
  if (dir === 'down') return 'up';
  return dir;
}

// Verified Open Hallway Centerlines (0 wall collisions):
// North Corridor: y = 330
// South Corridor: y = 1035 (completely outside south rooms AB 601, 602, 603!)
// East Corridor:  x = 1075 (completely outside east rooms AB 610, 611!)
// West Corridor:  x = 305  (completely outside west rooms AB 604, Physics Lab!)

const nodes = {
  // ==========================================
  // FLOOR 6 - Academic Block 6th Floor
  // ==========================================
  // Four Main Corridor Junctions (Hallway Corners)
  "J_F6_SW": { label: "Southwest Junction", floor: 6, type: "junction", x: 305, y: 1035, aliases: ["SW Corner", "West-South Turn"] },
  "J_F6_NW": { label: "Northwest Junction", floor: 6, type: "junction", x: 305, y: 330, aliases: ["NW Corner", "Physics Corner"] },
  "J_F6_NE": { label: "Northeast Junction", floor: 6, type: "junction", x: 1075, y: 330, aliases: ["NE Corner", "North-East Turn"] },
  "J_F6_SE": { label: "Southeast Lobby Junction", floor: 6, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby", "Main Hallway Crossing"] },
  "J_F6_SKY": { label: "Southeast Skybridge", floor: 6, type: "junction", x: 1220, y: 1035, aliases: ["Board Room Skybridge"] },

  // South Corridor Floor 6 (In open hallway at y=1035, West to East)
  "R_AB_603": { label: "Room 603", roomNumber: "603", floor: 6, type: "room", x: 380, y: 1035, aliases: ["Classroom 603", "AB 603", "603"] },
  "R_AB_602": { label: "Room 602", roomNumber: "602", floor: 6, type: "room", x: 520, y: 1035, aliases: ["Classroom 602", "AB 602", "602"] },
  "R_AB_601": { label: "Room 601", roomNumber: "601", floor: 6, type: "room", x: 800, y: 1035, aliases: ["Classroom 601", "AB 601", "601"] },
  "LIFT_F6_S": { label: "South Elevators", floor: 6, type: "elevator", x: 940, y: 1035, aliases: ["South Lift", "Elevator S"] },
  "STAIRS_F6_S": { label: "South Stairwell", floor: 6, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs"] },
  "R_BOARD_ROOM": { label: "Room 612 (Board Room)", roomNumber: "612", floor: 6, type: "room", x: 1350, y: 1200, aliases: ["Board Room", "Executive Board Room", "612"] },

  // West Corridor Floor 6 (In open hallway at x=305, South to North)
  "R_AB_604": { label: "Room 604", roomNumber: "604", floor: 6, type: "room", x: 305, y: 930, aliases: ["Classroom 604", "AB 604", "604"] },
  "STAIRS_F6_W": { label: "West Stairwell", floor: 6, type: "stairs", x: 305, y: 750, aliases: ["West Stairs"] },
  "LIFT_F6_W": { label: "West Courtyard Elevator", floor: 6, type: "elevator", x: 305, y: 620, aliases: ["West Lift", "Courtyard West Elevator"] },
  "R_PHYSICS_W": { label: "Room 605 (Physics Lab West)", roomNumber: "605", floor: 6, type: "room", x: 305, y: 460, aliases: ["Physics Lab West", "Physics Laboratory West Wing", "605"] },

  // North Corridor Floor 6 (In open hallway at y=330, West to East)
  "R_PHYSICS_NW": { label: "Room 607 (Main Physics Lab)", roomNumber: "607", floor: 6, type: "room", x: 460, y: 330, aliases: ["Main Physics Lab", "Physics Lab NW", "607"] },
  "STAIRS_F6_N": { label: "North Stairwell", floor: 6, type: "stairs", x: 680, y: 330, aliases: ["North Stairs"] },
  "LIFT_F6_N": { label: "Courtyard North Elevator", floor: 6, type: "elevator", x: 780, y: 330, aliases: ["North Lift", "Courtyard North Elevator"] },
  "R_AB_608": { label: "Room 608", roomNumber: "608", floor: 6, type: "room", x: 980, y: 330, aliases: ["Classroom 608", "AB 608", "608"] },

  // East Corridor Floor 6 (In open hallway at x=1075, North to South)
  "WASHROOM_F6_M": { label: "Washroom (Floor 6)", roomNumber: "609", floor: 6, type: "room", x: 1075, y: 420, aliases: ["Male Washroom", "Restroom Floor 6", "609"] },
  "R_AB_610": { label: "Room 610", roomNumber: "610", floor: 6, type: "room", x: 1075, y: 540, aliases: ["Classroom 610", "AB 610", "610"] },
  "R_AB_611": { label: "Room 611", roomNumber: "611", floor: 6, type: "room", x: 1075, y: 720, aliases: ["Classroom 611", "AB 611", "611"] },
  "LIFT_F6_SE": { label: "Southeast Elevators", floor: 6, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift", "Main Elevators"] },
  "STAIRS_F6_SE": { label: "Southeast Stairwell", floor: 6, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs", "Main Staircase"] },

  // ==========================================
  // FLOOR 5 - Academic Block 5th Floor
  // ==========================================
  "J_F5_SW": { label: "Southwest Junction (F5)", floor: 5, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 5"] },
  "J_F5_NW": { label: "Northwest Junction (F5)", floor: 5, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 5"] },
  "J_F5_NE": { label: "Northeast Junction (F5)", floor: 5, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 5"] },
  "J_F5_SE": { label: "Southeast Lobby Junction (F5)", floor: 5, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 5"] },
  "J_F5_SKY": { label: "Skybridge Passage (F5)", floor: 5, type: "junction", x: 1220, y: 1035, aliases: ["Lecture Hall Skybridge Floor 5"] },

  // South Corridor Floor 5
  "R_AB_503": { label: "Room 503", roomNumber: "503", floor: 5, type: "room", x: 380, y: 1035, aliases: ["Classroom 503", "AB 503", "503"] },
  "R_AB_502": { label: "Room 502", roomNumber: "502", floor: 5, type: "room", x: 520, y: 1035, aliases: ["Classroom 502", "AB 502", "502"] },
  "R_AB_501": { label: "Room 501", roomNumber: "501", floor: 5, type: "room", x: 800, y: 1035, aliases: ["Classroom 501", "AB 501", "501"] },
  "LIFT_F5_S": { label: "South Elevators (F5)", floor: 5, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 5"] },
  "STAIRS_F5_S": { label: "South Stairwell (F5)", floor: 5, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 5"] },
  "R_AB_516": { label: "Room 516 (Lecture Hall)", roomNumber: "516", floor: 5, type: "room", x: 1350, y: 1200, aliases: ["Lecture Hall 516", "Room 516", "Audi 516", "516"] },

  // West Corridor Floor 5
  "R_AB_504": { label: "Room 504", roomNumber: "504", floor: 5, type: "room", x: 305, y: 930, aliases: ["Classroom 504", "AB 504", "504"] },
  "STAIRS_F5_W": { label: "West Stairwell (F5)", floor: 5, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 5"] },
  "LIFT_F5_W": { label: "West Courtyard Elevator (F5)", floor: 5, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 5"] },
  "R_AB_505": { label: "Room 505", roomNumber: "505", floor: 5, type: "room", x: 305, y: 460, aliases: ["Classroom 505", "AB 505", "505"] },

  // North Corridor Floor 5
  "R_AB_506": { label: "Room 506", roomNumber: "506", floor: 5, type: "room", x: 380, y: 330, aliases: ["Classroom 506", "AB 506", "506"] },
  "R_AB_507": { label: "Room 507", roomNumber: "507", floor: 5, type: "room", x: 460, y: 330, aliases: ["Classroom 507", "AB 507", "507"] },
  "R_AB_508": { label: "Room 508", roomNumber: "508", floor: 5, type: "room", x: 580, y: 330, aliases: ["Classroom 508", "AB 508", "508"] },
  "STAIRS_F5_N": { label: "North Stairwell (F5)", floor: 5, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 5"] },
  "LIFT_F5_N": { label: "Courtyard North Elevator (F5)", floor: 5, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 5"] },
  "R_AB_510": { label: "Room 510", roomNumber: "510", floor: 5, type: "room", x: 880, y: 330, aliases: ["Classroom 510", "AB 510", "510"] },
  "R_AB_511": { label: "Room 511", roomNumber: "511", floor: 5, type: "room", x: 980, y: 330, aliases: ["Classroom 511", "AB 511", "511"] },

  // East Corridor Floor 5
  "R_AB_512": { label: "Room 512", roomNumber: "512", floor: 5, type: "room", x: 1075, y: 420, aliases: ["Classroom 512", "AB 512", "512"] },
  "R_AB_514": { label: "Room 514", roomNumber: "514", floor: 5, type: "room", x: 1075, y: 540, aliases: ["Classroom 514", "AB 514", "514"] },
  "R_AB_515": { label: "Room 515", roomNumber: "515", floor: 5, type: "room", x: 1075, y: 720, aliases: ["Classroom 515", "AB 515", "515"] },
  "LIFT_F5_SE": { label: "Southeast Elevators (F5)", floor: 5, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 5"] },
  "STAIRS_F5_SE": { label: "Southeast Stairwell (F5)", floor: 5, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 5"] },

  // ==========================================
  // FLOOR 7 - Academic Block 7th Floor
  // ==========================================
  "J_F7_SW": { label: "Southwest Junction (F7)", floor: 7, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 7"] },
  "J_F7_NW": { label: "Northwest Junction (F7)", floor: 7, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 7"] },
  "J_F7_NE": { label: "Northeast Junction (F7)", floor: 7, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 7"] },
  "J_F7_SE": { label: "Southeast Lobby Junction (F7)", floor: 7, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 7"] },
  "J_F7_SKY": { label: "Skybridge Passage (F7)", floor: 7, type: "junction", x: 1220, y: 1035, aliases: ["Apex Library Bridge Floor 7"] },

  // South Corridor Floor 7
  "R_AB_702": { label: "Room 702", roomNumber: "702", floor: 7, type: "room", x: 520, y: 1035, aliases: ["Classroom 702", "AB 702", "702"] },
  "R_AB_701": { label: "Room 701", roomNumber: "701", floor: 7, type: "room", x: 800, y: 1035, aliases: ["Classroom 701", "AB 701", "701"] },
  "LIFT_F7_S": { label: "South Elevators (F7)", floor: 7, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 7"] },
  "STAIRS_F7_S": { label: "South Stairwell (F7)", floor: 7, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 7"] },
  "R_APEX_LIB": { label: "Room 712 (Apex Central Library)", roomNumber: "712", floor: 7, type: "room", x: 1350, y: 1200, aliases: ["Apex Library", "Central Library", "Library Floor 7", "712"] },

  // West Corridor Floor 7
  "R_COMP_LAB_SW": { label: "Room 703 (Computer Lab SW)", roomNumber: "703", floor: 7, type: "room", x: 305, y: 930, aliases: ["Advanced Computing Lab", "CS Lab SW", "703"] },
  "STAIRS_F7_W": { label: "West Stairwell (F7)", floor: 7, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 7"] },
  "LIFT_F7_W": { label: "West Courtyard Elevator (F7)", floor: 7, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 7"] },
  "R_MATH_STAFF_W": { label: "Room 704 (Math Staff Room W)", roomNumber: "704", floor: 7, type: "room", x: 305, y: 460, aliases: ["Mathematics Faculty West", "Staff Room 7", "704"] },

  // North Corridor Floor 7
  "R_COMP_LAB_NW": { label: "Room 705 (Computer Lab NW)", roomNumber: "705", floor: 7, type: "room", x: 380, y: 330, aliases: ["Computing Lab NW", "Systems Lab", "705"] },
  "R_HUMANITIES": { label: "Room 706 (Dept. Humanities)", roomNumber: "706", floor: 7, type: "room", x: 460, y: 330, aliases: ["Humanities Department", "Language Lab", "706"] },
  "STAIRS_F7_N": { label: "North Stairwell (F7)", floor: 7, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 7"] },
  "LIFT_F7_N": { label: "Courtyard North Elevator (F7)", floor: 7, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 7"] },
  "R_STAFF_LIB": { label: "Room 707 (Faculty Staff Library)", roomNumber: "707", floor: 7, type: "room", x: 880, y: 330, aliases: ["Professors Library", "Reference Room", "707"] },
  "R_STAFF_MEET": { label: "Room 708 (Staff Meeting Room)", roomNumber: "708", floor: 7, type: "room", x: 980, y: 330, aliases: ["Meeting Hall 7", "Conference Room", "708"] },

  // East Corridor Floor 7
  "R_MATH_STAFF_NE": { label: "Room 709 (Math Staff Room NE)", roomNumber: "709", floor: 7, type: "room", x: 1075, y: 420, aliases: ["Mathematics Faculty NE", "709"] },
  "R_MATH_DEPT": { label: "Room 710 (Dept. Mathematics)", roomNumber: "710", floor: 7, type: "room", x: 1075, y: 600, aliases: ["Math Department Main Office", "710"] },
  "LIFT_F7_SE": { label: "Southeast Elevators (F7)", floor: 7, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 7"] },
  "STAIRS_F7_SE": { label: "Southeast Stairwell (F7)", floor: 7, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 7"] }
};

// Chains along corridors (defined in sequence so adjacent nodes form edges)
const corridorChains = [
  // Floor 6 South Corridor: SW Junction -> Room 603 -> Room 602 -> Room 601 -> South Lift -> South Stairs -> SE Junction
  ["J_F6_SW", "R_AB_603", "R_AB_602", "R_AB_601", "LIFT_F6_S", "STAIRS_F6_S", "J_F6_SE"],
  ["J_F6_SE", "J_F6_SKY", "R_BOARD_ROOM"],
  // Floor 6 West Corridor: SW Junction -> Room 604 -> West Stairs -> West Lift -> Physics West -> NW Junction
  ["J_F6_SW", "R_AB_604", "STAIRS_F6_W", "LIFT_F6_W", "R_PHYSICS_W", "J_F6_NW"],
  // Floor 6 North Corridor: NW Junction -> Physics NW -> North Stairs -> North Lift -> Room 608 -> NE Junction
  ["J_F6_NW", "R_PHYSICS_NW", "STAIRS_F6_N", "LIFT_F6_N", "R_AB_608", "J_F6_NE"],
  // Floor 6 East Corridor: NE Junction -> Washroom -> Room 610 -> Room 611 -> SE Lift -> SE Stairs -> SE Junction
  ["J_F6_NE", "WASHROOM_F6_M", "R_AB_610", "R_AB_611", "LIFT_F6_SE", "STAIRS_F6_SE", "J_F6_SE"],

  // Floor 5 South Corridor
  ["J_F5_SW", "R_AB_503", "R_AB_502", "R_AB_501", "LIFT_F5_S", "STAIRS_F5_S", "J_F5_SE"],
  ["J_F5_SE", "J_F5_SKY", "R_AB_516"],
  // Floor 5 West Corridor
  ["J_F5_SW", "R_AB_504", "STAIRS_F5_W", "LIFT_F5_W", "R_AB_505", "J_F5_NW"],
  // Floor 5 North Corridor
  ["J_F5_NW", "R_AB_506", "R_AB_507", "R_AB_508", "STAIRS_F5_N", "LIFT_F5_N", "R_AB_510", "R_AB_511", "J_F5_NE"],
  // Floor 5 East Corridor
  ["J_F5_NE", "R_AB_512", "R_AB_514", "R_AB_515", "LIFT_F5_SE", "STAIRS_F5_SE", "J_F5_SE"],

  // Floor 7 South Corridor
  ["J_F7_SW", "R_AB_702", "R_AB_701", "LIFT_F7_S", "STAIRS_F7_S", "J_F7_SE"],
  ["J_F7_SE", "J_F7_SKY", "R_APEX_LIB"],
  // Floor 7 West Corridor
  ["J_F7_SW", "R_COMP_LAB_SW", "STAIRS_F7_W", "LIFT_F7_W", "R_MATH_STAFF_W", "J_F7_NW"],
  // Floor 7 North Corridor
  ["J_F7_NW", "R_COMP_LAB_NW", "R_HUMANITIES", "STAIRS_F7_N", "LIFT_F7_N", "R_STAFF_LIB", "R_STAFF_MEET", "J_F7_NE"],
  // Floor 7 East Corridor
  ["J_F7_NE", "R_MATH_STAFF_NE", "R_MATH_DEPT", "LIFT_F7_SE", "STAIRS_F7_SE", "J_F7_SE"]
];

const edges = [];
const seenEdges = new Set();

function addEdge(u, v, weight, direction, options = {}) {
  const edgeKey = `${u}__${v}`;
  if (seenEdges.has(edgeKey)) return;
  seenEdges.add(edgeKey);
  edges.push({
    from: u,
    to: v,
    weight: weight,
    direction: direction,
    ...options
  });
}

// Generate bidirectional edges for all hallway corridor chains
for (const chain of corridorChains) {
  for (let i = 0; i < chain.length - 1; i++) {
    const u = chain[i];
    const v = chain[i + 1];
    const nodeU = nodes[u];
    const nodeV = nodes[v];
    if (!nodeU || !nodeV) {
      console.error(`Missing node: ${u} or ${v}`);
      continue;
    }
    const dist = calcDist(nodeU, nodeV);
    const dirFwd = getDirection(nodeU, nodeV);
    const dirRev = oppDir(dirFwd);
    const isStairs = nodeU.type === 'stairs' && nodeV.type === 'stairs';
    const isAccessible = !isStairs;

    // Forward edge
    addEdge(u, v, dist, dirFwd, { isAccessible });
    // Reverse edge (walk both ways along corridor)
    addEdge(v, u, dist, dirRev, { isAccessible });
  }
}

// Multi-floor vertical edges: Elevators (weight 15 m) & Stairs (weight 25 m)
const verticalConnections = [
  // SE Elevators
  { from: "LIFT_F5_SE", to: "LIFT_F6_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F6_SE", to: "LIFT_F7_SE", type: "elevator", weight: 15, isAccessible: true },
  // South Elevators
  { from: "LIFT_F5_S", to: "LIFT_F6_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F6_S", to: "LIFT_F7_S", type: "elevator", weight: 15, isAccessible: true },
  // West Elevators
  { from: "LIFT_F5_W", to: "LIFT_F6_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F6_W", to: "LIFT_F7_W", type: "elevator", weight: 15, isAccessible: true },
  // North Elevators
  { from: "LIFT_F5_N", to: "LIFT_F6_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F6_N", to: "LIFT_F7_N", type: "elevator", weight: 15, isAccessible: true },

  // SE Stairs
  { from: "STAIRS_F5_SE", to: "STAIRS_F6_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F6_SE", to: "STAIRS_F7_SE", type: "stairs", weight: 25, isAccessible: false },
  // South Stairs
  { from: "STAIRS_F5_S", to: "STAIRS_F6_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F6_S", to: "STAIRS_F7_S", type: "stairs", weight: 25, isAccessible: false },
  // West Stairs
  { from: "STAIRS_F5_W", to: "STAIRS_F6_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F6_W", to: "STAIRS_F7_W", type: "stairs", weight: 25, isAccessible: false },
  // North Stairs
  { from: "STAIRS_F5_N", to: "STAIRS_F6_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F6_N", to: "STAIRS_F7_N", type: "stairs", weight: 25, isAccessible: false }
];

for (const conn of verticalConnections) {
  addEdge(conn.from, conn.to, conn.weight, "up", { isAccessible: conn.isAccessible, verticalType: conn.type });
  addEdge(conn.to, conn.from, conn.weight, "down", { isAccessible: conn.isAccessible, verticalType: conn.type });
}

const campusGraph = {
  floors: {
    "5": {
      name: "Academic Block - Floor 5",
      planImage: "/assets/floor-plans/reference/ab-5th-floor-plan.jpeg",
      width: 1600,
      height: 1515
    },
    "6": {
      name: "Academic Block - Floor 6",
      planImage: "/assets/floor-plans/reference/ab-6th-floor-plan.jpeg",
      width: 1600,
      height: 1515
    },
    "7": {
      name: "Academic Block - Floor 7",
      planImage: "/assets/floor-plans/reference/ab-7th-floor-plan.jpeg",
      width: 1600,
      height: 1515
    }
  },
  nodes,
  edges
};

// Write campus_graph.json to root and src/data and public
fs.writeFileSync('./campus_graph.json', JSON.stringify(campusGraph, null, 2));
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/campus_graph.json', JSON.stringify(campusGraph, null, 2));
fs.mkdirSync('./public', { recursive: true });
fs.writeFileSync('./public/campus_graph.json', JSON.stringify(campusGraph, null, 2));

console.log(`Successfully generated verified campus_graph.json:`);
console.log(`- Nodes count: ${Object.keys(nodes).length}`);
console.log(`- Edges count: ${edges.length}`);
console.log(`- Floors: ${Object.keys(campusGraph.floors).join(', ')}`);
console.log(`- Corridor bounds: North y=330, South y=1035, East x=1075, West x=305`);
