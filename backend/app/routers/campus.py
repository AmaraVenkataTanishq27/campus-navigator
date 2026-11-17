from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Building, Floor, Room
from ..schemas import BuildingBase, FloorBase, RoomBase

router = APIRouter(prefix="/api/v1/campus", tags=["Campus"])

@router.get("/metadata")
def get_campus_metadata():
    return {
        "id": "rit-main-campus",
        "name": "RIT Campus Navigator",
        "tagline": "Find. Navigate. Reach.",
        "subtitle": "Your complete campus navigation assistant",
        "primary_building": "Academic Block (AB)",
    }

@router.get("/buildings", response_model=List[BuildingBase])
def get_buildings(db: Session = Depends(get_db)):
    return db.query(Building).all()

@router.get("/floors", response_model=List[FloorBase])
def get_floors(building_id: str = "academic-block", db: Session = Depends(get_db)):
    return db.query(Floor).filter(Floor.building_id == building_id).all()

@router.get("/rooms", response_model=List[RoomBase])
def get_rooms(
    floor_level: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)
    if floor_level:
        query = query.filter(Room.floor_level == floor_level)
    if category and category != "All":
        query = query.filter(Room.category == category)
    return query.all()

@router.get("/search", response_model=List[RoomBase])
def search_rooms(
    q: str = Query("", description="Search term for room number, lab, or department"),
    category: str = Query("All"),
    db: Session = Depends(get_db)
):
    clean_q = q.strip().lower()
    query = db.query(Room)
    if category and category != "All":
        query = query.filter(Room.category == category)
    
    rooms = query.all()
    if not clean_q:
        return rooms

    matched = []
    for r in rooms:
        if (
            clean_q in r.room_number.lower()
            or clean_q in r.name.lower()
            or clean_q in r.type.lower()
            or (r.department and clean_q in r.department.lower())
            or any(clean_q in lm.lower() for lm in (r.nearby_landmarks or []))
        ):
            matched.append(r)
    return matched
