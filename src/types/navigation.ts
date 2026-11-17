export type NodeType = 'room' | 'junction' | 'stairs' | 'elevator';

export interface NavNode {
  label: string;
  roomNumber?: string;
  floor: number;
  type: NodeType;
  x: number;
  y: number;
  aliases?: string[];
  description?: string;
  category?: 'classroom' | 'laboratory' | 'faculty' | 'facility' | 'circulation';
}

export interface NavEdge {
  from: string;
  to: string;
  weight: number;
  direction: 'N' | 'S' | 'E' | 'W' | 'up' | 'down' | string;
  isAccessible?: boolean;
  verticalType?: 'elevator' | 'stairs';
}

export interface FloorMeta {
  name: string;
  planImage: string;
  width: number;
  height: number;
}

export interface CampusGraph {
  floors: Record<string, FloorMeta>;
  nodes: Record<string, NavNode>;
  edges: NavEdge[];
}

export interface Milestone {
  id: string;
  nodeId: string;
  nodeIds?: string[];
  label: string;
  subtext: string;
  type: 'start' | 'room' | 'grouped_rooms' | 'junction' | 'stairs' | 'elevator' | 'floor_change' | 'arrive';
  action: string;
  icon: string;
  floor: number;
  coords: { x: number; y: number };
  distanceToNextMeters: number;
  cumulativeDistanceMeters: number;
  groupedRooms?: string[];
}

export interface RouteResult {
  pathNodeIds: string[];
  totalDistance: number;
  estimatedMinutes: number;
  milestones: Milestone[];
  floorsTraversed: number[];
}
