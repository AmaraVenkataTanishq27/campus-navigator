# Campus Navigator - Visual Milestone Indoor Navigation

An offline-first, GPS-free campus indoor navigation system that guides students, faculty, and visitors across campus buildings using **room numbers and visual milestones** instead of unreliable indoor GPS or expensive Bluetooth beacons.

Built with **React 19**, **Vite 6**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Key Features

* **Visual Milestone Routing:** Rather than squinting at tiny dots on a map while walking, users follow clear room-by-room milestone checklists (*"Pass AB 602, AB 603 -> Turn right at Junction -> Arrive AB 605"*).
* **Sidebar + Expanded Map Layout:** Clean split view featuring a 420px navigation sidebar on the left and an expansive interactive floor plan on the right.
* **Strict Room-Based Selection:** Start and destination selection is restricted exclusively to valid rooms (`type: room`), with instant floor tabs and quick preset routes.
* **Seamless Multi-Floor Navigation:** Automatically calculates transitions across floors (Floors 5, 6, 7) via elevators and stairwells, with automatic floor plan image switching as users advance milestones.
* **Accessible Route Toggle:** Instantly filter routes to avoid stairs and route exclusively through ADA-compliant elevator shafts.
* **High-Precision Hallway Routing:** Hallway centerlines and waypoint coordinates are mapped along clear corridor paths with 0 wall collisions.
* **Interactive Floor Plan Overlay:** Smooth SVG polyline route rendering with pulsating beacon rings marking the active milestone.
* **Integrated Click-to-Coordinate Mapper:** Bundled visual mapping tool (`tools/mapper.html`) lets administrators click directly on high-resolution floor plans to generate and export node coordinates in seconds.

---

## 🏗️ Architecture & Data Model

### 1. Graph Model (`campus_graph.json`)
The building is modeled as a weighted graph of waypoints and corridor edges:
```json
{
  "nodes": {
    "R601": { "label": "AB 601", "roomNumber": "601", "floor": 6, "type": "room", "x": 180, "y": 1035 },
    "J6_SW": { "label": "Southwest Junction", "floor": 6, "type": "junction", "x": 305, "y": 1035 },
    "ELV6_S": { "label": "South Elevators", "floor": 6, "type": "elevator", "x": 750, "y": 1035 }
  },
  "edges": [
    { "from": "R601", "to": "J6_SW", "weight": 8.9, "direction": "E", "isAccessible": true },
    { "from": "ELV6_S", "to": "ELV7_S", "weight": 25, "direction": "up", "isAccessible": true, "verticalType": "elevator" }
  ]
}
```

### 2. Pathfinding & Milestone Engine
* **Dijkstra Algorithm (`src/engine/dijkstra.ts`):** Computes shortest paths in sub-milliseconds directly in the browser with zero network requests.
* **Milestone Generator (`src/engine/milestoneEngine.ts`):** 
  * Computes turn directions (straight, left, right, sharp turns) using vector geometry.
  * Collapses long corridor walks into grouped room cards (*"Walk straight — Pass AB 602, AB 603"*).
  * Automatically handles vertical floor transitions and landing checkpoints.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite 6
* **Styling:** Tailwind CSS (Obsidian dark theme, glassmorphism, pulse animations)
* **Icons:** Lucide React
* **Effects:** Canvas Confetti (arrival celebration)
* **Asset Support:** 1600 × 1515 Floor Plan Schematics (Floors 5, 6, 7)

---

## 📦 Getting Started

### Prerequisites
* Node.js 18+ (tested on Node 22 / 24)
* npm 9+

### Installation
```bash
git clone https://github.com/AmaraVenkataTanishq27/campus-navigator.git
cd campus-navigator
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Verification Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 🗺️ Visual Coordinate Mapping Tool

To map new rooms, junctions, or buildings:
1. Open `tools/mapper.html` or visit `/mapper.html` on the local server.
2. Select a floor plan image (Floors 5, 6, 7).
3. Click anywhere on the floor plan to plot waypoints, connect edges, and export JSON directly into `campus_graph.json`.

---

## 📄 License
MIT License. Built for seamless offline campus wayfinding.
