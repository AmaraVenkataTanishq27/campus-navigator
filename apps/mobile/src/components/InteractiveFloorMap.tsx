import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Svg, {
  Polyline,
  Circle,
  Rect,
  Text as SvgText,
  G,
  Path,
  Line,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { FloorInfo, RoomItem, CalculatedRoute, NavNode } from '../types';
import { NAVIGATION_GRAPH } from '../data/campusData';

interface InteractiveFloorMapProps {
  floorInfo?: FloorInfo;
  rooms: RoomItem[];
  route: CalculatedRoute | null;
  selectedRoom: RoomItem | null;
  onSelectRoom?: (room: RoomItem) => void;
  startNode?: NavNode | null;
  activeNodeId?: string | null;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_CONTAINER_HEIGHT = 440;
const ORIGINAL_WIDTH = 1600;
const ORIGINAL_HEIGHT = 1515;

export const InteractiveFloorMap: React.FC<InteractiveFloorMapProps> = ({
  floorInfo,
  rooms,
  route,
  selectedRoom,
  onSelectRoom,
  startNode,
  activeNodeId,
  height = MAP_CONTAINER_HEIGHT,
}) => {
  // Dynamically measured viewport dimensions (defaults to screen width minus margin)
  const [viewportSize, setViewportSize] = useState({
    width: Math.max(SCREEN_WIDTH - 32, 320),
    height,
  });

  // Calculate exact fit-to-screen scale for 1600x1515 canvas
  const fitScale = useMemo(() => {
    const scaleX = (viewportSize.width - 16) / ORIGINAL_WIDTH;
    const scaleY = (viewportSize.height - 16) / ORIGINAL_HEIGHT;
    return Math.max(0.18, Math.min(scaleX, scaleY));
  }, [viewportSize.width, viewportSize.height]);

  const minScale = useMemo(() => Math.max(fitScale * 0.75, 0.15), [fitScale]);
  const maxScale = 2.5;

  const [scale, setScale] = useState<number>(fitScale);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  // Sync refs to avoid stale closures in PanResponder
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const translateRef = useRef({ x: translateX, y: translateY });
  translateRef.current = { x: translateX, y: translateY };
  const minScaleRef = useRef(minScale);
  minScaleRef.current = minScale;
  const maxScaleRef = useRef(maxScale);
  maxScaleRef.current = maxScale;

  const lastOffset = useRef({ x: 0, y: 0 });
  const touchDistance = useRef<number | null>(null);
  const touchStartScale = useRef<number>(fitScale);

  // Find active navigation node if activeNodeId is passed
  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return NAVIGATION_GRAPH.nodes.find(
      (n) => n.id === activeNodeId && n.floorLevel === (floorInfo?.level || '6')
    );
  }, [activeNodeId, floorInfo?.level]);

  // Auto-center on active step node, selected room, or fit entire floor
  useEffect(() => {
    if (activeNode) {
      const focusScale = Math.max(fitScale * 2.2, 0.55);
      setScale(focusScale);
      setTranslateX(ORIGINAL_WIDTH / 2 - activeNode.x);
      setTranslateY(ORIGINAL_HEIGHT / 2 - activeNode.y);
    } else if (selectedRoom && selectedRoom.floorLevel === floorInfo?.level) {
      const targetX = selectedRoom.coordinates.x;
      const targetY = selectedRoom.coordinates.y;
      const focusScale = Math.max(fitScale * 2.2, 0.52);
      setScale(focusScale);
      setTranslateX(ORIGINAL_WIDTH / 2 - targetX);
      setTranslateY(ORIGINAL_HEIGHT / 2 - targetY);
    } else {
      setScale(fitScale);
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [floorInfo?.level, selectedRoom?.id, activeNode, fitScale]);

  const getPinchDistance = (event: GestureResponderEvent): number | null => {
    const touches = event.nativeEvent.touches;
    if (touches && touches.length >= 2) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return null;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1;
      },
      onPanResponderGrant: (event: GestureResponderEvent) => {
        lastOffset.current = { x: translateRef.current.x, y: translateRef.current.y };
        const dist = getPinchDistance(event);
        if (dist !== null) {
          touchDistance.current = dist;
          touchStartScale.current = scaleRef.current;
        } else {
          touchDistance.current = null;
        }
      },
      onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const touches = event.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const currentDist = getPinchDistance(event);
          if (currentDist !== null && touchDistance.current !== null && touchDistance.current > 0) {
            const factor = currentDist / touchDistance.current;
            const newScale = Math.min(
              Math.max(touchStartScale.current * factor, minScaleRef.current),
              maxScaleRef.current
            );
            setScale(newScale);
          }
        } else {
          setTranslateX(lastOffset.current.x + gestureState.dx);
          setTranslateY(lastOffset.current.y + gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        touchDistance.current = null;
      },
    })
  ).current;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.18, maxScale));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.18, minScale));
  };

  const handleResetZoom = () => {
    if (activeNode) {
      const focusScale = Math.max(fitScale * 2.2, 0.55);
      setScale(focusScale);
      setTranslateX(ORIGINAL_WIDTH / 2 - activeNode.x);
      setTranslateY(ORIGINAL_HEIGHT / 2 - activeNode.y);
    } else {
      setScale(fitScale);
      setTranslateX(0);
      setTranslateY(0);
    }
  };

  // Convert route coordinates to SVG points string for the current floor
  const currentFloorRoutePoints = route
    ? route.polylineCoordinates
        .filter((pt) => pt.floorLevel === (floorInfo?.level || '6'))
        .map((pt) => `${pt.x},${pt.y}`)
        .join(' ')
    : '';

  // Get active floor vertical nodes (elevators & stairs)
  const floorNodes = NAVIGATION_GRAPH.nodes.filter(
    (n) => n.floorLevel === (floorInfo?.level || '6')
  );
  const elevators = floorNodes.filter((n) => n.type === 'elevator');
  const stairs = floorNodes.filter((n) => n.type === 'stairs');

  // Destination node on current floor
  const hasDestinationOnThisFloor =
    selectedRoom && selectedRoom.floorLevel === (floorInfo?.level || '6');

  // Start node on current floor
  const isStartOnThisFloor =
    startNode && startNode.floorLevel === (floorInfo?.level || '6');

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.mapViewport}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setViewportSize({ width, height });
          }
        }}
        {...panResponder.panHandlers}
      >
        {floorInfo?.hasInteractiveMap && floorInfo.referenceAsset ? (
          <View
            style={[
              styles.transformContainer,
              {
                left: -(ORIGINAL_WIDTH - viewportSize.width) / 2,
                top: -(ORIGINAL_HEIGHT - viewportSize.height) / 2,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            {/* Base Image Floor Plan */}
            <Image
              source={floorInfo.referenceAsset}
              style={styles.mapImage}
              resizeMode="contain"
            />

            {/* Separate SVG Overlays (Routes, Markers, Selection) */}
            <Svg
              viewBox={`0 0 ${ORIGINAL_WIDTH} ${ORIGINAL_HEIGHT}`}
              style={styles.svgOverlay}
            >
              {/* Selected Room Bounding Highlight */}
              {selectedRoom && selectedRoom.floorLevel === floorInfo.level ? (
                <G>
                  <Rect
                    x={selectedRoom.coordinates.x - 70}
                    y={selectedRoom.coordinates.y - 50}
                    width={140}
                    height={100}
                    fill="rgba(22, 139, 87, 0.2)"
                    stroke={THEME.colors.destinationGreen}
                    strokeWidth={4}
                    strokeDasharray="6,4"
                    rx={12}
                  />
                  <Circle
                    cx={selectedRoom.doorCoordinates.x}
                    cy={selectedRoom.doorCoordinates.y}
                    r={10}
                    fill={THEME.colors.destinationGreen}
                  />
                </G>
              ) : null}

              {/* Navigation Route Polyline */}
              {currentFloorRoutePoints ? (
                <G>
                  {/* Route glow / outline */}
                  <Polyline
                    points={currentFloorRoutePoints}
                    fill="none"
                    stroke="rgba(38, 117, 232, 0.3)"
                    strokeWidth={16}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Primary Navigation Blue Line */}
                  <Polyline
                    points={currentFloorRoutePoints}
                    fill="none"
                    stroke={THEME.colors.routeBlue}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </G>
              ) : null}

              {/* Elevator Markers */}
              {elevators.map((elv) => (
                <G key={elv.id}>
                  <Circle
                    cx={elv.x}
                    cy={elv.y}
                    r={22}
                    fill={THEME.colors.card}
                    stroke={THEME.colors.primary}
                    strokeWidth={3}
                  />
                  <SvgText
                    x={elv.x}
                    y={elv.y + 6}
                    fontSize={18}
                    fontWeight="bold"
                    fill={THEME.colors.primary}
                    textAnchor="middle"
                  >
                    L
                  </SvgText>
                </G>
              ))}

              {/* Staircase Markers */}
              {stairs.map((st) => (
                <G key={st.id}>
                  <Circle
                    cx={st.x}
                    cy={st.y}
                    r={22}
                    fill={THEME.colors.card}
                    stroke={THEME.colors.textSecondary}
                    strokeWidth={3}
                  />
                  <SvgText
                    x={st.x}
                    y={st.y + 6}
                    fontSize={18}
                    fontWeight="bold"
                    fill={THEME.colors.textSecondary}
                    textAnchor="middle"
                  >
                    S
                  </SvgText>
                </G>
              ))}

              {/* "You are here" Origin Marker */}
              {isStartOnThisFloor ? (
                <G>
                  <Circle
                    cx={startNode.x}
                    cy={startNode.y}
                    r={28}
                    fill="rgba(38, 117, 232, 0.25)"
                  />
                  <Circle
                    cx={startNode.x}
                    cy={startNode.y}
                    r={16}
                    fill={THEME.colors.card}
                  />
                  <Circle
                    cx={startNode.x}
                    cy={startNode.y}
                    r={11}
                    fill={THEME.colors.routeBlue}
                  />
                </G>
              ) : null}

              {/* Active Navigation Step Marker */}
              {activeNode ? (
                <G>
                  <Circle
                    cx={activeNode.x}
                    cy={activeNode.y}
                    r={28}
                    fill="rgba(38, 117, 232, 0.3)"
                  />
                  <Circle
                    cx={activeNode.x}
                    cy={activeNode.y}
                    r={16}
                    fill={THEME.colors.card}
                    stroke={THEME.colors.routeBlue}
                    strokeWidth={3}
                  />
                  <Circle
                    cx={activeNode.x}
                    cy={activeNode.y}
                    r={10}
                    fill={THEME.colors.routeBlue}
                  />
                  <Circle
                    cx={activeNode.x}
                    cy={activeNode.y}
                    r={4}
                    fill={THEME.colors.card}
                  />
                </G>
              ) : null}

              {/* Destination Marker */}
              {hasDestinationOnThisFloor && selectedRoom ? (
                <G>
                  <Circle
                    cx={selectedRoom.coordinates.x}
                    cy={selectedRoom.coordinates.y - 20}
                    r={32}
                    fill="rgba(22, 139, 87, 0.25)"
                  />
                  {/* Pin shape */}
                  <Path
                    d={`M ${selectedRoom.coordinates.x} ${selectedRoom.coordinates.y} 
                        C ${selectedRoom.coordinates.x - 18} ${selectedRoom.coordinates.y - 20} 
                          ${selectedRoom.coordinates.x - 18} ${selectedRoom.coordinates.y - 42} 
                          ${selectedRoom.coordinates.x} ${selectedRoom.coordinates.y - 42} 
                        C ${selectedRoom.coordinates.x + 18} ${selectedRoom.coordinates.y - 42} 
                          ${selectedRoom.coordinates.x + 18} ${selectedRoom.coordinates.y - 20} 
                          ${selectedRoom.coordinates.x} ${selectedRoom.coordinates.y} Z`}
                    fill={THEME.colors.destinationGreen}
                  />
                  <Circle
                    cx={selectedRoom.coordinates.x}
                    cy={selectedRoom.coordinates.y - 28}
                    r={6}
                    fill={THEME.colors.card}
                  />
                  {/* Destination Label Pill */}
                  <Rect
                    x={selectedRoom.coordinates.x - 55}
                    y={selectedRoom.coordinates.y - 80}
                    width={110}
                    height={30}
                    rx={8}
                    fill={THEME.colors.primaryDark}
                  />
                  <SvgText
                    x={selectedRoom.coordinates.x}
                    y={selectedRoom.coordinates.y - 60}
                    fontSize={14}
                    fontWeight="bold"
                    fill={THEME.colors.card}
                    textAnchor="middle"
                  >
                    {selectedRoom.roomNumber}
                  </SvgText>
                </G>
              ) : null}
            </Svg>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={48} color={THEME.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Floor Plan Drawing Pending</Text>
            <Text style={styles.emptyDesc}>
              Reference drawing for Floor {floorInfo?.level} is pending verification from campus administration.
            </Text>
          </View>
        )}

        {/* Floating Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleResetZoom}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={16} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.startDot} />
          <Text style={styles.legendText}>You are here</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.routeLine} />
          <Text style={styles.legendText}>Route</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="location" size={14} color={THEME.colors.destinationGreen} />
          <Text style={styles.legendText}>Destination</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.liftBadge}>
            <Text style={styles.badgeText}>L</Text>
          </View>
          <Text style={styles.legendText}>Lift</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    overflow: 'hidden',
    ...THEME.shadows.subtle,
  },
  mapViewport: {
    height: MAP_CONTAINER_HEIGHT,
    backgroundColor: '#F9FAF9',
    overflow: 'hidden',
    position: 'relative',
  },
  transformContainer: {
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    position: 'absolute',
  },
  mapImage: {
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svgOverlay: {
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
  },
  emptyDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
    lineHeight: 18,
  },
  zoomControls: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    ...THEME.shadows.card,
  },
  zoomButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: THEME.colors.cardBorder,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.card,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.routeBlue,
  },
  routeLine: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.routeBlue,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  liftBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    color: THEME.colors.card,
    fontWeight: 'bold',
  },
});
