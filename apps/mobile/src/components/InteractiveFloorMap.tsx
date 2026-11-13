import React, { useState, useRef } from 'react';
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
}) => {
  const [scale, setScale] = useState<number>(0.95);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  const lastOffset = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        lastOffset.current = { x: translateX, y: translateY };
      },
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        setTranslateX(lastOffset.current.x + gestureState.dx);
        setTranslateY(lastOffset.current.y + gestureState.dy);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.7));
  };

  const handleResetZoom = () => {
    setScale(0.95);
    setTranslateX(0);
    setTranslateY(0);
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
      <View style={styles.mapViewport} {...panResponder.panHandlers}>
        {floorInfo?.hasInteractiveMap && floorInfo.referenceAsset ? (
          <View
            style={[
              styles.transformContainer,
              {
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
    top: -(ORIGINAL_HEIGHT - MAP_CONTAINER_HEIGHT) / 2,
    left: -(ORIGINAL_WIDTH - SCREEN_WIDTH) / 2,
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
