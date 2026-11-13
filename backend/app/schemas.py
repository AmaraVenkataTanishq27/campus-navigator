from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class RoomBase(BaseModel):
    id: str
    room_number: str
    name: str
    building_id: str
    floor_id: str
    floor_level: str
    category: str
    type: str
    department: Optional[str] = None
    nearby_landmarks: List[str] = []
    coord_x: float
    coord_y: float
    door_coord_x: float
    door_coord_y: float
    node_id: Optional[str] = None
    status: str
    is_accessible: bool

class FloorBase(BaseModel):
    id: str
    building_id: str
    level: str
    floor_number: int
    name: str
    description: Optional[str] = None
    status: str
    has_interactive_map: bool
    reference_asset: Optional[str] = None

class BuildingBase(BaseModel):
    id: str
    code: str
    name: str
    category: str
    total_floors: int
    description: Optional[str] = None

class RouteRequest(BaseModel):
    start_node_id: str
    target_node_id: str
    avoid_stairs: bool = False
    wheelchair_accessible: bool = False

class NavigationInstruction(BaseModel):
    id: str
    instruction: str
    distance_meters: float
    direction: str
    floor_level: str
    target_node_id: str

class RouteResponse(BaseModel):
    path_node_ids: List[str]
    polyline_coordinates: List[Dict[str, Any]]
    total_distance_meters: float
    estimated_time_minutes: int
    instructions: List[NavigationInstruction]
    is_accessible: bool
    is_demonstration: bool
    start_floor: str
    end_floor: str

class QRVerifyRequest(BaseModel):
    qr_code: str

class QRVerifyResponse(BaseModel):
    success: bool
    checkpoint: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
