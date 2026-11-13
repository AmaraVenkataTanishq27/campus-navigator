import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { FLOORS_CONFIG } from '../data/campusData';

interface FloorSelectorProps {
  activeFloorLevel: string;
  onSelectFloor: (level: string) => void;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({ activeFloorLevel, onSelectFloor }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FLOORS_CONFIG.map((floor) => {
          const isActive = floor.level === activeFloorLevel;
          const hasMap = floor.hasInteractiveMap;

          return (
            <TouchableOpacity
              key={floor.id}
              style={[
                styles.floorPill,
                isActive && styles.floorPillActive,
                !hasMap && styles.floorPillDisabled,
              ]}
              onPress={() => onSelectFloor(floor.level)}
              activeOpacity={0.7}
            >
              <Text style={[styles.floorText, isActive && styles.floorTextActive]}>
                {floor.level}
              </Text>
              {hasMap ? (
                <View style={[styles.statusDot, isActive && styles.statusDotActive]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.xs,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  floorPill: {
    minWidth: 40,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.sm,
    ...THEME.shadows.subtle,
  },
  floorPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  floorPillDisabled: {
    opacity: 0.6,
  },
  floorText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  floorTextActive: {
    color: THEME.colors.card,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.destinationGreen,
    marginTop: 2,
  },
  statusDotActive: {
    backgroundColor: THEME.colors.sage,
  },
});
