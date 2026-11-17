export type ScreenType = 
  | 'home' 
  | 'map' 
  | 'search' 
  | 'directory' 
  | 'profile'
  | 'location_detail'
  | 'guidance'
  | 'ar_camera'
  | 'qr_scanner';

export type CategoryFilter = 'All' | 'Rooms' | 'Labs' | 'Facilities';

export type FloorStatus = 'verified' | 'pending_verification' | 'pending_reference';

export interface FloorInfo {
  id: string;
  buildingId: string;
  level: string; // 'G', '1', '2', '3', '4', '5', '6', '7'
  floorNumber: number;
  name: string;
  description: string;
  status: FloorStatus;
  hasInteractiveMap: boolean;
  referenceAsset: any;
  dimensions: { width: number; height: number };
}

export interface RoomItem {
  id: string;
  roomNumber: string;
  name: string;
  buildingId: string;
  floorId: string;
  floorLevel: string;
  category: CategoryFilter;
  type: string;
  department?: string;
  nearbyLandmarks: string[];
  coordinates: { x: number; y: number };
  doorCoordinates: { x: number; y: number };
  nodeId: string;
  status: 'verified' | 'pending_verification' | 'demonstration_only';
  isAccessible: boolean;
  hasPhotos?: boolean;
  photoUrl?: string;
}

export type NodeType = 
  | 'corridor_junction' 
  | 'corridor_waypoint' 
  | 'room_destination' 
  | 'elevator' 
  | 'stairs' 
  | 'restroom' 
  | 'entrance';

export type EdgeType = 'corridor' | 'door' | 'stairs' | 'elevator' | 'skybridge';

export interface NavNode {
  id: string;
  floorLevel: string;
  x: number;
  y: number;
  type: NodeType;
  label: string;
  roomId?: string;
}

export interface NavEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // in meters (calibrated)
  edgeType: EdgeType;
  isAccessible: boolean;
}

export interface TurnInstruction {
  id: string;
  instruction: string;
  distanceMeters: number;
  direction: 'straight' | 'right' | 'left' | 'turn_around' | 'elevator_up' | 'elevator_down' | 'stairs_up' | 'stairs_down' | 'arrived';
  floorLevel: string;
  corridorName?: string;
  targetNodeId: string;
}

export interface CalculatedRoute {
  pathNodes: NavNode[];
  pathEdges: NavEdge[];
  polylineCoordinates: { x: number; y: number; floorLevel: string }[];
  totalDistanceMeters: number;
  estimatedTimeMinutes: number;
  instructions: TurnInstruction[];
  isAccessible: boolean;
  isDemonstration: boolean;
  startFloor: string;
  endFloor: string;
  transitsFloors: boolean;
}

export interface QRCheckpoint {
  qrCode: string;
  name: string;
  buildingId: string;
  floorLevel: string;
  nodeId: string;
  coordinates: { x: number; y: number };
  description: string;
  status: 'verified' | 'pending_verification';
}

export interface UserPreferences {
  avoidStairs: boolean;
  wheelchairAccessible: boolean;
  voiceGuidance: boolean;
  offlineCacheReady: boolean;
  hapticFeedback: boolean;
}
