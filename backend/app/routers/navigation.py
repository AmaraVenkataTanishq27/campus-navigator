from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import math
import heapq
from typing import Dict, List, Any
from ..database import get_db
from ..models import NavigationNode, NavigationEdge
from ..schemas import RouteRequest, RouteResponse, NavigationInstruction

router = APIRouter(prefix="/api/v1/navigation", tags=["Navigation"])

@router.get("/graph")
def get_graph(db: Session = Depends(get_db)):
    nodes = db.query(NavigationNode).all()
    edges = db.query(NavigationEdge).all()
    return {
        "nodes": [
            {
                "id": n.id,
                "floor_level": n.floor_level,
                "x": n.coord_x,
                "y": n.coord_y,
                "type": n.node_type,
                "label": n.label,
                "room_id": n.room_id,
            }
            for n in nodes
        ],
        "edges": [
            {
                "id": e.id,
                "from": e.from_node_id,
                "to": e.to_node_id,
                "distance": e.distance_meters,
                "edge_type": e.edge_type,
                "is_accessible": e.is_accessible,
            }
            for e in edges
        ],
    }

@router.post("/route", response_model=RouteResponse)
def calculate_route(req: RouteRequest, db: Session = Depends(get_db)):
    nodes = {n.id: n for n in db.query(NavigationNode).all()}
    edges = db.query(NavigationEdge).all()

    if req.start_node_id not in nodes:
        raise HTTPException(status_code=404, detail="Start node not found")
    if req.target_node_id not in nodes:
        raise HTTPException(status_code=404, detail="Target node not found")

    start_node = nodes[req.start_node_id]
    target_node = nodes[req.target_node_id]

    adj: Dict[str, List[Dict[str, Any]]] = {n_id: [] for n_id in nodes}
    for e in edges:
        if req.wheelchair_accessible and not e.is_accessible:
            continue
        if req.avoid_stairs and e.edge_type == "stairs":
            continue

        adj[e.from_node_id].append({"to": e.to_node_id, "edge": e})
        adj[e.to_node_id].append({"to": e.from_node_id, "edge": e})

    def heuristic(n1: NavigationNode, n2: NavigationNode) -> float:
        try:
            f1 = int(n1.floor_level) if n1.floor_level.isdigit() else 0
            f2 = int(n2.floor_level) if n2.floor_level.isdigit() else 0
        except ValueError:
            f1, f2 = 0, 0
        dist_2d = math.hypot(n1.coord_x - n2.coord_x, n1.coord_y - n2.coord_y) * 0.065
        return dist_2d + abs(f1 - f2) * 15.0

    pq = [(heuristic(start_node, target_node), 0.0, req.start_node_id, [req.start_node_id], [])]
    visited = set()
    g_scores = {n_id: float("inf") for n_id in nodes}
    g_scores[req.start_node_id] = 0.0

    while pq:
        f, g, curr_id, path_ids, path_edges = heapq.heappop(pq)

        if curr_id == req.target_node_id:
            # Reconstruct route
            poly_coords = [
                {"x": nodes[nid].coord_x, "y": nodes[nid].coord_y, "floor_level": nodes[nid].floor_level}
                for nid in path_ids
            ]
            total_dist = sum(e.distance_meters for e in path_edges)
            est_minutes = max(1, math.ceil(total_dist / 70.0))

            instructions = []
            for idx, e in enumerate(path_edges):
                u = nodes[path_ids[idx]]
                v = nodes[path_ids[idx + 1]]
                instructions.append(
                    NavigationInstruction(
                        id=f"step_{idx}",
                        instruction=f"Proceed towards {v.label} ({round(e.distance_meters)} m)",
                        distance_meters=round(e.distance_meters, 1),
                        direction="straight",
                        floor_level=u.floor_level,
                        target_node_id=v.id,
                    )
                )

            instructions.append(
                NavigationInstruction(
                    id="step_final",
                    instruction=f"You have arrived! {target_node.label} is on your left.",
                    distance_meters=0.0,
                    direction="arrived",
                    floor_level=target_node.floor_level,
                    target_node_id=target_node.id,
                )
            )

            return RouteResponse(
                path_node_ids=path_ids,
                polyline_coordinates=poly_coords,
                total_distance_meters=round(total_dist, 1),
                estimated_time_minutes=est_minutes,
                instructions=instructions,
                is_accessible=all(e.is_accessible for e in path_edges),
                is_demonstration=True,
                start_floor=start_node.floor_level,
                end_floor=target_node.floor_level,
            )

        if curr_id in visited:
            continue
        visited.add(curr_id)

        for neighbor in adj.get(curr_id, []):
            next_id = neighbor["to"]
            edge = neighbor["edge"]
            if next_id in visited:
                continue

            tentative_g = g + edge.distance_meters
            if tentative_g < g_scores[next_id]:
                g_scores[next_id] = tentative_g
                f_score = tentative_g + heuristic(nodes[next_id], target_node)
                heapq.heappush(
                    pq,
                    (f_score, tentative_g, next_id, path_ids + [next_id], path_edges + [edge]),
                )

    raise HTTPException(status_code=400, detail="No feasible route found")
