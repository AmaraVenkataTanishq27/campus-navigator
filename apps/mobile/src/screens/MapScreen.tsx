import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { FloorSelector } from '../components/FloorSelector';
import { InteractiveFloorMap } from '../components/InteractiveFloorMap';
import { CampusService } from '../services/campusService';

export const MapScreen: React.FC = () => {
  const {
    activeFloorLevel,
    setActiveFloorLevel,
    currentFloorInfo,
    selectedRoom,
    activeRoute,
    originNode,
    startNavigation,
    navigate,
    preferences,
    updatePreferences,
    recalculateRoute,
  } = useCampus();

  const floorRooms = CampusService.getRoomsByFloor(activeFloorLevel);

  const destinationLabel = selectedRoom ? selectedRoom.name : 'Select Destination';
  const originLabel = originNode ? originNode.label : 'Main Entrance (AB)';

  const handleStartNavigation = () => {
    startNavigation();
  };

  const toggleAvoidStairs = () => {
    updatePreferences({ avoidStairs: !preferences.avoidStairs });
    recalculateRoute();
  };

  return (
    <View style={styles.container}>
      <Header
        title={selectedRoom ? `Route to ${selectedRoom.roomNumber}` : 'Interactive Floor Map'}
        subtitle={`From: ${originLabel}`}
        showBack={true}
        onBackPress={() => navigate('home')}
        rightAction={
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigate('ar_camera')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Floor Switcher Pill Bar */}
        <View style={styles.floorBarSection}>
          <FloorSelector
            activeFloorLevel={activeFloorLevel}
            onSelectFloor={(lvl) => setActiveFloorLevel(lvl)}
          />
        </View>

        {/* Floor Verification Notice Banner */}
        {currentFloorInfo?.status !== 'verified' ? (
          <View style={styles.provisionalNotice}>
            <Ionicons name="information-circle-outline" size={16} color={THEME.colors.cautionAmber} />
            <Text style={styles.provisionalText}>
              Floor {activeFloorLevel} plan mapping is provisional and pending field confirmation.
            </Text>
          </View>
        ) : null}

        {/* Interactive Floor Map Canvas */}
        <View style={styles.mapSection}>
          <InteractiveFloorMap
            floorInfo={currentFloorInfo}
            rooms={floorRooms}
            route={activeRoute}
            selectedRoom={selectedRoom}
            startNode={originNode}
          />
        </View>

        {/* Preference Toggles (Avoid Stairs / Accessible) */}
        <View style={styles.preferencesRow}>
          <TouchableOpacity
            style={[
              styles.prefPill,
              preferences.avoidStairs && styles.prefPillActive,
            ]}
            onPress={toggleAvoidStairs}
            activeOpacity={0.7}
          >
            <Ionicons
              name={preferences.avoidStairs ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={preferences.avoidStairs ? THEME.colors.primary : THEME.colors.textSecondary}
            />
            <Text
              style={[
                styles.prefText,
                preferences.avoidStairs && styles.prefTextActive,
              ]}
            >
              Avoid Stairs (Elevator Only)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrPill}
            onPress={() => navigate('qr_scanner')}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.qrText}>Scan Location QR</Text>
          </TouchableOpacity>
        </View>

        {/* Route Summary & CTA Bar */}
        {activeRoute ? (
          <View style={styles.routeSummaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.walkingBadge}>
                <Ionicons name="walk" size={20} color={THEME.colors.primary} />
              </View>
              <View style={styles.summaryMetrics}>
                <Text style={styles.timeDistanceText}>
                  {activeRoute.estimatedTimeMinutes} min ({activeRoute.totalDistanceMeters} m)
                </Text>
                <Text style={styles.viaText}>
                  via East Corridor • Floor {activeRoute.startFloor}
                  {activeRoute.transitsFloors ? ` to Floor ${activeRoute.endFloor}` : ''}
                </Text>
              </View>
              {activeRoute.isDemonstration ? (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>DEMO</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartNavigation}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color={THEME.colors.card} />
              <Text style={styles.startButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectPromptCard}>
            <Text style={styles.promptTitle}>Ready to Navigate</Text>
            <Text style={styles.promptSub}>
              Search for a room or tap on the map to calculate the shortest path.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigate('search')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Search Destination</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorBarSection: {
    paddingTop: THEME.spacing.xs,
  },
  provisionalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    gap: 8,
  },
  provisionalText: {
    fontSize: 12,
    color: '#795548',
    fontWeight: '600',
    flex: 1,
  },
  mapSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
  },
  preferencesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  prefPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.round,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
  },
  prefPillActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.sageLight,
  },
  prefText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  prefTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  qrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.round,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  qrText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  routeSummaryCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    ...THEME.shadows.card,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  walkingBadge: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  summaryMetrics: {
    flex: 1,
  },
  timeDistanceText: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  viaText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  demoBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E65100',
  },
  startButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: THEME.spacing.sm,
    ...THEME.shadows.subtle,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.card,
  },
  selectPromptCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    ...THEME.shadows.subtle,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  promptSub: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  browseButton: {
    marginTop: THEME.spacing.md,
    backgroundColor: THEME.colors.sageLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
});
