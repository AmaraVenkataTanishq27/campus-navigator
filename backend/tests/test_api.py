import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_campus_metadata():
    response = client.get("/api/v1/campus/metadata")
    assert response.status_code == 200
    assert "rit-main-campus" in response.json()["id"]

def test_get_rooms():
    response = client.get("/api/v1/campus/rooms")
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) > 0
    room_numbers = [r["room_number"] for r in rooms]
    assert "AB 608" in room_numbers

def test_search_rooms():
    response = client.get("/api/v1/campus/search?q=Physics")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert any("Physics" in r["name"] for r in results)

def test_route_calculation():
    payload = {
        "start_node_id": "AB_F6_ENTRANCE_MAIN",
        "target_node_id": "AB_F6_NODE_DOOR_608",
        "avoid_stairs": False,
        "wheelchair_accessible": False,
    }
    response = client.post("/api/v1/navigation/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_distance_meters"] > 0
    assert len(data["instructions"]) > 0

def test_qr_verification_valid():
    payload = {"qr_code": "AB_F6_ENTRANCE_01"}
    response = client.post("/api/v1/qr/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["checkpoint"]["floor_level"] == "6"

def test_qr_verification_invalid():
    payload = {"qr_code": "INVALID_CODE_999"}
    response = client.post("/api/v1/qr/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
