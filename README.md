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
