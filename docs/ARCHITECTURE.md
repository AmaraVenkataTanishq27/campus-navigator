# Campus Navigator – System Architecture & Implementation Manual

**Campus Navigator** is an AI-powered indoor and outdoor navigation system engineered specifically for multi-tier college environments.

---

## 1. System Architecture Overview

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │              CAMPUS NAVIGATOR MOBILE APP               │
                                      │   (React Native, TypeScript, Expo, React Native SVG)   │
                                      └──────────────────────────┬─────────────────────────────┘
                                                                 │
                                    ┌────────────────────────────┴───────────────────────────┐
                                    ▼                                                        ▼
                    ┌───────────────────────────────┐                        ┌───────────────────────────────┐
                    │    INDOOR RENDERING ENGINE    │                        │       NAVIGATION ENGINE       │
                    │ • 5 Verified College Maps     │                        │ • A* Pathfinding              │
                    │ • React Native SVG Overlays   │                        │ • Multi-Floor Transit Graphs  │
                    │ • Pan, Zoom, Floor Switcher   │                        │ • Avoid-Stairs & Accessibility│
                    └───────────────────────────────┘                        └───────────────────────────────┘
                                    │                                                        │
                                    ▼                                                        ▼
                    ┌───────────────────────────────┐                        ┌───────────────────────────────┐
                    │       PERCEPTION & AR         │                        │     OFFLINE SQLITE ENGINE     │
                    │ • Camera Viewfinder           │                        │ • Local room database         │
                    │ • 3D Floor Chevrons           │                        │ • Cached navigation graphs    │
                    │ • QR Checkpoint Resolution    │                        │ • Instant zero-latency search │
                    │ • Visual Match HUD            │                        │ • Recent search history       │
                    └───────────────────────────────┘                        └───────────────────────────────┘
                                    │                                                        │
                                    └────────────────────────────┬───────────────────────────┘
                                                                 │ (REST API / Future Sync)
                                                                 ▼
                                      ┌────────────────────────────────────────────────────────┐
                                      │                  FASTAPI BACKEND CORE                  │
                                      │          (Python, PostgreSQL, PostGIS, NetworkX)       │
                                      └──────────────────────────┬─────────────────────────────┘
                                                                 │
                                                                 ▼
                                      ┌────────────────────────────────────────────────────────┐
                                      │                  AI PERCEPTION STACK                   │
                                      │     • DINOv2 + FAISS (Visual Place Recognition)        │
                                      │     • YOLOv8 (Door & Landmark Detection)               │
                                      │     • PaddleOCR (Alphanumeric Room Plate Reader)       │
                                      └────────────────────────────────────────────────────────┘
```

---

## 2. Floor Plan Assets & Verification Matrix

The application directly renders the original high-resolution floor plans provided in `assets/floor-plans/reference/`:

| Floor Plan Drawing | Internal Level | Verified Status | Key Facilities / Rooms Visible |
| :--- | :--- | :--- | :--- |
| `ab-5th-floor-plan.jpeg` | **Floor 5** | **Verified** | Rooms AB 501–508, 510–512, 514–515, AB 516 Lecture Hall, 4 Stairwells, 6 Lifts |
| `ab-6th-floor-plan.jpeg` | **Floor 6** | **Verified** | Rooms AB 601–604, Physics Lab (West & NW), AB 608, AB 610–611, Executive Board Room |
| `ab-7th-floor-plan.jpeg` | **Floor 7** | **Verified** | AB 701–702, Computer Labs (SW & NW), Humanities, Mathematics Dept, Apex Library |
| `administration-plan.jpeg` | **Floor 2** | **Provisional (AB203)** | Admission, Evaluation Center, Exam Center 1, Chief Proctor, IT Room, NSS, EPFO |
| `mca-plan.jpeg` | **Floor 3** | **Provisional** | MCA Computer Lab, Skill Lab, MCA Library, MCA Classrooms, Exam Center 2 |
| *Ground (G) & 1st (1)* | **G & 1** | **Pending Reference** | Labeled in selector; awaiting physical CAD / image assets from institution |

---

## 3. Visual Design System: Premium Campus Green

The UI matches the 5-screen reference design in `assets/design-reference/campus-navigator-ui-reference.png.png`:

- **Primary Forest Green**: `#155B43`
- **Dark Forest Green**: `#124632`
- **Sage Accent**: `#DCECE2`
- **Light Sage Tint**: `#EBF4EF`
- **Canvas / Background**: `#F7F8F5`
- **Cards**: `#FFFFFF`
- **Navigation Route Line**: `#2675E8`
- **Destination Marker Pin**: `#168B57`
- **Text Primary**: `#17231D`
- **Text Secondary**: `#77827B`

---

## 4. Navigation Graph & Pathfinding Engine

- **Coordinate System**: $1600 \times 1515$ pixels, calibrated at $\approx 0.065$ meters per pixel.
- **Algorithm**: $A^*$ heuristic search algorithm factoring 2D Euclidean corridor distance and vertical floor penalty ($15\text{ m}$ per floor transition).
- **Turn-by-Turn Instruction Generator**: Calculates trajectory bearing angles at corridor waypoints to generate intuitive instructions (*"Go straight for 25 m"*, *"Turn right at junction"*, *"Take the elevator to Floor X"*).
- **Accessibility Filtering**:
  - `avoidStairs: true`: Routes exclusively via elevators and flat corridors.
  - `wheelchairAccessible: true`: Filters out stair edges and strict clearance restrictions.

---

## 5. Offline SQLite & Data Architecture

- **SQLite Cache**: Uses `expo-sqlite` on native iOS/Android to persist recent searches, room metadata, and route graphs.
- **Fallback**: Graceful in-memory cache for Web and environments without native SQLite driver.

---

## 6. Information Still Required from College Administration

1. **Exact Floor Assignments**:
   - Confirm whether `administration-plan.jpeg` maps to Floor 2.
   - Confirm whether `mca-plan.jpeg` maps to Floor 3, Floor 4, or another level.
2. **Missing Drawings**:
   - Ground Floor (G) and 1st Floor (1) CAD / raster plans.
3. **Southeast Diagonal Annex Labels**:
   - Official names for the Southeast angled room on Administration and MCA floors.
4. **Physical Scale Calibration**:
   - In-person measurement of corridor width or AB 608 door-to-wall dimension to finalize the exact pixel-to-meter ratio.
5. **Corridor Training Photos**:
   - Labeled corridor imagery for fine-tuning DINOv2 and YOLO weights.
