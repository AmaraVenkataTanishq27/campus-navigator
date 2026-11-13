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

export const LocationDetailScreen: React.FC = () => {
  const {
    selectedRoom,
    goBack,
    selectRoomAndNavigate,
    setActiveFloorLevel,
    navigate,
  } = useCampus();

  if (!selectedRoom) {
    return (
      <View style={styles.container}>
        <Header showBack={true} onBackPress={goBack} title="Location Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No location currently selected.</Text>
        </View>
      </View>
    );
  }

  const handleViewOnMap = () => {
    setActiveFloorLevel(selectedRoom.floorLevel);
    navigate('map');
  };

  const handleNavigateHere = () => {
    selectRoomAndNavigate(selectedRoom);
  };

  const isVerified = selectedRoom.status === 'verified';

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        onBackPress={goBack}
        title={selectedRoom.roomNumber}
        subtitle="Location Information"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Visual Preview Card */}
        <View style={styles.visualCard}>
          <View style={styles.photoViewport}>
            <Ionicons name="business" size={48} color={THEME.colors.primary} />
            <Text style={styles.roomTagBadge}>{selectedRoom.roomNumber}</Text>
          </View>
        </View>

        {/* Status Verification Badge */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              isVerified ? styles.statusVerified : styles.statusPending,
            ]}
          >
            <Ionicons
              name={isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={isVerified ? THEME.colors.destinationGreen : THEME.colors.cautionAmber}
            />
            <Text
              style={[
                styles.statusText,
                { color: isVerified ? THEME.colors.destinationGreen : THEME.colors.cautionAmber },
              ]}
            >
              {isVerified ? 'Verified Campus Floor Plan' : 'Provisional Assignment (Needs Field Confirmation)'}
            </Text>
          </View>
        </View>

        {/* Title and Department */}
        <View style={styles.headerSection}>
          <Text style={styles.titleText}>{selectedRoom.name}</Text>
          <Text style={styles.departmentText}>
            {selectedRoom.department || 'Academic Block (AB)'}
          </Text>
        </View>

        {/* Key Attributes Grid */}
        <View style={styles.attributesCard}>
          <View style={styles.attrRow}>
            <View style={styles.attrIconBadge}>
              <Ionicons name="business-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.attrInfo}>
              <Text style={styles.attrLabel}>Building</Text>
              <Text style={styles.attrValue}>Academic Block (AB)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.attrRow}>
            <View style={styles.attrIconBadge}>
              <Ionicons name="layers-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.attrInfo}>
              <Text style={styles.attrLabel}>Floor Level</Text>
              <Text style={styles.attrValue}>{selectedRoom.floorLevel}th Floor</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.attrRow}>
            <View style={styles.attrIconBadge}>
              <Ionicons name="bookmark-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.attrInfo}>
              <Text style={styles.attrLabel}>Category / Type</Text>
              <Text style={styles.attrValue}>
                {selectedRoom.category} • {selectedRoom.type}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.attrRow}>
            <View style={styles.attrIconBadge}>
              <Ionicons name="accessibility-outline" size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.attrInfo}>
              <Text style={styles.attrLabel}>Accessibility</Text>
              <Text style={styles.attrValue}>
                {selectedRoom.isAccessible ? 'Elevator & Ramp Accessible' : 'Stair Access Only'}
              </Text>
            </View>
          </View>
        </View>

        {/* Nearby Landmarks */}
        {selectedRoom.nearbyLandmarks.length > 0 ? (
          <View style={styles.landmarksSection}>
            <Text style={styles.sectionHeading}>Nearby Landmarks & Corridors</Text>
            <View style={styles.landmarkPillRow}>
              {selectedRoom.nearbyLandmarks.map((lm, idx) => (
                <View key={`lm_${idx}`} style={styles.landmarkPill}>
                  <Ionicons name="navigate-outline" size={14} color={THEME.colors.textSecondary} />
                  <Text style={styles.landmarkText}>{lm}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Primary Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={handleNavigateHere}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color={THEME.colors.card} />
            <Text style={styles.navigateButtonText}>Navigate Here</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleViewOnMap}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={20} color={THEME.colors.primary} />
            <Text style={styles.mapButtonText}>View on Floor Map</Text>
          </TouchableOpacity>
        </View>
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
  visualCard: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  photoViewport: {
    height: 160,
    backgroundColor: THEME.colors.sageLight,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  roomTagBadge: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: THEME.spacing.sm,
  },
  statusRow: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.round,
    gap: 6,
  },
  statusVerified: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF8E1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  departmentText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  attributesCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.subtle,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  attrIconBadge: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  attrInfo: {
    flex: 1,
  },
  attrLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  attrValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.cardBorder,
  },
  landmarksSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  landmarkPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  landmarkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.round,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  landmarkText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  navigateButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 16,
    gap: THEME.spacing.sm,
    ...THEME.shadows.card,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.card,
  },
  mapButton: {
    backgroundColor: THEME.colors.card,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 15,
    gap: THEME.spacing.sm,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
  },
});
