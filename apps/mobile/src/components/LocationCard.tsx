import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { RoomItem } from '../types';

interface LocationCardProps {
  room: RoomItem;
  onNavigatePress: (room: RoomItem) => void;
  onCardPress?: (room: RoomItem) => void;
  showDetails?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  room,
  onNavigatePress,
  onCardPress,
  showDetails = true,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={() => onCardPress?.(room)}
        activeOpacity={0.85}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="location" size={20} color={THEME.colors.destinationGreen} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.roomTitle}>{room.roomNumber}</Text>
            <Text style={styles.buildingSub}>{room.department || 'Academic Block (AB)'}</Text>
            <Text style={styles.floorSub}>
              Floor {room.floorLevel} • {room.type}
            </Text>
          </View>
          {room.hasPhotos ? (
            <View style={styles.photoContainer}>
              <View style={styles.doorMock}>
                <Ionicons name="image-outline" size={20} color={THEME.colors.textSecondary} />
                <Text style={styles.doorText}>{room.roomNumber}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {showDetails ? (
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={15} color={THEME.colors.textSecondary} />
              <Text style={styles.detailLabel}>Building:</Text>
              <Text style={styles.detailValue}>Academic Block (AB)</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="layers-outline" size={15} color={THEME.colors.textSecondary} />
              <Text style={styles.detailLabel}>Floor:</Text>
              <Text style={styles.detailValue}>{room.floorLevel}th Floor</Text>
            </View>
            {room.nearbyLandmarks.length > 0 ? (
              <View style={styles.detailRow}>
                <Ionicons name="navigate-circle-outline" size={15} color={THEME.colors.textSecondary} />
                <Text style={styles.detailLabel}>Nearby:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {room.nearbyLandmarks.join(', ')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => onNavigatePress(room)}
        activeOpacity={0.8}
      >
        <Text style={styles.navigateText}>Navigate to {room.roomNumber}</Text>
        <Ionicons name="arrow-forward" size={18} color={THEME.colors.card} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.lg,
    marginVertical: THEME.spacing.sm,
    ...THEME.shadows.card,
  },
  mainContent: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  buildingSub: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  floorSub: {
    fontSize: 12,
    color: THEME.colors.textTertiary,
    marginTop: 1,
  },
  photoContainer: {
    marginLeft: THEME.spacing.sm,
  },
  doorMock: {
    width: 60,
    height: 54,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.sageLight,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    gap: THEME.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  navigateButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    marginTop: THEME.spacing.md,
    gap: THEME.spacing.sm,
    ...THEME.shadows.subtle,
  },
  navigateText: {
    color: THEME.colors.card,
    fontSize: 15,
    fontWeight: '700',
  },
});
