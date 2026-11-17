from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    category = Column(String)
    total_floors = Column(Integer, default=1)
    description = Column(String, nullable=True)

    floors = relationship("Floor", back_populates="building")
    rooms = relationship("Room", back_populates="building")


class Floor(Base):
    __tablename__ = "floors"

    id = Column(String, primary_key=True, index=True)
    building_id = Column(String, ForeignKey("buildings.id"))
    level = Column(String, index=True) # 'G', '1', '2', '3', '4', '5', '6', '7'
    floor_number = Column(Integer)
    name = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="verified") # verified, pending_verification, pending_reference
    has_interactive_map = Column(Boolean, default=False)
    reference_asset = Column(String, nullable=True)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor")
    nodes = relationship("NavigationNode", back_populates="floor")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    room_number = Column(String, index=True)
    name = Column(String)
    building_id = Column(String, ForeignKey("buildings.id"))
    floor_id = Column(String, ForeignKey("floors.id"))
    floor_level = Column(String, index=True)
    category = Column(String, index=True) # Rooms, Labs, Facilities
    type = Column(String)
    department = Column(String, nullable=True)
    nearby_landmarks = Column(JSON, default=list)
    coord_x = Column(Float)
    coord_y = Column(Float)
    door_coord_x = Column(Float)
    door_coord_y = Column(Float)
    node_id = Column(String, nullable=True)
    status = Column(String, default="verified")
    is_accessible = Column(Boolean, default=True)

    building = relationship("Building", back_populates="rooms")
    floor = relationship("Floor", back_populates="rooms")


class NavigationNode(Base):
    __tablename__ = "navigation_nodes"

    id = Column(String, primary_key=True, index=True)
    floor_level = Column(String, index=True)
    floor_id = Column(String, ForeignKey("floors.id"), nullable=True)
    coord_x = Column(Float)
    coord_y = Column(Float)
    node_type = Column(String) # corridor_junction, corridor_waypoint, room_destination, elevator, stairs, restroom, entrance
    label = Column(String)
    room_id = Column(String, nullable=True)

    floor = relationship("Floor", back_populates="nodes")


class NavigationEdge(Base):
    __tablename__ = "navigation_edges"

    id = Column(String, primary_key=True, index=True)
    from_node_id = Column(String, ForeignKey("navigation_nodes.id"), index=True)
    to_node_id = Column(String, ForeignKey("navigation_nodes.id"), index=True)
    distance_meters = Column(Float)
    edge_type = Column(String) # corridor, door, stairs, elevator, skybridge
    is_accessible = Column(Boolean, default=True)


class QRCheckpoint(Base):
    __tablename__ = "qr_checkpoints"

    qr_code = Column(String, primary_key=True, index=True)
    name = Column(String)
    building_id = Column(String, ForeignKey("buildings.id"))
    floor_level = Column(String)
    node_id = Column(String, ForeignKey("navigation_nodes.id"))
    coord_x = Column(Float)
    coord_y = Column(Float)
    description = Column(String, nullable=True)
    status = Column(String, default="verified")
