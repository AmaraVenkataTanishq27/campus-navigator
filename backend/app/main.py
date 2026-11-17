import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Building, Floor, Room, NavigationNode, NavigationEdge, QRCheckpoint
from .routers import campus, navigation, qr

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus Navigator API",
    description="Backend Service for College Indoor & Outdoor Navigation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campus.router)
app.include_router(navigation.router)
app.include_router(qr.router)

@app.on_event("startup")
def seed_data_if_empty():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Building).first():
            return

        base_data_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "data")
        )

        campus_json_path = os.path.join(base_data_path, "campus", "campus.json")
        floors_json_path = os.path.join(base_data_path, "floors", "floors.json")
        rooms_json_path = os.path.join(base_data_path, "rooms", "rooms.json")
        graph_json_path = os.path.join(base_data_path, "navigation", "graph.json")
        qr_json_path = os.path.join(base_data_path, "navigation", "qr_checkpoints.json")

        if os.path.exists(campus_json_path):
            with open(campus_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                b_info = data["campus"]["buildings"][0]
                building = Building(
                    id=b_info["id"],
                    code=b_info["code"],
                    name=b_info["name"],
                    category=b_info["category"],
                    total_floors=b_info["totalFloors"],
                    description="Main Academic Complex at RIT",
                )
                db.add(building)

        if os.path.exists(floors_json_path):
            with open(floors_json_path, "r", encoding="utf-8") as f:
                floors_data = json.load(f)
                for f_item in floors_data:
                    floor = Floor(
                        id=f_item["id"],
                        building_id=f_item["buildingId"],
                        level=f_item["level"],
                        floor_number=f_item["floorNumber"],
                        name=f_item["name"],
                        description=f_item.get("description"),
                        status=f_item["status"],
                        has_interactive_map=f_item["hasInteractiveMap"],
                        reference_asset=f_item.get("referenceAsset"),
                    )
                    db.add(floor)

        if os.path.exists(rooms_json_path):
            with open(rooms_json_path, "r", encoding="utf-8") as f:
                rooms_data = json.load(f)
                for r_item in rooms_data:
                    room = Room(
                        id=r_item["id"],
                        room_number=r_item["roomNumber"],
                        name=r_item["name"],
                        building_id=r_item["buildingId"],
                        floor_id=r_item["floorId"],
                        floor_level=r_item["floorLevel"],
                        category=r_item["category"],
                        type=r_item["type"],
                        department=r_item.get("department"),
                        nearby_landmarks=r_item.get("nearbyLandmarks", []),
                        coord_x=r_item["coordinates"]["x"],
                        coord_y=r_item["coordinates"]["y"],
                        door_coord_x=r_item["doorCoordinates"]["x"],
                        door_coord_y=r_item["doorCoordinates"]["y"],
                        node_id=r_item.get("nodeId"),
                        status=r_item["status"],
                        is_accessible=r_item.get("isAccessible", True),
                    )
                    db.add(room)

        if os.path.exists(graph_json_path):
            with open(graph_json_path, "r", encoding="utf-8") as f:
                graph_data = json.load(f)
                for n_item in graph_data["nodes"]:
                    node = NavigationNode(
                        id=n_item["id"],
                        floor_level=n_item["floorLevel"],
                        coord_x=n_item["x"],
                        coord_y=n_item["y"],
                        node_type=n_item["type"],
                        label=n_item["label"],
                        room_id=n_item.get("roomId"),
                    )
                    db.add(node)

                for e_item in graph_data["edges"]:
                    edge = NavigationEdge(
                        id=e_item["id"],
                        from_node_id=e_item["from"],
                        to_node_id=e_item["to"],
                        distance_meters=e_item["distance"],
                        edge_type=e_item["edgeType"],
                        is_accessible=e_item.get("isAccessible", True),
                    )
                    db.add(edge)

        if os.path.exists(qr_json_path):
            with open(qr_json_path, "r", encoding="utf-8") as f:
                qr_data = json.load(f)
                for q_item in qr_data:
                    qr_cp = QRCheckpoint(
                        qr_code=q_item["qrCode"],
                        name=q_item["name"],
                        building_id=q_item["buildingId"],
                        floor_level=q_item["floorLevel"],
                        node_id=q_item["nodeId"],
                        coord_x=q_item["coordinates"]["x"],
                        coord_y=q_item["coordinates"]["y"],
                        description=q_item.get("description"),
                        status=q_item["status"],
                    )
                    db.add(qr_cp)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": "Campus Navigator API",
        "status": "online",
        "docs_url": "/docs",
    }
