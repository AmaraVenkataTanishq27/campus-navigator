# Campus Navigator – Find. Navigate. Reach.

> **AI-Powered Indoor and Outdoor College Navigation System**

[![React Native](https://img.shields.io/badge/React%20Native-v0.88.1-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v6.0-3178C6.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Campus Navigator is a modern indoor/outdoor navigation application designed specifically for colleges and universities. It allows students, faculty, and visitors to navigate across academic blocks, departments, classrooms, laboratories, and facilities with precision floor plans, A* pathfinding, QR checkpoint positioning, and computer vision guidance.

---

## 📱 Features

- **Actual College Floor Plans**: High-resolution rendering of verified floor plans (Academic Block Floors 5, 6, 7, Administration, and MCA).
- **Interactive 2D Indoor Maps**: Pinch-to-zoom, pan, room selection, elevator/stairway indicators, and floor switching via React Native SVG overlays.
- **A\* Pathfinding & Multi-Floor Navigation**:
  - Shortest / fastest route calculation.
  - Multi-floor routing through elevator shafts and stairwells.
  - **Avoid Stairs** & **Wheelchair-Accessible** mode toggles.
- **Turn-by-Turn Guidance**:
  - Live progress tracking along corridor waypoints.
  - Directional turn indicators (*"Go straight 25 m"*, *"Turn right at junction"*).
  - Corridor perspective visual with projected trajectory arrows.
- **Camera-Based AR Guidance**:
  - Live camera viewfinder overlay.
  - 3D floor chevrons guiding the path.
  - Bounding box locking onto target doorplates (e.g. `AB 608`).
  - Abstraction layer ready for DINOv2, FAISS, YOLOv8, and PaddleOCR.
- **QR Checkpoint Scanner**:
  - Instant location locking by scanning physical QR plaques.
- **Universal Directory & Search**:
  - Search by room number, department, laboratory, or facility.
  - Instant filtering across *Rooms*, *Labs*, and *Facilities*.
- **Offline SQLite Storage**:
  - Maps, room directories, and navigation graphs stored locally on the device.

---

## 📂 Repository Structure

```
campus-navigator/
├── apps/
│   └── mobile/               # Complete React Native / Expo application
│       ├── App.tsx           # Main application entry point & tab navigator
│       ├── assets/           # Bundled floor-plan images & app icons
│       └── src/
│           ├── components/   # Reusable UI components (Map, Header, Cards)
│           ├── constants/    # Design system (Premium Campus Green palette)
│           ├── context/      # Reactive global state (CampusContext)
│           ├── data/         # Campus metadata, floor configs, and graphs
│           ├── screens/      # All 10 application screens
│           ├── services/     # Navigation engine, SQLite, Vision & QR
│           └── types/        # TypeScript domain models
├── backend/                  # FastAPI server & database core
│   ├── app/
│   │   ├── main.py           # API endpoints & auto-seeding
│   │   ├── models.py         # SQLAlchemy models (Building, Floor, Room)
│   │   ├── schemas.py        # Pydantic data schemas
│   │   └── routers/          # Campus, Navigation & QR routes
│   └── tests/                # Automated API test suite
├── ai/                       # Computer Vision & Perception Stack
│   ├── embeddings/           # DINOv2 visual feature encoder & FAISS index
│   └── inference/            # YOLO landmark detector & PaddleOCR reader
├── assets/                   # Original reference assets & UI specifications
│   ├── design-reference/     # UI concept reference
│   └── floor-plans/reference/# 5 original college floor plans
├── data/                     # Clean JSON definitions for campus, floors, rooms
└── docs/                     # Technical specifications & architecture manuals
```

---

## 🚀 Quick Start Guide

### 1. Run the Mobile Application (React Native / Expo)

Ensure **Node.js (v18+)** is installed.

```bash
# Navigate to the mobile app directory
cd apps/mobile

# Start Expo development server
npx expo start
```

- Press `a` to open on an Android emulator or connected device.
- Press `i` to open on iOS simulator (macOS required).
- Press `w` to open in a web browser.
- Or scan the QR code using the **Expo Go** mobile app on physical iOS/Android devices.

### 2. Run the Backend API (FastAPI)

Ensure **Python (v3.10+)** is installed.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

- Open interactive Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/](http://localhost:8000/)

---

## 🎨 Visual Design Palette

- **Primary Forest Green**: `#155B43`
- **Dark Green**: `#124632`
- **Sage Green**: `#DCECE2`
- **Background**: `#F7F8F5`
- **Card Surfaces**: `#FFFFFF`
- **Route Blue**: `#2675E8`
- **Destination Green**: `#168B57`
- **Caution Amber**: `#D99A32`

---

## Web Application: Visual Milestone Indoor Navigation

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
